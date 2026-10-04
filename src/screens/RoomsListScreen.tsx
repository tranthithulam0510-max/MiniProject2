import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, Pressable, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { theme } from "@/theme/theme";
import { useFilterStore } from "@/store/filterStore";
import { useRooms } from "@/hooks/useRooms";
import RoomCard, { ROOM_CARD_HEIGHT } from "@/components/RoomCard";
import FilterChip from "@/components/FilterChip";
import DateRangeModal from "@/components/DateRangeModal";
import dayjs from "dayjs";
import { Room } from "@/types/room";
import { RoomsStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RoomsStackParamList, "RoomsList">;

const CARD_MARGIN = 10;
const ITEM_HEIGHT = ROOM_CARD_HEIGHT + CARD_MARGIN;
const SEARCH_DEBOUNCE_MS = 350;

export default function RoomsListScreen({ navigation, route }: Props) {
  const {
    query,
    guests,
    maxPrice,
    cityViewOnly,
    poolOnly,
    areaRange,
    status,
    startDate,
    endDate,
    setQuery,
    toggleGuests,
    toggleMaxPrice,
    toggleCityView,
    togglePool,
    toggleArea,
    toggleStatus,
    setDates,
    clearAll,
  } = useFilterStore();
  const [dateModal, setDateModal] = useState(false);

  // Local input state kept separate from the store so keystrokes never
  // block on/trigger the (debounced) query re-fetch on every character.
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    const handle = setTimeout(() => setQuery(inputValue), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [inputValue, setQuery]);

  // Search typed on the Home screen: apply immediately.
  const incomingQuery = route.params?.query;
  const incomingNonce = route.params?.nonce;
  useEffect(() => {
    if (incomingQuery !== undefined) {
      setInputValue(incomingQuery);
      setQuery(incomingQuery);
    }
  }, [incomingQuery, incomingNonce, setQuery]);

  // Pressing the search button / keyboard "search": apply right away.
  const applySearch = useCallback(() => {
    setQuery(inputValue.trim());
    Keyboard.dismiss();
  }, [inputValue, setQuery]);

  const filters = useMemo(
    () => ({ query, guests, maxPrice, cityViewOnly, poolOnly, areaRange, status, startDate, endDate }),
    [query, guests, maxPrice, cityViewOnly, poolOnly, areaRange, status, startDate, endDate]
  );

  const { data: rooms, isLoading, isError, refetch, isFetching } = useRooms(filters);

  const handlePressRoom = useCallback(
    (roomId: string) => {
      navigation.navigate("RoomDetail", { roomId });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Room }) => <RoomCard room={item} onPress={handlePressRoom} />,
    [handlePressRoom]
  );

  const keyExtractor = useCallback((item: Room) => item.id, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<Room> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Chọn phòng</Text>
        <Text style={styles.subtitle}>
          {isFetching ? "Đang lọc…" : `${rooms?.length ?? 0} phòng phù hợp`}
        </Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={theme.colors.textFaint} />
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Tìm theo tên phòng, địa điểm…"
              placeholderTextColor={theme.colors.textFaint}
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={applySearch}
            />
            <Pressable onPress={applySearch} hitSlop={8} accessibilityLabel="Tìm kiếm">
              <Ionicons name="arrow-forward-circle" size={22} color={theme.colors.primary} />
            </Pressable>
          </View>
          <Pressable
            style={styles.filterBtn}
            onPress={() => {
              clearAll();
              setInputValue("");
            }}
            accessibilityLabel="Xoá tất cả bộ lọc"
          >
            <Ionicons name="close" size={16} color={theme.colors.text} />
          </Pressable>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
          data={[
            { key: "guests2", label: "2 khách", active: guests === 2, icon: "people" as const, onPress: () => toggleGuests(2) },
            { key: "price10", label: "≤ 10tr", active: maxPrice === 10_000_000, icon: "cash" as const, onPress: () => toggleMaxPrice(10_000_000) },
            { key: "cityview", label: "View thành phố", active: cityViewOnly, icon: "business" as const, onPress: toggleCityView },
            { key: "pool", label: "Hồ bơi", active: poolOnly, icon: "water" as const, onPress: togglePool },
          ]}
          keyExtractor={(c) => c.key}
          renderItem={({ item }) => (
            <FilterChip label={item.label} active={item.active} icon={item.icon} onPress={item.onPress} />
          )}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
          data={[
            { key: "small", label: "< 30 m²", active: areaRange === "small", icon: "resize" as const, onPress: () => toggleArea("small") },
            { key: "medium", label: "30–50 m²", active: areaRange === "medium", icon: "resize" as const, onPress: () => toggleArea("medium") },
            { key: "large", label: "> 50 m²", active: areaRange === "large", icon: "resize" as const, onPress: () => toggleArea("large") },
            { key: "available", label: "Available", active: status === "available", icon: "checkmark-circle" as const, onPress: () => toggleStatus("available") },
            { key: "occupied", label: "Occupied", active: status === "occupied", icon: "close-circle" as const, onPress: () => toggleStatus("occupied") },
            {
              key: "dates",
              label: startDate && endDate ? `${dayjs(startDate).format("DD/MM")} – ${dayjs(endDate).format("DD/MM")}` : "Chọn ngày",
              active: !!(startDate && endDate),
              icon: "calendar" as const,
              onPress: () => setDateModal(true),
            },
          ]}
          keyExtractor={(c) => c.key}
          renderItem={({ item }) => (
            <FilterChip label={item.label} active={item.active} icon={item.icon} onPress={item.onPress} />
          )}
        />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Không tải được danh sách phòng.</Text>
          <Text onPress={() => refetch()} style={styles.retryLink}>
            Thử lại
          </Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          contentContainerStyle={styles.listContent}
          // Perf tuning for the 500+ item feed:
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.errorText}>Không tìm thấy phòng phù hợp.</Text>
            </View>
          }
        />
      )}
      <DateRangeModal
        visible={dateModal}
        initialStart={startDate}
        initialEnd={endDate}
        onApply={(a, b) => setDates(a, b)}
        onClear={() => setDates(null, null)}
        onClose={() => setDateModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: "800" },
  subtitle: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  searchRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    height: 42,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: { flex: 1, color: theme.colors.text, fontSize: 13 },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  listContent: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  errorText: { color: theme.colors.textMuted, fontSize: 13 },
  retryLink: { color: theme.colors.primary, fontWeight: "700", fontSize: 13 },
});
