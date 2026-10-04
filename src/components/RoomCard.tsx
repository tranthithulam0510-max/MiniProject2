import React, { memo } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Room } from "@/types/room";
import { theme } from "@/theme/theme";
import { formatVND } from "@/utils/dateOverlap";

interface Props {
  room: Room;
  onPress: (roomId: string) => void;
}

// Fixed height card -> lets RoomsListScreen use getItemLayout for O(1)
// scroll-to and to skip the FlatList's own layout measurement pass.
export const ROOM_CARD_HEIGHT = 96;

function RoomCardBase({ room, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(room.id)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.thumb, { backgroundColor: room.imageColor }]}>
        <Image
          source={{ uri: room.imageUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: room.status === "available" ? theme.colors.success : theme.colors.danger },
          ]}
        >
          <Text style={styles.statusText}>
            {room.status === "available" ? "Available" : "Occupied"}
          </Text>
        </View>
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {room.name}
          </Text>
          <Ionicons
            name={room.favorite ? "heart" : "heart-outline"}
            size={16}
            color={room.favorite ? theme.colors.danger : theme.colors.textFaint}
          />
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={12} color={theme.colors.primary} />
          <Text style={styles.metaText}>
            {room.rating.toFixed(1)} · Còn {room.roomsLeft} phòng
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location" size={12} color={theme.colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {room.city} · {room.areaM2} m² · {room.guests} khách
          </Text>
        </View>
        <Text style={styles.price}>{formatVND(room.pricePerNight)}/đêm</Text>
      </View>
    </Pressable>
  );
}

// React.memo prevents re-rendering cards whose props haven't changed while
// scrolling / filtering the 500+ item feed.
export default memo(RoomCardBase, (prev, next) => prev.room === next.room);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    height: ROOM_CARD_HEIGHT,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  thumb: {
    width: 76,
    height: "100%",
    borderRadius: theme.radius.sm,
    overflow: "hidden",
  },
  statusBadge: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 2,
    alignItems: "center",
  },
  statusText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
    gap: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 14,
    flexShrink: 1,
    marginRight: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  price: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 13,
    marginTop: 2,
  },
});