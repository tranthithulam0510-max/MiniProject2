import { create } from "zustand";
import { FilterState } from "@/types/room";

interface FilterStore extends FilterState {
  setQuery: (q: string) => void;
  toggleGuests: (guests: number) => void;
  toggleMaxPrice: (maxPrice: number) => void;
  toggleCityView: () => void;
  togglePool: () => void;
  reset: () => void;
}

const initialState: FilterState = {
  query: "",
  guests: 2,
  maxPrice: 10_000_000,
  cityViewOnly: false,
  poolOnly: false,
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
  reset: () => set(initialState),
}));
