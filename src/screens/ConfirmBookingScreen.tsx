import React from "react";
import { View, Text, StyleSheet, Switch, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { theme } from "@/theme/theme";
import { useBookingDraftStore } from "@/store/bookingDraftStore";
import { useCreateBooking } from "@/hooks/useCreateBooking";
import { BookingConflictError } from "@/api/mockApi";
import PrimaryButton from "@/components/PrimaryButton";
import { formatDateShort, formatVND, nightsBetween } from "@/utils/dateOverlap";
import { RoomsStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RoomsStackParamList, "ConfirmBooking">;

export default function ConfirmBookingScreen({ route, navigation }: Props) {
  const { roomId } = route.params;
  const { room, startDate, endDate, guests, setGuests, breakfast, setBreakfast } = useBookingDraftStore();
  const mutation = useCreateBooking();

  if (!room || !startDate || !endDate) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Thiếu thông tin đặt phòng.</Text>
      </View>
    );
  }

  const nights = nightsBetween(startDate, endDate);
  const roomTotal = room.pricePerNight * nights;
  const breakfastFee = breakfast ? 30_000 * nights : 0;
  const tax = Math.round((roomTotal + breakfastFee) * 0.08);
  const total = roomTotal + breakfastFee + tax;

  function handleConfirm() {
    mutation.mutate(
      {
        roomId: room!.id,
        roomName: room!.name,
        pricePerNight: room!.pricePerNight,
        guests,
        range: { start: startDate!, end: endDate! },
        nights,
        total,
      },
      {
        onSuccess: (booking) => {
          // Làm lại ngăn xếp: [Danh sách phòng, Thành công] -> nút Back không quay lại bước điền thông tin.
          navigation.reset({
            index: 1,
            routes: [{ name: "RoomsList" }, { name: "BookingSuccess", params: { bookingId: booking.id } }],
          });
        },
        onError: (error) => {
          const message =
            error instanceof BookingConflictError
              ? error.message
              : error instanceof Error && error.message
              ? error.message
              : "Có lỗi xảy ra, vui lòng thử lại.";
          navigation.replace("BookingError", { roomId: room!.id, message });
        },
      }
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.content}>
        <View style={styles.roomRow}>
          <View style={[styles.thumb, { backgroundColor: room.imageColor }]}>
            <Image source={{ uri: room.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.roomName}>{room.name}</Text>
            <Text style={styles.roomSub}>{formatVND(room.pricePerNight)} / ngày</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoRow icon="log-in" label="Ngày bắt đầu" value={formatDateShort(startDate)} />
          <InfoRow icon="log-out" label="Ngày kết thúc" value={formatDateShort(endDate)} />
          <InfoRow icon="moon" label="Thời gian sử dụng" value={`${nights} ngày`} />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.stepperRow}>
            <View style={styles.stepperLabelWrap}>
              <Ionicons name="people" size={16} color={theme.colors.textMuted} />
              <Text style={styles.stepperLabel}>Số người</Text>
            </View>
            <View style={styles.stepper}>
              <Text onPress={() => setGuests(Math.max(1, guests - 1))} style={styles.stepperBtn}>
                –
              </Text>
              <Text style={styles.stepperValue}>{guests}</Text>
              <Text onPress={() => setGuests(Math.min(room.guests, guests + 1))} style={styles.stepperBtn}>
                +
              </Text>
            </View>
          </View>

          <View style={styles.switchRow}>
            <View style={styles.stepperLabelWrap}>
              <Ionicons name="cafe" size={16} color={theme.colors.textMuted} />
              <Text style={styles.stepperLabel}>Nước uống</Text>
            </View>
            <Switch
              value={breakfast}
              onValueChange={setBreakfast}
              trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
              thumbColor={theme.colors.text}
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <PriceRow label={`Tiền thuê phòng (${nights} ngày)`} value={formatVND(roomTotal)} />
          {breakfast && <PriceRow label="Nước uống" value={formatVND(breakfastFee)} />}
          <PriceRow label="Phí dịch vụ" value={formatVND(tax)} />
          <View style={styles.divider} />
          <PriceRow label="Tổng cộng" value={formatVND(total)} bold />
        </View>

        <Text style={styles.disclaimer}>
          <Ionicons name="information-circle" size={12} /> Hệ thống kiểm tra lại tình trạng phòng khi bạn
          xác nhận đặt. Nếu có người vừa đặt trước, bạn sẽ được thông báo ngay.
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title="Xác nhận đặt phòng"
          loading={mutation.isPending}
          onPress={handleConfirm}
        />
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={15} color={theme.colors.textMuted} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function PriceRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, bold && styles.priceLabelBold]}>{label}</Text>
      <Text style={[styles.priceValue, bold && styles.priceValueBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.bg },
  errorText: { color: theme.colors.textMuted },
  content: { padding: 20, gap: 14 },
  roomRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  thumb: { width: 56, height: 56, borderRadius: theme.radius.sm, overflow: "hidden" },
  roomName: { color: theme.colors.text, fontWeight: "700", fontSize: 15 },
  roomSub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoLabel: { color: theme.colors.textMuted, fontSize: 12, flex: 1 },
  infoValue: { color: theme.colors.text, fontSize: 12, fontWeight: "600" },
  stepperRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  stepperLabelWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepperLabel: { color: theme.colors.text, fontSize: 13 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepperBtn: {
    color: theme.colors.text,
    fontSize: 18,
    width: 26,
    textAlign: "center",
    fontWeight: "700",
  },
  stepperValue: { color: theme.colors.text, fontSize: 14, fontWeight: "700", minWidth: 16, textAlign: "center" },
  priceRow: { flexDirection: "row", justifyContent: "space-between" },
  priceLabel: { color: theme.colors.textMuted, fontSize: 12 },
  priceLabelBold: { color: theme.colors.text, fontWeight: "700", fontSize: 14 },
  priceValue: { color: theme.colors.text, fontSize: 12 },
  priceValueBold: { color: theme.colors.primary, fontWeight: "800", fontSize: 16 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 2 },
  disclaimer: { color: theme.colors.textFaint, fontSize: 11, lineHeight: 16 },
  footer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});