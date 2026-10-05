import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { Room } from "@/types/room";

interface BookingDraftStore {
  room: Room | null;
  startDate: string | null; // ISO yyyy-mm-dd
  endDate: string | null;
  guests: number;
  breakfast: boolean; // "Nước uống" add-on
  setRoom: (room: Room) => void;
  setRange: (start: string | null, end: string | null) => void;
  setGuests: (guests: number) => void;
  setBreakfast: (value: boolean) => void;
  clear: () => void;
}

const EMPTY = { room: null, startDate: null, endDate: null, guests: 2, breakfast: true };

/**
 * Bản nháp đặt phòng. Được lưu vào AsyncStorage nên:
 *  - đi qua lại giữa các màn hình/tab vẫn còn,
 *  - tắt hẳn app mở lại vẫn còn (cho đến khi đặt xong hoặc đổi sang phòng khác).
 */
export const useBookingDraftStore = create<BookingDraftStore>()(
  persist(
    (set) => ({
      ...EMPTY,
      // Chọn phòng khác -> bỏ ngày/số người của phòng cũ; cùng phòng -> giữ nguyên.
      setRoom: (room) =>
        set((s) => (s.room?.id === room.id ? { room } : { ...EMPTY, room })),
      setRange: (startDate, endDate) => set({ startDate, endDate }),
      setGuests: (guests) => set({ guests }),
      setBreakfast: (breakfast) => set({ breakfast }),
      clear: () => set({ ...EMPTY }),
    }),
    {
      name: "booking-draft-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        room: s.room,
        startDate: s.startDate,
        endDate: s.endDate,
        guests: s.guests,
        breakfast: s.breakfast,
      }),
      // Ngày nháp đã qua thì bỏ đi khi mở lại app.
      onRehydrateStorage: () => (state) => {
        if (state?.startDate && dayjs(state.startDate).isBefore(dayjs(), "day")) {
          state.setRange(null, null);
        }
      },
    }
  )
);
