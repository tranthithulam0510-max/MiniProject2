import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { theme } from "@/theme/theme";
import { useAvailability } from "@/hooks/useAvailability";
import { useBookingDraftStore } from "@/store/bookingDraftStore";
import PrimaryButton from "@/components/PrimaryButton";
import { isDateBooked, nightsBetween, rangesOverlap } from "@/utils/dateOverlap";
import { RoomsStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RoomsStackParamList, "DatePicker">;

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function buildMonthGrid(monthISO: string) {
  const start = dayjs(monthISO).startOf("month");
  const end = dayjs(monthISO).endOf("month");
  const startWeekday = (start.day() + 6) % 7; // Monday-first
  const days: (string | null)[] = Array(startWeekday).fill(null);
  for (let d = start; d.isBefore(end) || d.isSame(end, "day"); d = d.add(1, "day")) {
    days.push(d.format("YYYY-MM-DD"));
  }
  return days;
}

export default function DatePickerScreen({ route, navigation }: Props) {
  const { roomId } = route.params;
  const { data: bookedRanges = [], isLoading } = useAvailability(roomId);
  const room = useBookingDraftStore((s) => s.room);
  const setRange = useBookingDraftStore((s) => s.setRange);

  const [month] = useState(() => dayjs("2026-10-01").format("YYYY-MM-DD"));
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState(false);

  const grid = useMemo(() => buildMonthGrid(month), [month]);
  const today = dayjs("2026-10-01");

  function handleTapDay(dateISO: string) {
    setConflictWarning(false);
    const booked = isDateBooked(dateISO, bookedRanges);
    if (booked) return; // locked day, ignore taps

    if (!start || (start && end)) {
      setStart(dateISO);
      setEnd(null);
      return;
    }

    if (dayjs(dateISO).isBefore(start)) {
      setStart(dateISO);
      return;
    }

    const tentative = { start, end: dateISO };
    const overlaps = bookedRanges.some((r) => rangesOverlap(tentative, r));
    if (overlaps) {
      setConflictWarning(true);
      return;
    }
    setEnd(dateISO);
  }

  const nights = start && end ? nightsBetween(start, end) : 0;

  function handleContinue() {
    if (!start || !end) return;
    setRange(start, end);
    navigation.navigate("ConfirmBooking", { roomId });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.roomName}>{room?.name ?? "Chọn phòng"}</Text>
        {room && <Text style={styles.roomPrice}>{room.pricePerNight.toLocaleString("vi-VN")}đ / đêm</Text>}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <>
          <View style={styles.calendarCard}>
            <Text style={styles.monthLabel}>{dayjs(month).format("[Tháng] MM, YYYY")}</Text>
            <View style={styles.weekRow}>
              {WEEKDAYS.map((w) => (
                <Text key={w} style={styles.weekday}>
                  {w}
                </Text>
              ))}
            </View>
            <View style={styles.grid}>
              {grid.map((dateISO, idx) => {
                if (!dateISO) return <View key={`empty-${idx}`} style={styles.dayCell} />;
                const booked = isDateBooked(dateISO, bookedRanges);
                const isPast = dayjs(dateISO).isBefore(today, "day");
                const isStart = dateISO === start;
                const isEnd = dateISO === end;
                const inRange =
                  start && end && dayjs(dateISO).isAfter(start) && dayjs(dateISO).isBefore(end);
                const disabled = booked || isPast;

                return (
                  <Pressable
                    key={dateISO}
                    disabled={disabled}
                    onPress={() => handleTapDay(dateISO)}
                    style={[
                      styles.dayCell,
                      inRange && styles.dayInRange,
                      (isStart || isEnd) && styles.daySelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        disabled && styles.dayTextDisabled,
                        (isStart || isEnd) && styles.dayTextSelected,
                      ]}
                    >
                      {dayjs(dateISO).date()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={styles.legendText}>Đã chọn</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.textFaint }]} />
                <Text style={styles.legendText}>Đã kín</Text>
              </View>
            </View>

            {conflictWarning && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  Đêm 8/10 đã có khách đặt, hãy chọn khoảng ngày không giao với ngày đã đặt.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <View>
              <Text style={styles.footerLabel}>
                {start && end ? `${start.slice(8)}/${start.slice(5, 7)} - ${end.slice(8)}/${end.slice(5, 7)}` : "Chọn ngày nhận & trả phòng"}
              </Text>
              <Text style={styles.footerNights}>{nights > 0 ? `${nights} đêm` : ""}</Text>
            </View>
            <PrimaryButton
              title="Tiếp tục"
              disabled={!start || !end}
              onPress={handleContinue}
              style={{ width: 140 }}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  roomName: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
  roomPrice: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  calendarCard: {
    margin: 20,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  monthLabel: { color: theme.colors.text, fontWeight: "700", fontSize: 14, textAlign: "center", marginBottom: 10 },
  weekRow: { flexDirection: "row", marginBottom: 6 },
  weekday: { flex: 1, textAlign: "center", color: theme.colors.textFaint, fontSize: 11 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderRadius: theme.radius.sm,
  },
  dayInRange: { backgroundColor: "rgba(232,178,92,0.18)" },
  daySelected: { backgroundColor: theme.colors.primary },
  dayText: { color: theme.colors.text, fontSize: 13 },
  dayTextDisabled: { color: theme.colors.textFaint, textDecorationLine: "line-through" },
  dayTextSelected: { color: theme.colors.bg, fontWeight: "800" },
  legendRow: { flexDirection: "row", gap: 16, marginTop: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: theme.colors.textMuted, fontSize: 11 },
  warningBox: {
    marginTop: 12,
    backgroundColor: "rgba(229,72,77,0.12)",
    borderRadius: theme.radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  warningText: { color: theme.colors.danger, fontSize: 11, lineHeight: 16 },
  footer: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerLabel: { color: theme.colors.text, fontSize: 13, fontWeight: "600" },
  footerNights: { color: theme.colors.textMuted, fontSize: 11, marginTop: 2 },
});
