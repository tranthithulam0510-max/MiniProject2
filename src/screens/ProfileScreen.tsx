import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme/theme";

const MENU = [
  { icon: "person-circle", label: "Thông tin cá nhân" },
  { icon: "card", label: "Phương thức thanh toán" },
  { icon: "notifications", label: "Thông báo" },
  { icon: "help-circle", label: "Trợ giúp" },
] as const;

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={{ color: theme.colors.bg, fontWeight: "800", fontSize: 20 }}>L</Text>
        </View>
        <Text style={styles.name}>Thu Lam</Text>
        <Text style={styles.sub}>Thành viên từ 2026</Text>
      </View>

      <View style={styles.menu}>
        {MENU.map((m) => (
          <View key={m.label} style={styles.menuRow}>
            <Ionicons name={m.icon} size={18} color={theme.colors.textMuted} />
            <Text style={styles.menuLabel}>{m.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textFaint} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  header: { alignItems: "center", paddingTop: 30, paddingBottom: 20 },
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
  menu: { paddingHorizontal: 20, gap: 4 },
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
});
