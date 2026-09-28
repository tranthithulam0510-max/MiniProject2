import { BookingRange } from "@/types/room";

/**
 * Two half-open date ranges [start, end) overlap iff
 *   startA < endB && startB < endA
 * This is the classic interval-overlap check requested in the spec.
 */
export function rangesOverlap(a: BookingRange, b: BookingRange): boolean {
  const startA = new Date(a.start).getTime();
  const endA = new Date(a.end).getTime();
  const startB = new Date(b.start).getTime();
  const endB = new Date(b.end).getTime();
  return startA < endB && startB < endA;
}

export function isDateBooked(dateISO: string, bookedRanges: BookingRange[]): boolean {
  const t = new Date(dateISO).getTime();
  return bookedRanges.some((r) => {
    const start = new Date(r.start).getTime();
    const end = new Date(r.end).getTime();
    return t >= start && t < end;
  });
}

export function nightsBetween(startISO: string, endISO: string): number {
  const ms = new Date(endISO).getTime() - new Date(startISO).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

export function formatDateShort(dateISO: string): string {
  const d = new Date(dateISO);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}/${d.getFullYear()}`;
}
