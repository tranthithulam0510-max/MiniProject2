import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { theme } from "@/theme/theme";

const QUICK_FILTERS = [
  { icon: "bed", label: "Phòng" },
  { icon: "diamond", label: "Suite" },
  { icon: "people", label: "Gia đình" },
  { icon: "flower", label: "Spa" },
  { icon: "water", label: "Hồ bơi" },
] as const;

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.hello}>Xin chào, Thu Lam</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={{ color: theme.colors.bg, fontWeight: "700" }}>L</Text>
          </View>
        </View>

        <Text style={styles.title}>Kỳ nghỉ trong mơ chỉ cách một chạm</Text>

        <Pressable
          style={styles.searchBar}
          onPress={() => navigation.navigate("RoomsTab", { screen: "RoomsList" })}
        >
          <Ionicons name="search" size={16} color={theme.colors.textFaint} />
          <Text style={styles.searchPlaceholder}>Bạn muốn đến đâu?</Text>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 18 }}>
          {QUICK_FILTERS.map((f) => (
            <Pressable
              key={f.label}
              style={styles.quickChip}
              onPress={() => navigation.navigate("RoomsTab", { screen: "RoomsList" })}
            >
              <Ionicons name={f.icon as any} size={18} color={theme.colors.primary} />
              <Text style={styles.quickChipLabel}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.promo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTitle}>Spa & hồ bơi</Text>
            <Text style={styles.promoSub}>Giảm 20% dịch vụ spa hôm nay</Text>
            <Pressable style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Đặt ngay</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Phòng nổi bật</Text>
          <Pressable onPress={() => navigation.navigate("RoomsTab", { screen: "RoomsList" })}>
            <Text style={styles.sectionLink}>Xem tất cả</Text>
          </Pressable>
        </View>

        <View style={styles.featuredRow}>
          <View style={styles.featuredCard}>
            <Image
              source={{ uri: "https://i.pinimg.com/1200x/f4/a3/b3/f4a3b3bb8cee6ec20065084615318c91.jpg" }}
              style={styles.featuredImg}
              resizeMode="cover"
            />
            <Text style={styles.featuredName}>Deluxe City View</Text>
            <Text style={styles.featuredPrice}>từ 2.550.000đ</Text>
          </View>
          <View style={styles.featuredCard}>
            <Image
              source={{ uri: "https://i.pinimg.com/736x/8b/eb/20/8beb20f3e625c1d7888dba7a0e6cbb8c.jpg" }}
              style={styles.featuredImg}
              resizeMode="cover"
            />
            <Text style={styles.featuredName}>Royal Navy Suite</Text>
            <Text style={styles.featuredPrice}>từ 4.200.000đ</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hello: { color: theme.colors.textMuted, fontSize: 14 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: "800", marginTop: 14, lineHeight: 30 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 16,
    height: 46,
    marginTop: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  searchPlaceholder: { color: theme.colors.textFaint, fontSize: 13 },
  quickChip: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    width: 64,
    height: 64,
    marginRight: 10,
    gap: 4,
  },
  quickChipLabel: { color: theme.colors.textMuted, fontSize: 10 },
  promo: {
    marginTop: 20,
    backgroundColor: theme.colors.cardAlt,
    borderRadius: theme.radius.lg,
    padding: 18,
    flexDirection: "row",
  },
  promoTitle: { color: theme.colors.text, fontWeight: "800", fontSize: 16 },
  promoSub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  promoBtn: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
  },
  promoBtnText: { color: theme.colors.bg, fontWeight: "700", fontSize: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 26,
  },
  sectionTitle: { color: theme.colors.text, fontWeight: "700", fontSize: 16 },
  sectionLink: { color: theme.colors.primary, fontSize: 12, fontWeight: "600" },
  featuredRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  featuredCard: { flex: 1 },
  featuredImg: { height: 100, borderRadius: theme.radius.md, marginBottom: 6 },
  featuredName: { color: theme.colors.text, fontSize: 12, fontWeight: "600" },
  featuredPrice: { color: theme.colors.primary, fontSize: 12, fontWeight: "700" },
});