import React, { useEffect, useMemo, useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import dayjs from "dayjs";
import { theme } from "@/theme/theme";
import PrimaryButton from "@/components/PrimaryButton";

interface Props {
  visible: boolean;
  initialStart: string | null;
  initialEnd: string | null;
  onApply: (start: string, end: string) => void;
  onClear: () => void;
  onClose: () => void;
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function buildGrid(monthISO: string) {
  const start = dayjs(monthISO).startOf("month");
  const end = dayjs(monthISO).endOf("month");
  const days: (string | null)[] = Array((start.day() + 6) % 7).fill(null);
  for (let d = start; !d.isAfter(end, "day"); d = d.add(1, "day")) days.push(d.format("YYYY-MM-DD"));
  return days;
}

/** Calendar used by the room-list filter to pick a date range. */
export default function DateRangeModal({ visible, initialStart, initialEnd, onApply, onClear, onClose }: Props) {
  const [month, setMonth] = useState(() => dayjs().startOf("month").format("YYYY-MM-DD"));
  const [start, setStart] = useState<string | null>(initialStart);
  const [end, setEnd] = useState<string | null>(initialEnd);

  useEffect(() => {
    if (visible) {
      setStart(initialStart);
      setEnd(initialEnd);
    }
  }, [visible, initialStart, initialEnd]);

  const grid = useMemo(() => buildGrid(month), [month]);
  const today = dayjs().startOf("day");

  function tap(d: string) {
    if (!start || end) {
      setStart(d);
      setEnd(null);
    } else if (!dayjs(d).isAfter(start, "day")) {
      setStart(d);
    } else {
      setEnd(d);
    }
  }

  const isCurrentMonth = dayjs(month).isSame(dayjs(), "month");

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Lọc theo ngày sử dụng</Text>

          <View style={styles.monthRow}>
            <Pressable
              disabled={isCurrentMonth}
              onPress={() => setMonth(dayjs(month).subtract(1, "month").format("YYYY-MM-DD"))}
            >
              <Text style={[styles.arrow, isCurrentMonth && { opacity: 0.3 }]}>‹</Text>
            </Pressable>
            <Text style={styles.monthLabel}>{dayjs(month).format("[Tháng] MM, YYYY")}</Text>
            <Pressable onPress={() => setMonth(dayjs(month).add(1, "month").format("YYYY-MM-DD"))}>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((w) => (
              <Text key={w} style={styles.weekday}>{w}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {grid.map((d, i) => {
              if (!d) return <View key={`e${i}`} style={styles.cell} />;
              const past = dayjs(d).isBefore(today, "day");
              const selected = d === start || d === end;
              const inRange = !!start && !!end && dayjs(d).isAfter(start, "day") && dayjs(d).isBefore(end, "day");
              return (
                <Pressable
                  key={d}
                  disabled={past}
                  onPress={() => tap(d)}
                  style={[styles.cell, inRange && styles.inRange, selected && styles.selected]}
                >
                  <Text style={[styles.dayText, past && styles.dayPast, selected && styles.daySelected]}>
                    {dayjs(d).date()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.hint}>
            {start && end
              ? `${dayjs(start).format("DD/MM")} - ${dayjs(end).format("DD/MM")} · ${dayjs(end).diff(start, "day")} ngày`
              : "Chọn ngày bắt đầu rồi ngày kết thúc"}
          </Text>

          <View style={styles.actions}>
            <PrimaryButton
              title="Xoá ngày"
              variant="outline"
              style={{ flex: 1 }}
              onPress={() => {
                onClear();
                onClose();
              }}
            />
            <PrimaryButton
              title="Áp dụng"
              disabled={!start || !end}
              style={{ flex: 1 }}
              onPress={() => {
                if (start && end) onApply(start, end);
                onClose();
              }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 },
  sheet: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: { color: theme.colors.text, fontSize: 16, fontWeight: "800", marginBottom: 10 },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  arrow: { color: theme.colors.primary, fontSize: 24, fontWeight: "700", paddingHorizontal: 12 },
  monthLabel: { color: theme.colors.text, fontWeight: "700", fontSize: 14 },
  weekRow: { flexDirection: "row", marginBottom: 6 },
  weekday: { flex: 1, textAlign: "center", color: theme.colors.textFaint, fontSize: 11 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderRadius: theme.radius.sm,
  },
  inRange: { backgroundColor: "rgba(232,178,92,0.18)" },
  selected: { backgroundColor: theme.colors.primary },
  dayText: { color: theme.colors.text, fontSize: 13 },
  dayPast: { color: theme.colors.textFaint, textDecorationLine: "line-through" },
  daySelected: { color: theme.colors.bg, fontWeight: "800" },
  hint: { color: theme.colors.textMuted, fontSize: 12, textAlign: "center", marginTop: 8 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
});
