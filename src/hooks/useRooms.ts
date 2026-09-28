import { useQuery } from "@tanstack/react-query";
import { fetchRooms, fetchRoomById } from "@/api/mockApi";
import { FilterState } from "@/types/room";

export function useRooms(filters: FilterState) {
  return useQuery({
    // Query key includes every filter field, so any chip/search change
    // triggers a refetch of exactly the right data.
    queryKey: ["rooms", filters],
    queryFn: () => fetchRooms(filters),
    staleTime: 30_000,
  });
}

export function useRoom(id: string | undefined) {
  return useQuery({
    queryKey: ["room", id],
    queryFn: () => fetchRoomById(id as string),
    enabled: !!id,
  });
}
