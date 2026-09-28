export type RoomAmenity =
  | "wifi"
  | "breakfast"
  | "balcony"
  | "pool"
  | "aircon"
  | "smarttv"
  | "cityview";

export interface Room {
  id: string;
  name: string;
  city: string;
  pricePerNight: number; // VND
  rating: number;
  reviews: number;
  roomsLeft: number;
  guests: number; // max guests
  amenities: RoomAmenity[];
  hasCityView: boolean;
  hasPool: boolean;
  imageColor: string; // fallback swatch color while the photo loads
  imageUrl: string; // remote photo URL
  favorite: boolean;
  description: string;
}

export interface BookingRange {
  start: string; // ISO date yyyy-mm-dd
  end: string; // ISO date yyyy-mm-dd
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  pricePerNight: number;
  guests: number;
  range: BookingRange;
  nights: number;
  total: number;
  createdAt: string;
  status: "upcoming" | "past" | "cancelled";
}

export interface FilterState {
  query: string;
  guests: number | null; // e.g. 2
  maxPrice: number | null; // e.g. 10_000_000
  cityViewOnly: boolean;
  poolOnly: boolean;
}