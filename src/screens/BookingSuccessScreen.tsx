import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { theme } from "@/theme/theme";
import PrimaryButton from "@/components/PrimaryButton";
import { useBookingDraftStore } from "@/store/bookingDraftStore";
import { formatDateShort, formatVND } from "@/utils/dateOverlap";
import { RoomsStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RoomsStackParamList, "BookingSuccess">;

export default function BookingSuccessScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;
  const { room, startDate, endDate, clear } = useBookingDraftStore();

  useEffect(() => {
    return () => clear();
  }, [clear]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={36} color={theme.colors.success} />
        </View>
        <Text style={styles.title}>Đặt phòng thành công!</Text>
        <Text style={styles.subtitle}>Mã đặt chỗ: {bookingId}</Text>

        {room && startDate && endDate && (
          <View style={styles.card}>
            <View style={[styles.thumb, { backgroundColor: room.imageColor }]}>
              <Image source={{ uri: room.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomMeta}>
                {formatDateShort(startDate)} - {formatDateShort(endDate)}
              </Text>
              <Text style={styles.roomPrice}>{formatVND(room.pricePerNight)}/đêm</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title="Xem đặt chỗ của tôi"
          onPress={() =>
            navigation.getParent()?.navigate("BookingsTab", { screen: "MyBookings" })
          }
        />
        <PrimaryButton
          title="Về trang chủ"
          variant="outline"
          style={{ marginTop: 12 }}
          onPress={() => navigation.popToTop()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg, justifyContent: "space-between" },
  content: { padding: 28, alignItems: "center", marginTop: 50 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(63,178,127,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { color: theme.colors.text, fontSize: 19, fontWeight: "800" },
  subtitle: { color: theme.colors.textMuted, fontSize: 12, marginTop: 6 },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 14,
    marginTop: 26,
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  thumb: { width: 56, height: 56, borderRadius: theme.radius.sm, overflow: "hidden" },
  roomName: { color: theme.colors.text, fontWeight: "700", fontSize: 14 },
  roomMeta: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  roomPrice: { color: theme.colors.primary, fontSize: 12, fontWeight: "700", marginTop: 4 },
  footer: { padding: 20, paddingBottom: 30 },
});