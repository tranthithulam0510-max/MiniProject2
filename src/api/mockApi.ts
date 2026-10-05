import dayjs from "dayjs";
import { getCurrentUserId, getDb } from "@/db/database";
import { hashPassword, verifyPassword } from "@/utils/password";
import {
  AreaRange,
  Booking,
  BookingRange,
  FilterState,
  Room,
  RoomAmenity,
  UserProfile,
} from "@/types/room";
import { normalizeText } from "@/utils/text";

/**
 * Data layer backed by the local SQLite database (src/db/database.ts).
 * (File name kept as mockApi.ts so existing imports keep working.)
 */

const todayISO = () => dayjs().format("YYYY-MM-DD");

// A room is "occupied" for [start, end) when a confirmed booking overlaps it:
//   b.start < end  AND  start < b.end
// Placeholders: (end, start)
const OCCUPIED_SQL = `EXISTS (
  SELECT 1 FROM bookings b
  WHERE b.room_id = r.id AND b.status = 'confirmed'
    AND b.start_date < ? AND ? < b.end_date
)`;

const AREA_SQL: Record<AreaRange, string> = {
  small: "r.area_m2 < 30",
  medium: "r.area_m2 >= 30 AND r.area_m2 <= 50",
  large: "r.area_m2 > 50",
};

interface RoomRow {
  id: string;
  name: string;
  city: string;
  area_m2: number;
  price_per_night: number;
  rating: number;
  reviews: number;
  rooms_left: number;
  guests: number;
  amenities: string;
  has_city_view: number;
  has_pool: number;
  image_color: string;
  image_url: string;
  favorite: number;
  description: string;
  occupied: number;
}

function mapRoom(row: RoomRow): Room {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    areaM2: row.area_m2,
    status: row.occupied ? "occupied" : "available",
    pricePerNight: row.price_per_night,
    rating: row.rating,
    reviews: row.reviews,
    roomsLeft: row.rooms_left,
    guests: row.guests,
    amenities: JSON.parse(row.amenities) as RoomAmenity[],
    hasCityView: !!row.has_city_view,
    hasPool: !!row.has_pool,
    imageColor: row.image_color,
    imageUrl: row.image_url,
    favorite: !!row.favorite,
    description: row.description,
  };
}

/** Range used to compute Available/Occupied: chosen dates, otherwise tonight. */
function statusRange(f: Pick<FilterState, "startDate" | "endDate">) {
  if (f.startDate && f.endDate) return { start: f.startDate, end: f.endDate };
  const t = todayISO();
  return { start: t, end: dayjs(t).add(1, "day").format("YYYY-MM-DD") };
}

// ---- Rooms ----------------------------------------------------------------

export async function fetchRooms(filters: FilterState): Promise<Room[]> {
  const db = await getDb();
  const { start, end } = statusRange(filters);

  const where: string[] = [];
  const params: (string | number)[] = [];

  const q = normalizeText(filters.query);
  if (q) {
    where.push("r.search_text LIKE ?");
    params.push(`%${q}%`);
  }
  if (filters.guests != null) {
    where.push("r.guests >= ?");
    params.push(filters.guests);
  }
  if (filters.maxPrice != null) {
    where.push("r.price_per_night <= ?");
    params.push(filters.maxPrice);
  }
  if (filters.cityViewOnly) where.push("r.has_city_view = 1");
  if (filters.poolOnly) where.push("r.has_pool = 1");
  if (filters.areaRange) where.push(`(${AREA_SQL[filters.areaRange]})`);
  if (filters.status) {
    where.push(filters.status === "occupied" ? OCCUPIED_SQL : `NOT ${OCCUPIED_SQL}`);
    params.push(end, start);
  }

  const sql = `
    SELECT r.*, ${OCCUPIED_SQL} AS occupied
    FROM rooms r
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY r.idx`;

  // SELECT placeholders come first, then the WHERE ones.
  const rows = await db.getAllAsync<RoomRow>(sql, [end, start, ...params]);
  return rows.map(mapRoom);
}

export async function fetchRoomById(id: string): Promise<Room | undefined> {
  const db = await getDb();
  const { start, end } = statusRange({ startDate: null, endDate: null });
  const row = await db.getFirstAsync<RoomRow>(
    `SELECT r.*, ${OCCUPIED_SQL} AS occupied FROM rooms r WHERE r.id = ?`,
    [end, start, id]
  );
  return row ? mapRoom(row) : undefined;
}

/** Best-rated rooms that are free tonight (home screen "Phòng nổi bật"). */
export async function fetchFeaturedRooms(limit = 6): Promise<Room[]> {
  const db = await getDb();
  const { start, end } = statusRange({ startDate: null, endDate: null });
  const rows = await db.getAllAsync<RoomRow>(
    `SELECT r.*, 0 AS occupied FROM rooms r
     WHERE NOT ${OCCUPIED_SQL}
     ORDER BY r.rating DESC, r.reviews DESC
     LIMIT ?`,
    [end, start, limit]
  );
  return rows.map(mapRoom);
}

// ---- Availability / booked ranges -----------------------------------------

export async function fetchBookedRanges(roomId: string): Promise<BookingRange[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ start_date: string; end_date: string }>(
    `SELECT start_date, end_date FROM bookings
     WHERE room_id = ? AND status = 'confirmed' AND end_date >= ?
     ORDER BY start_date`,
    [roomId, todayISO()]
  );
  return rows.map((r) => ({ start: r.start_date, end: r.end_date }));
}

// ---- Bookings ---------------------------------------------------------------

export interface CreateBookingPayload {
  roomId: string;
  roomName: string;
  pricePerNight: number;
  guests: number;
  range: BookingRange;
  nights: number;
  total: number;
}

export class BookingConflictError extends Error {
  status = 409 as const;
  constructor(message = "Phòng đã được đặt trong khoảng thời gian này.") {
    super(message);
    this.name = "BookingConflictError";
  }
}

const bookingCode = (n: number) => `BK${String(n).padStart(5, "0")}`;
const bookingNumber = (code: string) => Number(code.replace(/^BK/, ""));

/**
 * Two people booking the same room at the same time:
 *   FIRST COMMIT WINS. The overlap check and the INSERT run inside ONE
 *   exclusive SQLite transaction, so writes are serialised: whoever gets in
 *   first is saved, the second one re-checks, sees the new row and gets a
 *   BookingConflictError (409).
 */
export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const { start, end } = payload.range;
  if (!(start < end)) throw new Error("Khoảng ngày không hợp lệ.");
  if (start < todayISO()) throw new Error("Không thể đặt phòng trong quá khứ.");

  const db = await getDb();
  const createdAt = new Date().toISOString();
  let newId = 0;

  await db.withExclusiveTransactionAsync(async (txn) => {
    const room = await txn.getFirstAsync<{ price_per_night: number; guests: number }>(
      "SELECT price_per_night, guests FROM rooms WHERE id = ?",
      [payload.roomId]
    );
    if (!room) throw new Error("Phòng không tồn tại.");
    if (payload.guests > room.guests) throw new Error(`Phòng chỉ chứa tối đa ${room.guests} người.`);

    const clash = await txn.getFirstAsync(
      `SELECT 1 FROM bookings
       WHERE room_id = ? AND status = 'confirmed' AND start_date < ? AND ? < end_date
       LIMIT 1`,
      [payload.roomId, end, start]
    );
    if (clash) throw new BookingConflictError();

    const res = await txn.runAsync(
      `INSERT INTO bookings (room_id, user_id, start_date, end_date, guests, nights,
         price_per_night, total, status, created_at)
       VALUES (?,?,?,?,?,?,?,?,'confirmed',?)`,
      [
        payload.roomId, getCurrentUserId(), start, end, payload.guests, payload.nights,
        room.price_per_night, payload.total, createdAt,
      ]
    );
    newId = res.lastInsertRowId;
  });

  return {
    id: bookingCode(newId),
    roomId: payload.roomId,
    roomName: payload.roomName,
    pricePerNight: payload.pricePerNight,
    guests: payload.guests,
    range: payload.range,
    nights: payload.nights,
    total: payload.total,
    createdAt,
    status: "upcoming",
  };
}

interface BookingRow {
  id: number;
  room_id: string;
  room_name: string;
  image_url: string;
  city: string;
  start_date: string;
  end_date: string;
  guests: number;
  nights: number;
  price_per_night: number;
  total: number;
  status: "confirmed" | "cancelled";
  created_at: string;
}

export async function fetchMyBookings(): Promise<Booking[]> {
  const db = await getDb();
  const today = todayISO();
  const rows = await db.getAllAsync<BookingRow>(
    `SELECT b.*, r.name AS room_name, r.image_url, r.city
     FROM bookings b JOIN rooms r ON r.id = b.room_id
     WHERE b.user_id = ?
     ORDER BY b.start_date DESC`,
    [getCurrentUserId()]
  );

  const list: Booking[] = rows.map((r) => ({
    id: bookingCode(r.id),
    roomId: r.room_id,
    roomName: r.room_name,
    pricePerNight: r.price_per_night,
    guests: r.guests,
    range: { start: r.start_date, end: r.end_date },
    nights: r.nights,
    total: r.total,
    createdAt: r.created_at,
    imageUrl: r.image_url,
    city: r.city,
    status: r.status === "cancelled" ? "cancelled" : r.end_date < today ? "past" : "upcoming",
  }));

  // upcoming first (soonest first), then past / cancelled (latest first)
  const upcoming = list.filter((b) => b.status === "upcoming").reverse();
  return [...upcoming, ...list.filter((b) => b.status !== "upcoming")];
}

export async function cancelBooking(id: string): Promise<void> {
  const db = await getDb();
  const res = await db.runAsync(
    `UPDATE bookings SET status = 'cancelled'
     WHERE id = ? AND user_id = ? AND status = 'confirmed' AND end_date >= ?`,
    [bookingNumber(id), getCurrentUserId(), todayISO()]
  );
  if (res.changes === 0) throw new Error("Không thể huỷ đặt chỗ này.");
}

// ---- Profile -----------------------------------------------------------------

export async function fetchProfile(): Promise<UserProfile> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    id: number; name: string; email: string; phone: string; member_since: string;
  }>("SELECT * FROM users WHERE id = ?", [getCurrentUserId()]);
  if (!row) throw new Error("Không tìm thấy hồ sơ.");
  return { id: row.id, name: row.name, email: row.email, phone: row.phone, memberSince: row.member_since };
}

export async function updateProfile(
  p: Pick<UserProfile, "name" | "email" | "phone">
): Promise<UserProfile> {
  const name = p.name.trim();
  const email = p.email.trim();
  if (!name) throw new Error("Vui lòng nhập họ tên.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Email không hợp lệ.");

  const db = await getDb();
  const taken = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM users WHERE email = ? AND id <> ?",
    [email, getCurrentUserId()]
  );
  if (taken) throw new Error("Email này đã được sử dụng.");
  await db.runAsync("UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?", [
    name, email, p.phone.trim(), getCurrentUserId(),
  ]);
  return fetchProfile();
}


// ---- Auth --------------------------------------------------------------------

type UserRow = {
  id: number; name: string; email: string; phone: string; member_since: string; password: string;
};

function rowToProfile(row: UserRow): UserProfile {
  return { id: row.id, name: row.name, email: row.email, phone: row.phone, memberSince: row.member_since };
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Đăng nhập bằng email + mật khẩu. Trả về hồ sơ người dùng. */
export async function loginUser(emailInput: string, password: string): Promise<UserProfile> {
  const email = emailInput.trim();
  if (!email || !password) throw new Error("Vui lòng nhập email và mật khẩu.");

  const db = await getDb();
  const row = await db.getFirstAsync<UserRow>("SELECT * FROM users WHERE email = ?", [email]);
  // Cùng một thông báo cho "sai email" và "sai mật khẩu".
  if (!row || !(await verifyPassword(password, row.password))) {
    throw new Error("Email hoặc mật khẩu không đúng.");
  }
  return rowToProfile(row);
}

/** Đăng ký tài khoản mới (tự đăng nhập sau khi đăng ký). */
export async function registerUser(p: {
  name: string; email: string; phone: string; password: string;
}): Promise<UserProfile> {
  const name = p.name.trim();
  const email = p.email.trim();
  if (!name) throw new Error("Vui lòng nhập họ tên.");
  if (!EMAIL_RE.test(email)) throw new Error("Email không hợp lệ.");
  if (p.password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");

  const db = await getDb();
  const existed = await db.getFirstAsync<{ id: number }>("SELECT id FROM users WHERE email = ?", [email]);
  if (existed) throw new Error("Email này đã được đăng ký.");

  const res = await db.runAsync(
    "INSERT INTO users (name, email, phone, member_since, password) VALUES (?,?,?,?,?)",
    [name, email, p.phone.trim(), todayISO(), await hashPassword(p.password)]
  );
  const row = await db.getFirstAsync<UserRow>("SELECT * FROM users WHERE id = ?", [res.lastInsertRowId]);
  if (!row) throw new Error("Không tạo được tài khoản, vui lòng thử lại.");
  return rowToProfile(row);
}

/** Kiểm tra phiên đã lưu còn hợp lệ không (tài khoản vẫn tồn tại trong database). */
export async function userExists(id: number): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM users WHERE id = ? AND password <> ''",
    [id]
  );
  return !!row;
}
