import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme/theme";

interface Props {
  label: string;
  active: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export default function FilterChip({ label, active, icon, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={13}
          color={active ? theme.colors.bg : theme.colors.textMuted}
          style={{ marginRight: 4 }}
        />
      )}
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    marginRight: 8,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: theme.colors.chipActive,
    borderColor: theme.colors.chipActive,
  },
  chipInactive: {
    backgroundColor: theme.colors.chipInactive,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  labelActive: {
    color: theme.colors.bg,
  },
});
