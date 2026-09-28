import { Room, RoomAmenity } from "@/types/room";

const NAMES = [
  "Deluxe City View",
  "Royal Navy Suite",
  "Grey Executive",
  "Galaxy Sky Suite",
  "Grand Balcony Suite",
  "Ocean Breeze Room",
  "Sunset Garden Villa",
  "Panorama Loft",
  "Emerald Family Suite",
  "Skyline Studio",
  "Harbor View Room",
  "Zen Pool Bungalow",
];

const CITIES = ["Đà Nẵng", "Hà Nội", "Hồ Chí Minh", "Hội An", "Nha Trang", "Đà Lạt"];

const AMENITY_POOL: RoomAmenity[] = [
  "wifi",
  "breakfast",
  "balcony",
  "pool",
  "aircon",
  "smarttv",
  "cityview",
];

const IMAGE_COLORS = ["#3B4E76", "#4A3B6B", "#2E5A55", "#6B4A3B", "#3B5F6B"];

// Ảnh phòng khách sạn thật, miễn phí bản quyền (Unsplash License)
const IMAGE_IDS = [
  "photo-1527530462287-d0438a5819fe",
  "photo-1631049421450-348ccd7f8949",
  "photo-1702255489644-392758161f1f",
  "photo-1680210851458-b7dc5685e06e",
  "photo-1633836331520-e35c668f1f9d",
];

function roomImageUrl(id: string) {
  return `https://images.unsplash.com/${id}?w=600&h=450&fit=crop&auto=format&q=70`;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateRooms(count: number): Room[] {
  const rand = mulberry32(42);
  const rooms: Room[] = [];

  for (let i = 0; i < count; i++) {
    const name = NAMES[Math.floor(rand() * NAMES.length)];
    const city = CITIES[Math.floor(rand() * CITIES.length)];
    const amenityCount = 2 + Math.floor(rand() * 4);
    const amenities = new Set<RoomAmenity>();
    while (amenities.size < amenityCount) {
      amenities.add(AMENITY_POOL[Math.floor(rand() * AMENITY_POOL.length)]);
    }
    const hasCityView = amenities.has("cityview");
    const hasPool = amenities.has("pool");
    const guests = [1, 2, 3, 4, 6][Math.floor(rand() * 5)];
    const price = Math.round((800_000 + rand() * 5_200_000) / 10_000) * 10_000;

    rooms.push({
      id: `room-${i + 1}`,
      name: `${name} #${i + 1}`,
      city,
      pricePerNight: price,
      rating: Math.round((3.8 + rand() * 1.2) * 10) / 10,
      reviews: Math.floor(20 + rand() * 480),
      roomsLeft: Math.floor(1 + rand() * 6),
      guests,
      amenities: Array.from(amenities),
      hasCityView,
      hasPool,
      imageColor: IMAGE_COLORS[Math.floor(rand() * IMAGE_COLORS.length)],
      imageUrl: roomImageUrl(IMAGE_IDS[i % IMAGE_IDS.length]),
      favorite: rand() > 0.85,
      description:
        "Không gian hiện đại, view thoáng, đầy đủ tiện nghi cho kỳ nghỉ trong mơ chỉ cách một chạm.",
    });
  }
  return rooms;
}

export const MOCK_ROOMS: Room[] = generateRooms(520);