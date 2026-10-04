import * as SQLite from "expo-sqlite";
import dayjs from "dayjs";
import { MOCK_ROOMS } from "@/data/mockRooms";
import { normalizeText } from "@/utils/text";

/**
 * Local SQLite database (persists between app launches).
 *
 *  users    - the logged-in user (id = 1) + a "other guest" (id = 2)
 *  rooms    - 520 seeded rooms (image, location, size, price ...)
 *  bookings - confirmed / cancelled bookings, dates as yyyy-mm-dd
 *
 * Room status (available / occupied) is NOT stored: it is derived from the
 * bookings table for the date range being looked at.
 */

export const CURRENT_USER_ID = 1;
const OTHER_USER_ID = 2;
const DB_NAME = "roombooking.db";
const SCHEMA_VERSION = 2;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = init().catch((e) => {
      dbPromise = null; // allow retry
      throw e;
    });
  }
  return dbPromise;
}

async function init() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  if ((row?.user_version ?? 0) < SCHEMA_VERSION) {
    await createSchema(db);
    await seed(db);
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }
  return db;
}

async function createSchema(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    DROP TABLE IF EXISTS bookings;
    DROP TABLE IF EXISTS rooms;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
      id           INTEGER PRIMARY KEY,
      name         TEXT NOT NULL,
      email        TEXT NOT NULL,
      phone        TEXT NOT NULL DEFAULT '',
      member_since TEXT NOT NULL
    );

    CREATE TABLE rooms (
      id              TEXT PRIMARY KEY,
      idx             INTEGER NOT NULL,
      name            TEXT NOT NULL,
      city            TEXT NOT NULL,
      search_text     TEXT NOT NULL,
      area_m2         INTEGER NOT NULL,
      price_per_night INTEGER NOT NULL,
      rating          REAL NOT NULL,
      reviews         INTEGER NOT NULL,
      rooms_left      INTEGER NOT NULL,
      guests          INTEGER NOT NULL,
      amenities       TEXT NOT NULL,
      has_city_view   INTEGER NOT NULL,
      has_pool        INTEGER NOT NULL,
      image_color     TEXT NOT NULL,
      image_url       TEXT NOT NULL,
      favorite        INTEGER NOT NULL DEFAULT 0,
      description     TEXT NOT NULL
    );

    CREATE TABLE bookings (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id         TEXT NOT NULL REFERENCES rooms(id),
      user_id         INTEGER NOT NULL REFERENCES users(id),
      start_date      TEXT NOT NULL,
      end_date        TEXT NOT NULL,
      guests          INTEGER NOT NULL,
      nights          INTEGER NOT NULL,
      price_per_night INTEGER NOT NULL,
      total           INTEGER NOT NULL,
      status          TEXT NOT NULL DEFAULT 'confirmed'
                      CHECK (status IN ('confirmed','cancelled')),
      created_at      TEXT NOT NULL,
      CHECK (start_date < end_date)
    );

    -- Indexes: these keep multi-parameter filtering fast on 500+ rooms.
    CREATE INDEX idx_rooms_area    ON rooms(area_m2);
    CREATE INDEX idx_rooms_price   ON rooms(price_per_night);
    CREATE INDEX idx_rooms_guests  ON rooms(guests);
    CREATE INDEX idx_rooms_rating  ON rooms(rating DESC);
    CREATE INDEX idx_bookings_room ON bookings(room_id, status, start_date, end_date);
    CREATE INDEX idx_bookings_user ON bookings(user_id, start_date);
  `);
}

async function seed(db: SQLite.SQLiteDatabase) {
  const today = dayjs();
  const d = (n: number) => today.add(n, "day").format("YYYY-MM-DD");

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "INSERT INTO users (id, name, email, phone, member_since) VALUES (?,?,?,?,?)",
      [CURRENT_USER_ID, "Thu Lam", "thulam@example.com", "0900 000 000", "2026-01-01"]
    );
    await db.runAsync(
      "INSERT INTO users (id, name, email, phone, member_since) VALUES (?,?,?,?,?)",
      [OTHER_USER_ID, "Khách khác", "guest@example.com", "", "2026-01-01"]
    );

    const roomStmt = await db.prepareAsync(
      `INSERT INTO rooms (id, idx, name, city, search_text, area_m2, price_per_night, rating,
         reviews, rooms_left, guests, amenities, has_city_view, has_pool, image_color,
         image_url, favorite, description)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    );
    try {
      for (let i = 0; i < MOCK_ROOMS.length; i++) {
        const r = MOCK_ROOMS[i];
        await roomStmt.executeAsync([
          r.id,
          i,
          r.name,
          r.city,
          normalizeText(`${r.name} ${r.city}`),
          r.areaM2,
          r.pricePerNight,
          r.rating,
          r.reviews,
          r.roomsLeft,
          r.guests,
          JSON.stringify(r.amenities),
          r.hasCityView ? 1 : 0,
          r.hasPool ? 1 : 0,
          r.imageColor,
          r.imageUrl,
          r.favorite ? 1 : 0,
          r.description,
        ]);
      }
    } finally {
      await roomStmt.finalizeAsync();
    }

    // Bookings made by "other guests" so the calendar / Occupied badge have data.
    const bkStmt = await db.prepareAsync(
      `INSERT INTO bookings (room_id, user_id, start_date, end_date, guests, nights,
         price_per_night, total, status, created_at)
       VALUES (?,?,?,?,?,?,?,?,'confirmed',?)`
    );
    try {
      const add = async (idx: number, start: string, end: string) => {
        const r = MOCK_ROOMS[idx];
        const nights = dayjs(end).diff(dayjs(start), "day");
        await bkStmt.executeAsync([
          r.id, OTHER_USER_ID, start, end, 1, nights,
          r.pricePerNight, r.pricePerNight * nights, new Date().toISOString(),
        ]);
      };
      for (let i = 0; i < 40; i++) {
        await add(i, d(4), d(7));
        await add(i, d(16), d(19));
      }
      // Some rooms are occupied tonight -> visible "Occupied" badges right away.
      for (let i = 0; i < MOCK_ROOMS.length; i++) {
        if (i % 6 === 0 && i >= 40) await add(i, d(-1), d(2));
      }
    } finally {
      await bkStmt.finalizeAsync();
    }
  });
}
