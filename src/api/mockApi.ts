import { MOCK_ROOMS } from "@/data/mockRooms";
import { Booking, BookingRange, FilterState, Room } from "@/types/room";
import { rangesOverlap } from "@/utils/dateOverlap";

function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ---- In-memory "server" state -------------------------------------------

// Pre-seeded booked ranges per room, so the calendar screen has something
// to lock out (mirrors the greyed-out days in the mockup).
const serverBookedRanges: Record<string, BookingRange[]> = {};
for (const room of MOCK_ROOMS.slice(0, 40)) {
  serverBookedRanges[room.id] = [
    { start: "2026-10-08", end: "2026-10-11" },
    { start: "2026-10-20", end: "2026-10-23" },
  ];
}

let serverBookings: Booking[] = [];
let bookingSeq = 1;

// ---- Rooms ----------------------------------------------------------------

export async function fetchRooms(filters: FilterState): Promise<Room[]> {
  await delay(null, 450);

  const q = filters.query.trim().toLowerCase();

  return MOCK_ROOMS.filter((room) => {
    if (q && !room.name.toLowerCase().includes(q) && !room.city.toLowerCase().includes(q)) {
      return false;
    }
    if (filters.guests != null && room.guests < filters.guests) return false;
    if (filters.maxPrice != null && room.pricePerNight > filters.maxPrice) return false;
    if (filters.cityViewOnly && !room.hasCityView) return false;
    if (filters.poolOnly && !room.hasPool) return false;
    return true;
  });
}

export async function fetchRoomById(id: string): Promise<Room | undefined> {
  await delay(null, 250);
  return MOCK_ROOMS.find((r) => r.id === id);
}

// ---- Availability / booked ranges -----------------------------------------

export async function fetchBookedRanges(roomId: string): Promise<BookingRange[]> {
  await delay(null, 350);
  return serverBookedRanges[roomId] ?? [];
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

/**
 * Simulates a real backend: re-checks the range against the current server
 * state at confirm-time. About 1 in 6 confirmations also gets a "someone
 * else just booked it" race injected, so the 409 / conflict-handling path
 * (Mini-Project requirement: "Xử lý 2 người đặt cùng lúc") is reachable
 * without needing two physical devices.
 */
export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  await delay(null, 700);

  const existing = serverBookedRanges[payload.roomId] ?? [];
  const raceInjected = Math.random() < 1 / 6;

  const conflict =
    existing.some((r) => rangesOverlap(payload.range, r)) ||
    (raceInjected &&
      // Pretend another user booked the exact same range a moment ago.
      true);

  if (conflict) {
    // Persist the "other user's" booking so the calendar reflects it on retry.
    serverBookedRanges[payload.roomId] = [...existing, payload.range];
    throw new BookingConflictError();
  }

  serverBookedRanges[payload.roomId] = [...existing, payload.range];

  const booking: Booking = {
    id: `bk-${bookingSeq++}`,
    roomId: payload.roomId,
    roomName: payload.roomName,
    pricePerNight: payload.pricePerNight,
    guests: payload.guests,
    range: payload.range,
    nights: payload.nights,
    total: payload.total,
    createdAt: new Date().toISOString(),
    status: "upcoming",
  };
  serverBookings = [booking, ...serverBookings];
  return booking;
}

export async function fetchMyBookings(): Promise<Booking[]> {
  await delay(null, 300);
  return serverBookings;
}
