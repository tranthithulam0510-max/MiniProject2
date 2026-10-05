import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCurrentUserId } from "@/db/database";
import { queryClient } from "@/lib/queryClient";
import { useBookingDraftStore } from "@/store/bookingDraftStore";

interface AuthStore {
  /** id người dùng đang đăng nhập, null nếu chưa đăng nhập */
  userId: number | null;
  signIn: (userId: number) => void;
  signOut: () => void;
}

/**
 * Phiên đăng nhập. Được lưu vào AsyncStorage nên tắt app mở lại vẫn đăng nhập
 * (cho đến khi bấm Đăng xuất).
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      userId: null,
      signIn: (userId) => {
        setCurrentUserId(userId);
        queryClient.clear(); // bỏ cache của người dùng trước
        set({ userId });
      },
      signOut: () => {
        setCurrentUserId(null);
        queryClient.clear();
        useBookingDraftStore.getState().clear(); // bản nháp đặt phòng thuộc về người dùng cũ
        set({ userId: null });
      },
    }),
    {
      name: "auth-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ userId: s.userId }),
      onRehydrateStorage: () => (state) => {
        setCurrentUserId(state?.userId ?? null);
      },
    }
  )
);

/** Chờ AsyncStorage khôi phục xong phiên đăng nhập. */
export function waitForAuthHydration(): Promise<void> {
  return new Promise((resolve) => {
    if (useAuthStore.persist.hasHydrated()) return resolve();
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}
