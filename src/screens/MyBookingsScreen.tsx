import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme/theme";
import { useMyBookings } from "@/hooks/useMyBookings";
import { formatDateShort, formatVND } from "@/utils/dateOverlap";
import { Booking } from "@/types/room";

export default function MyBookingsScreen() {
  const { data: bookings, isLoading, isError, refetch } = useMyBookings();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Đặt chỗ của tôi</Text>
        <Text style={styles.subtitle}>{bookings?.length ?? 0} kỳ nghỉ sắp tới</Text>
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
          renderItem={({ item }: { item: Booking }) => (
            <View style={styles.card}>
              <View style={styles.qrBox}>
                <Ionicons name="qr-code" size={28} color={theme.colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.roomName}>{item.roomName}</Text>
                <Text style={styles.dates}>
                  {formatDateShort(item.range.start)} - {formatDateShort(item.range.end)} ·{" "}
                  {item.nights} đêm
                </Text>
                <Text style={styles.total}>{formatVND(item.total)}</Text>
              </View>
            </View>
          )}
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
  },
  roomName: { color: theme.colors.text, fontWeight: "700", fontSize: 14 },
  dates: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  total: { color: theme.colors.primary, fontWeight: "700", fontSize: 12, marginTop: 4 },
});
