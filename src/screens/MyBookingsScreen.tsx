import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme/theme";
import { useMyBookings } from "@/hooks/useMyBookings";
import { useCancelBooking } from "@/hooks/useCancelBooking";
import { formatDateShort, formatVND } from "@/utils/dateOverlap";
import { Booking } from "@/types/room";

const STATUS_META: Record<Booking["status"], { label: string; color: string }> = {
  upcoming: { label: "Sắp tới", color: theme.colors.success },
  past: { label: "Đã qua", color: theme.colors.textFaint },
  cancelled: { label: "Đã huỷ", color: theme.colors.danger },
};

export default function MyBookingsScreen() {
  const { data: bookings, isLoading, isError, refetch } = useMyBookings();
  const cancel = useCancelBooking();
  const upcomingCount = bookings?.filter((b) => b.status === "upcoming").length ?? 0;

  function confirmCancel(b: Booking) {
    Alert.alert("Huỷ đặt phòng?", `${b.roomName}\n${formatDateShort(b.range.start)} - ${formatDateShort(b.range.end)}`, [
      { text: "Giữ lại", style: "cancel" },
      {
        text: "Huỷ đặt phòng",
        style: "destructive",
        onPress: () =>
          cancel.mutate(b.id, {
            onError: (e) => Alert.alert("Không huỷ được", e instanceof Error ? e.message : "Vui lòng thử lại."),
          }),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Đặt chỗ của tôi</Text>
        <Text style={styles.subtitle}>{upcomingCount} lịch học sắp tới</Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Không tải được danh sách đặt chỗ.</Text>
          <Text style={styles.retry} onPress={() => refetch()}>
            Thử lại
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ padding: 20, paddingTop: 4 }}
          renderItem={({ item }: { item: Booking }) => {
            const meta = STATUS_META[item.status];
            return (
              <View style={[styles.card, item.status === "cancelled" && { opacity: 0.6 }]}>
                <View style={styles.qrBox}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  ) : (
                    <Ionicons name="qr-code" size={28} color={theme.colors.text} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.roomName} numberOfLines={1}>{item.roomName}</Text>
                    <View style={[styles.pill, { borderColor: meta.color }]}>
                      <Text style={[styles.pillText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.dates}>
                    {item.city ? `${item.city} · ` : ""}
                    {formatDateShort(item.range.start)} - {formatDateShort(item.range.end)} · {item.nights} ngày
                  </Text>
                  <View style={styles.bottomRow}>
                    <Text style={styles.total}>{formatVND(item.total)}</Text>
                    {item.status === "upcoming" && (
                      <Pressable onPress={() => confirmCancel(item)} disabled={cancel.isPending} hitSlop={8}>
                        <Text style={styles.cancel}>Huỷ đặt phòng</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="calendar-outline" size={32} color={theme.colors.textFaint} />
              <Text style={styles.emptyText}>Bạn chưa có đặt chỗ nào.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8 },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: "800" },
  subtitle: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  centered: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  emptyText: { color: theme.colors.textMuted, fontSize: 13 },
  retry: { color: theme.colors.primary, fontWeight: "700" },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  qrBox: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.cardAlt,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  pill: { borderWidth: 1, borderRadius: theme.radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  pillText: { fontSize: 10, fontWeight: "700" },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  roomName: { color: theme.colors.text, fontWeight: "700", fontSize: 14, flexShrink: 1 },
  dates: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  total: { color: theme.colors.primary, fontWeight: "700", fontSize: 12 },
  cancel: { color: theme.colors.danger, fontSize: 12, fontWeight: "700" },
});
