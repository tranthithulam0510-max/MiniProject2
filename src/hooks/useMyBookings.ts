import { useQuery } from "@tanstack/react-query";
import { fetchMyBookings } from "@/api/mockApi";

export function useMyBookings() {
  return useQuery({
    queryKey: ["myBookings"],
    queryFn: fetchMyBookings,
    staleTime: 5_000,
  });
}
