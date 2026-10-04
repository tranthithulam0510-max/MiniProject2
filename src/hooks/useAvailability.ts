import { useQuery } from "@tanstack/react-query";
import { fetchBookedRanges } from "@/api/mockApi";

export function useAvailability(roomId: string | undefined) {
  return useQuery({
    queryKey: ["availability", roomId],
    queryFn: () => fetchBookedRanges(roomId as string),
    enabled: !!roomId,
    staleTime: 0,
  });
}
