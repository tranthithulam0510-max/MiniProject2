import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme/theme";

interface Props extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  secure?: boolean; // ô mật khẩu có nút hiện/ẩn
}

export default function AuthField({ label, icon, secure, ...input }: Props) {
  const [hidden, setHidden] = useState(true);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        <Ionicons name={icon} size={18} color={theme.colors.textMuted} />
        <TextInput
          {...input}
          style={styles.input}
          secureTextEntry={secure ? hidden : false}
          placeholderTextColor={theme.colors.textFaint}
          autoCapitalize={input.autoCapitalize ?? "none"}
          autoCorrect={false}
        />
        {secure && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8} accessibilityLabel="Hiện hoặc ẩn mật khẩu">
            <Ionicons name={hidden ? "eye-off" : "eye"} size={18} color={theme.colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { color: theme.colors.textMuted, fontSize: 12, marginBottom: 6 },
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: { flex: 1, color: theme.colors.text, fontSize: 14, height: "100%" },
});
