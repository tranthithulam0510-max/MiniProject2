import { create } from "zustand";
import { AreaRange, FilterState, RoomStatus } from "@/types/room";

interface FilterStore extends FilterState {
  setQuery: (q: string) => void;
  toggleGuests: (guests: number) => void;
  toggleMaxPrice: (maxPrice: number) => void;
  toggleCityView: () => void;
  togglePool: () => void;
  toggleArea: (range: AreaRange) => void;
  toggleStatus: (status: RoomStatus) => void;
  setDates: (start: string | null, end: string | null) => void;
  reset: () => void;
  clearAll: () => void;
}

const initialState: FilterState = {
  query: "",
  guests: 2,
  maxPrice: 10_000_000,
  cityViewOnly: false,
  poolOnly: false,
  areaRange: null,
  status: null,
  startDate: null,
  endDate: null,
};

const emptyState: FilterState = {
  ...initialState,
  guests: null,
  maxPrice: null,
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  ...initialState,
  setQuery: (query) => set({ query }),
  toggleGuests: (guests) =>
    set({ guests: get().guests === guests ? null : guests }),
  toggleMaxPrice: (maxPrice) =>
    set({ maxPrice: get().maxPrice === maxPrice ? null : maxPrice }),
  toggleCityView: () => set({ cityViewOnly: !get().cityViewOnly }),
  togglePool: () => set({ poolOnly: !get().poolOnly }),
  toggleArea: (range) => set({ areaRange: get().areaRange === range ? null : range }),
  toggleStatus: (status) => set({ status: get().status === status ? null : status }),
  setDates: (startDate, endDate) => set({ startDate, endDate }),
  reset: () => set(initialState),
  clearAll: () => set(emptyState),
}));
