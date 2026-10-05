import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Image, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { theme } from "@/theme/theme";
import { useProfile } from "@/hooks/useProfile";
import { useFeaturedRooms } from "@/hooks/useRooms";
import { formatVND } from "@/utils/dateOverlap";

const QUICK_FILTERS = [
  { icon: "book", label: "Phòng học" },
  { icon: "person", label: "Tự học" },
  { icon: "people", label: "Học nhóm" },
  { icon: "videocam", label: "Thuyết trình" },
  { icon: "volume-mute", label: "Yên tĩnh" },
] as const;

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState("");
  const { data: profile } = useProfile();
  const { data: featured, isLoading: featuredLoading } = useFeaturedRooms();
  const displayName = profile?.name ?? "";

  function goSearch() {
    navigation.navigate("RoomsTab", {
      screen: "RoomsList",
      params: { query: search.trim(), nonce: Date.now() },
    });
  }

  function openRoom(roomId: string) {
    navigation.navigate("RoomsTab", { screen: "RoomDetail", params: { roomId } });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.hello}>Xin chào{displayName ? `, ${displayName}` : ""}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={{ color: theme.colors.bg, fontWeight: "700" }}>
              {(displayName[0] ?? "?").toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>Tìm phòng học phù hợp chỉ với một chạm</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={theme.colors.textFaint} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Bạn muốn học ở tòa nào?"
            placeholderTextColor={theme.colors.textFaint}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={goSearch}
          />
          <Pressable onPress={goSearch} hitSlop={8} accessibilityLabel="Tìm kiếm">
            <Ionicons name="arrow-forward-circle" size={24} color={theme.colors.primary} />
          </Pressable>
        </View>

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
            <Text style={styles.promoTitle}>Học nhóm cuối tuần</Text>
            <Text style={styles.promoSub}>Giảm 20% phí thuê phòng học nhóm hôm nay</Text>
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

        {featuredLoading ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 16 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredRow}>
            {(featured ?? []).map((room) => (
              <Pressable key={room.id} style={styles.featuredCard} onPress={() => openRoom(room.id)}>
                <View style={[styles.featuredImgWrap, { backgroundColor: room.imageColor }]}>
                  <Image source={{ uri: room.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  <View style={[styles.statusBadge, { backgroundColor: theme.colors.success }]}>
                    <Text style={styles.statusText}>Còn trống</Text>
                  </View>
                </View>
                <Text style={styles.featuredName} numberOfLines={1}>{room.name}</Text>
                <Text style={styles.featuredMeta} numberOfLines={1}>{room.city} · {room.areaM2} m²</Text>
                <Text style={styles.featuredPrice}>{formatVND(room.pricePerNight)}/ngày</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
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
  searchInput: { flex: 1, color: theme.colors.text, fontSize: 13 },
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
  featuredRow: { marginTop: 12 },
  featuredCard: { width: 160, marginRight: 12 },
  featuredImgWrap: { height: 100, borderRadius: theme.radius.md, marginBottom: 6, overflow: "hidden" },
  statusBadge: { position: "absolute", left: 0, right: 0, bottom: 0, paddingVertical: 2, alignItems: "center" },
  statusText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  featuredMeta: { color: theme.colors.textMuted, fontSize: 11, marginTop: 1 },
  featuredName: { color: theme.colors.text, fontSize: 12, fontWeight: "600" },
  featuredPrice: { color: theme.colors.primary, fontSize: 12, fontWeight: "700" },
});