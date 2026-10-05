import { Room, RoomAmenity } from "@/types/room";

const NAMES = [
  "Phòng Học Nhóm",
  "Phòng Tự Học Yên Tĩnh",
  "Phòng Thảo Luận",
  "Phòng Seminar",
  "Phòng Học Đa Phương Tiện",
  "Phòng Họp Nhỏ",
  "Phòng Thuyết Trình",
  "Phòng Máy Tính",
  "Phòng Ôn Thi",
  "Phòng Self-study",
  "Phòng Làm Đồ Án",
  "Phòng Học Ngôn Ngữ",
];

// Vị trí (tòa nhà / khu) - vẫn lưu trong trường `city` để không phải sửa logic tìm kiếm
const CITIES = ["Tòa A", "Tòa B", "Tòa C", "Thư viện", "Khu D", "Khu E"];

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

// Ảnh phòng học (link công khai)
const IMAGE_URLS = [
  "https://i.pinimg.com/1200x/1c/97/20/1c9720071796dcbe8300080f7c9f2734.jpg",
  "https://i.pinimg.com/736x/75/38/c7/7538c78074fb6bd7990068398d371a03.jpg",
  "https://i.pinimg.com/1200x/94/ac/f0/94acf04d57d4ede0bfb9060221ea973f.jpg",
  "https://i.pinimg.com/736x/71/7f/11/717f11afdcbf5ac78a2226a993245010.jpg",
  "https://i.pinimg.com/1200x/9b/9c/66/9b9c66ab9d64eec9499c044e115e9dd9.jpg",
  "https://i.pinimg.com/736x/ba/db/4f/badb4fec5061fbfc55dd3a4cf2c1e8ca.jpg",
  "https://i.pinimg.com/736x/c8/cc/84/c8cc8427f78002791867cb92554c9683.jpg",
  "https://i.pinimg.com/736x/6f/01/9e/6f019ecb4b247f60b7e3f5fd2bf3152f.jpg",
  "https://i.pinimg.com/1200x/d4/ed/07/d4ed0781beaf1b275d1f0bc2854725c8.jpg",
  "https://i.pinimg.com/1200x/8d/e4/59/8de459f6e3f02655d04f5c9ecc24e044.jpg",
  "https://i.pinimg.com/736x/4c/bb/2a/4cbb2a6e37269731764f050fbe5fb78b.jpg",
];

function roomImageUrl(index: number) {
  return IMAGE_URLS[index % IMAGE_URLS.length];
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

export type SeedRoom = Omit<Room, "status">;

function generateRooms(count: number): SeedRoom[] {
  const rand = mulberry32(42);
  const rooms: SeedRoom[] = [];

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
    const guests = [2, 4, 6, 8, 10][Math.floor(rand() * 5)];
    const price = Math.round((50_000 + rand() * 250_000) / 10_000) * 10_000; // 50k - 300k / ngày

    rooms.push({
      id: `room-${i + 1}`,
      name: `${name} #${i + 1}`,
      city,
      // deterministic size (does not touch the PRNG sequence)
      areaM2: 10 + guests * 4 + ((i * 7) % 10),
      pricePerNight: price,
      rating: Math.round((3.8 + rand() * 1.2) * 10) / 10,
      reviews: Math.floor(20 + rand() * 480),
      roomsLeft: Math.floor(1 + rand() * 6),
      guests,
      amenities: Array.from(amenities),
      hasCityView,
      hasPool,
      imageColor: IMAGE_COLORS[Math.floor(rand() * IMAGE_COLORS.length)],
      imageUrl: roomImageUrl(i),
      favorite: rand() > 0.85,
      description:
        "Phòng học yên tĩnh, đầy đủ bàn ghế, ổ cắm điện và Wi-Fi tốc độ cao, phù hợp học nhóm, thảo luận và ôn thi.",
    });
  }
  return rooms;
}

export const MOCK_ROOMS: SeedRoom[] = generateRooms(520);