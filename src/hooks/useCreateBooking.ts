import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBooking, CreateBookingPayload, BookingConflictError } from "@/api/mockApi";

/**
 * Wraps the create-booking call. On a 409 (BookingConflictError) we
 * invalidate the availability query so the calendar re-fetches and shows
 * the newly-locked date — this is the "xử lý 2 người đặt cùng lúc" path.
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onError: (error, variables) => {
      if (error instanceof BookingConflictError) {
        queryClient.invalidateQueries({ queryKey: ["availability", variables.roomId] });
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
      }
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      queryClient.invalidateQueries({ queryKey: ["availability", booking.roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["featuredRooms"] });
    },
  });
}
