import React, { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { theme } from "@/theme/theme";
import { useRoom } from "@/hooks/useRooms";
import { useBookingDraftStore } from "@/store/bookingDraftStore";
import PrimaryButton from "@/components/PrimaryButton";
import { formatVND } from "@/utils/dateOverlap";
import { RoomsStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RoomsStackParamList, "RoomDetail">;

const AMENITY_LABEL: Record<string, { icon: any; label: string }> = {
  wifi: { icon: "wifi", label: "Wi-Fi" },
  breakfast: { icon: "cafe", label: "Ăn sáng" },
  balcony: { icon: "sunny", label: "Ban công" },
  pool: { icon: "water", label: "Hồ bơi" },
  aircon: { icon: "snow", label: "Điều hòa" },
  smarttv: { icon: "tv", label: "Smart TV" },
  cityview: { icon: "business", label: "View thành phố" },
};

export default function RoomDetailScreen({ route, navigation }: Props) {
  const { roomId } = route.params;
  const { data: room, isLoading, isError } = useRoom(roomId);
  const setRoom = useBookingDraftStore((s) => s.setRoom);

  useEffect(() => {
    if (room) setRoom(room);
  }, [room, setRoom]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (isError || !room) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Không tải được thông tin phòng.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[styles.hero, { backgroundColor: room.imageColor }]}>
          <Image
            source={{ uri: room.imageUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{room.status === "available" ? "Available" : "Occupied"}</Text>
          </View>
          <Ionicons
            name="heart"
            size={22}
            color={room.favorite ? theme.colors.danger : "#fff"}
            style={styles.heart}
          />
        </View>

        <SafeAreaView edges={[]} style={styles.body}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={theme.colors.primary} />
            <Text style={styles.ratingText}>
              {room.rating.toFixed(1)} ({room.reviews} đánh giá)
            </Text>
          </View>
          <Text style={styles.name}>{room.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.amenityChip}>
              <Ionicons name="location" size={14} color={theme.colors.text} />
              <Text style={styles.amenityText}>{room.city}</Text>
            </View>
            <View style={styles.amenityChip}>
              <Ionicons name="resize" size={14} color={theme.colors.text} />
              <Text style={styles.amenityText}>{room.areaM2} m²</Text>
            </View>
            <View style={styles.amenityChip}>
              <Ionicons name="people" size={14} color={theme.colors.text} />
              <Text style={styles.amenityText}>{room.guests} khách</Text>
            </View>
          </View>
          <Text style={styles.desc}>{room.description}</Text>

          <Text style={styles.sectionTitle}>Tiện nghi</Text>
          <View style={styles.amenityGrid}>
            {room.amenities.map((a) => {
              const meta = AMENITY_LABEL[a];
              if (!meta) return null;
              return (
                <View key={a} style={styles.amenityChip}>
                  <Ionicons name={meta.icon} size={14} color={theme.colors.text} />
                  <Text style={styles.amenityText}>{meta.label}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.timeRow}>
            <View>
              <Text style={styles.timeLabel}>Nhận phòng</Text>
              <Text style={styles.timeValue}>từ 14:00</Text>
            </View>
            <View>
              <Text style={styles.timeLabel}>Trả phòng</Text>
              <Text style={styles.timeValue}>trước 12:00</Text>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Từ</Text>
          <Text style={styles.footerPrice}>{formatVND(room.pricePerNight)}/đêm</Text>
        </View>
        <PrimaryButton
          title="Chọn ngày"
          style={{ paddingHorizontal: 28, width: 160 }}
          onPress={() => navigation.navigate("DatePicker", { roomId: room.id })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.bg },
  errorText: { color: theme.colors.textMuted },
  hero: { height: 260, justifyContent: "space-between" },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    margin: 16,
    marginTop: 56,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  heart: { alignSelf: "flex-end", margin: 16, marginTop: 56 },
  body: { paddingHorizontal: 20, paddingTop: 18 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  ratingText: { color: theme.colors.textMuted, fontSize: 12 },
  name: { color: theme.colors.text, fontSize: 22, fontWeight: "800", marginTop: 6 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  desc: { color: theme.colors.textMuted, fontSize: 13, marginTop: 10, lineHeight: 19 },
  sectionTitle: { color: theme.colors.text, fontWeight: "700", fontSize: 15, marginTop: 22, marginBottom: 10 },
  amenityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  amenityText: { color: theme.colors.text, fontSize: 12 },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 16,
  },
  timeLabel: { color: theme.colors.textFaint, fontSize: 11 },
  timeValue: { color: theme.colors.text, fontSize: 14, fontWeight: "700", marginTop: 3 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.bgAlt,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLabel: { color: theme.colors.textFaint, fontSize: 11 },
  footerPrice: { color: theme.colors.primary, fontSize: 18, fontWeight: "800" },
});