import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { theme } from "@/theme/theme";
import PrimaryButton from "@/components/PrimaryButton";
import { useBookingDraftStore } from "@/store/bookingDraftStore";
import { RoomsStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RoomsStackParamList, "BookingError">;

export default function BookingErrorScreen({ route, navigation }: Props) {
  const { roomId, message } = route.params;
  const clear = useBookingDraftStore((s) => s.setRange);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="close" size={36} color={theme.colors.danger} />
        </View>
        <Text style={styles.title}>Đặt phòng không thành công</Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.hint}>
          Điều này xảy ra khi có người khác vừa đặt phòng cho cùng khoảng ngày trong lúc bạn xác
          nhận. Vui lòng chọn lại ngày còn trống.
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title="Chọn lại ngày"
          onPress={() => {
            clear(null, null);
            navigation.replace("DatePicker", { roomId });
          }}
        />
        <PrimaryButton
          title="Về danh sách phòng"
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
  content: { padding: 28, alignItems: "center", marginTop: 60 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(229,72,77,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { color: theme.colors.text, fontSize: 19, fontWeight: "800", textAlign: "center" },
  message: { color: theme.colors.textMuted, fontSize: 13, textAlign: "center", marginTop: 10 },
  hint: { color: theme.colors.textFaint, fontSize: 12, textAlign: "center", marginTop: 16, lineHeight: 18 },
  footer: { padding: 20, paddingBottom: 30 },
});
