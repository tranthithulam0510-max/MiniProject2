import { create } from "zustand";
import { Room } from "@/types/room";

interface BookingDraftStore {
  room: Room | null;
  startDate: string | null; // ISO yyyy-mm-dd
  endDate: string | null;
  guests: number;
  setRoom: (room: Room) => void;
  setRange: (start: string | null, end: string | null) => void;
  setGuests: (guests: number) => void;
  clear: () => void;
}

export const useBookingDraftStore = create<BookingDraftStore>((set) => ({
  room: null,
  startDate: null,
  endDate: null,
  guests: 2,
  setRoom: (room) => set({ room }),
  setRange: (startDate, endDate) => set({ startDate, endDate }),
  setGuests: (guests) => set({ guests }),
  clear: () => set({ room: null, startDate: null, endDate: null, guests: 2 }),
}));
