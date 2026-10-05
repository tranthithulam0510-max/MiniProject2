import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme/theme";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useMyBookings } from "@/hooks/useMyBookings";
import PrimaryButton from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/authStore";
 
const MENU = [
  { key: "payment", icon: "card", label: "Phương thức thanh toán" },
  { key: "notify", icon: "notifications", label: "Thông báo" },
  { key: "help", icon: "help-circle", label: "Trợ giúp" },
] as const;
 
const FAQ = [
  {
    q: "Làm sao để đặt phòng học?",
    a: "Vào tab Phòng học, chọn phòng phù hợp, bấm Chọn ngày, chọn ngày bắt đầu và ngày kết thúc rồi bấm Xác nhận đặt phòng.",
  },
  {
    q: "Vì sao có ngày không chọn được?",
    a: "Ngày bị gạch ngang nghĩa là phòng đã có người đặt. Hãy chọn khoảng ngày khác không giao với các ngày đó.",
  },
  {
    q: "Tôi bị báo đặt phòng không thành công?",
    a: "Có thể người khác vừa đặt cùng phòng và cùng ngày trước bạn. Bấm Chọn lại ngày để chọn ngày còn trống.",
  },
  {
    q: "Làm sao để huỷ đặt phòng?",
    a: "Vào tab Đặt chỗ, chọn lượt đặt sắp tới rồi bấm Huỷ đặt phòng. Lượt đã qua không thể huỷ.",
  },
  {
    q: "Tôi có thể đổi thông tin cá nhân không?",
    a: "Có. Ở tab Cá nhân, bấm vào thẻ thông tin để sửa họ tên, email và số điện thoại.",
  },
];
 
export default function ProfileScreen() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { data: bookings } = useMyBookings();
  const update = useUpdateProfile();
  const signOut = useAuthStore((s) => s.signOut);
  const [helpOpen, setHelpOpen] = useState(false);
 
  function onMenuPress(key: (typeof MENU)[number]["key"]) {
    if (key === "help") setHelpOpen(true);
    else Alert.alert("Sắp ra mắt", "Tính năng này đang được phát triển.");
  }
 
  function confirmLogout() {
    Alert.alert("Đăng xuất?", "Bạn sẽ cần đăng nhập lại để đặt phòng.", [
      { text: "Ở lại", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: signOut },
    ]);
  }
 
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
 
  function startEdit() {
    if (!profile) return;
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setEditing(true);
  }
 
  function save() {
    update.mutate(
      { name, email, phone },
      {
        onSuccess: () => setEditing(false),
        onError: (e) => Alert.alert("Không lưu được", e instanceof Error ? e.message : "Vui lòng thử lại."),
      }
    );
  }
 
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <ActivityIndicator color={theme.colors.primary} />
      </SafeAreaView>
    );
  }
 
  if (isError || !profile) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <Text style={styles.sub}>Không tải được hồ sơ.</Text>
        <Text style={styles.retry} onPress={() => refetch()}>Thử lại</Text>
      </SafeAreaView>
    );
  }
 
  const total = bookings?.length ?? 0;
  const upcoming = bookings?.filter((b) => b.status === "upcoming").length ?? 0;
 
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={{ color: theme.colors.bg, fontWeight: "800", fontSize: 20 }}>
              {(profile.name[0] ?? "?").toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.sub}>Thành viên từ {profile.memberSince.slice(0, 4)}</Text>
        </View>
 
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statLabel}>Đã đặt</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{upcoming}</Text>
            <Text style={styles.statLabel}>Sắp tới</Text>
          </View>
        </View>
 
        <View style={styles.menu}>
          {editing ? (
            <View style={styles.formCard}>
              <Text style={styles.label}>Họ tên</Text>
              <TextInput value={name} onChangeText={setName} style={styles.input} placeholderTextColor={theme.colors.textFaint} />
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={theme.colors.textFaint}
              />
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
                placeholderTextColor={theme.colors.textFaint}
              />
              <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                <PrimaryButton title="Huỷ" variant="outline" style={{ flex: 1 }} onPress={() => setEditing(false)} />
                <PrimaryButton title="Lưu" loading={update.isPending} style={{ flex: 1 }} onPress={save} />
              </View>
            </View>
          ) : (
            <Pressable style={styles.infoCard} onPress={startEdit}>
              <InfoLine icon="mail" value={profile.email} />
              <InfoLine icon="call" value={profile.phone || "Chưa có số điện thoại"} />
              <View style={styles.editHint}>
                <Ionicons name="create" size={14} color={theme.colors.primary} />
                <Text style={styles.editHintText}>Sửa thông tin cá nhân</Text>
              </View>
            </Pressable>
          )}
 
          {MENU.map((m) => (
            <Pressable key={m.key} style={styles.menuRow} onPress={() => onMenuPress(m.key)}>
              <Ionicons name={m.icon} size={18} color={theme.colors.textMuted} />
              <Text style={styles.menuLabel}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textFaint} />
            </Pressable>
          ))}
 
          <PrimaryButton title="Đăng xuất" variant="outline" style={{ marginTop: 6 }} onPress={confirmLogout} />
        </View>
      </ScrollView>
 
      <Modal visible={helpOpen} animationType="slide" transparent onRequestClose={() => setHelpOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trợ giúp</Text>
              <Pressable onPress={() => setHelpOpen(false)} hitSlop={10} accessibilityLabel="Đóng">
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {FAQ.map((f) => (
                <View key={f.q} style={styles.faqItem}>
                  <Text style={styles.faqQ}>{f.q}</Text>
                  <Text style={styles.faqA}>{f.a}</Text>
                </View>
              ))}
              <View style={styles.faqItem}>
                <Text style={styles.faqQ}>Cần hỗ trợ thêm?</Text>
                <Text style={styles.faqA}>Email: hotro@phonghoc.example.com</Text>
                <Text style={styles.faqA}>Hotline: 0900 000 000 (07:00 – 21:00)</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
 
function InfoLine({ icon, value }: { icon: any; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Ionicons name={icon} size={15} color={theme.colors.textMuted} />
      <Text style={styles.infoText}>{value}</Text>
    </View>
  );
}
 
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  centered: { alignItems: "center", justifyContent: "center", gap: 10 },
  retry: { color: theme.colors.primary, fontWeight: "700" },
  header: { alignItems: "center", paddingTop: 30, paddingBottom: 16 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { color: theme.colors.text, fontSize: 18, fontWeight: "800", marginTop: 12 },
  sub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  statBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: { color: theme.colors.primary, fontSize: 20, fontWeight: "800" },
  statLabel: { color: theme.colors.textMuted, fontSize: 11, marginTop: 2 },
  menu: { paddingHorizontal: 20, gap: 4, paddingBottom: 24 },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  infoLine: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoText: { color: theme.colors.text, fontSize: 13 },
  editHint: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  editHintText: { color: theme.colors.primary, fontSize: 12, fontWeight: "700" },
  formCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: { color: theme.colors.textMuted, fontSize: 11, marginTop: 10, marginBottom: 4 },
  input: {
    color: theme.colors.text,
    backgroundColor: theme.colors.cardAlt,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: theme.radius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuLabel: { flex: 1, color: theme.colors.text, fontSize: 13 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: {
    maxHeight: "80%",
    backgroundColor: theme.colors.bgAlt,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: 20,
    paddingBottom: 28,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  modalTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800" },
  faqItem: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  faqQ: { color: theme.colors.text, fontSize: 14, fontWeight: "700", marginBottom: 4 },
  faqA: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 19 },
});
 