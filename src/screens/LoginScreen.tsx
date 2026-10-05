import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { theme } from "@/theme/theme";
import PrimaryButton from "@/components/PrimaryButton";
import AuthField from "@/components/AuthField";
import { loginUser } from "@/api/mockApi";
import { useAuthStore } from "@/store/authStore";
import { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const profile = await loginUser(email, password);
      signIn(profile.id); // chuyển sang màn hình chính
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng nhập không thành công.");
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <Ionicons name="book" size={34} color={theme.colors.bg} />
          </View>
          <Text style={styles.title}>Đặt phòng học</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>

          <AuthField
            label="Email"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            placeholder="ten@example.com"
            keyboardType="email-address"
          />
          <AuthField
            label="Mật khẩu"
            icon="lock-closed"
            secure
            value={password}
            onChangeText={setPassword}
            placeholder="Nhập mật khẩu"
            onSubmitEditing={handleLogin}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <PrimaryButton title="Đăng nhập" loading={loading} onPress={handleLogin} style={{ marginTop: 6 }} />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Chưa có tài khoản?</Text>
            <Pressable onPress={() => navigation.navigate("Register")} hitSlop={8}>
              <Text style={styles.switchLink}> Đăng ký</Text>
            </Pressable>
          </View>

          <View style={styles.demo}>
            <Text style={styles.demoTitle}>Tài khoản dùng thử</Text>
            <Text style={styles.demoText}>thulam@example.com</Text>
            <Text style={styles.demoText}>Mật khẩu: 123456</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 24, paddingTop: 48 },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  title: { color: theme.colors.text, fontSize: 26, fontWeight: "800", textAlign: "center", marginTop: 16 },
  subtitle: { color: theme.colors.textMuted, fontSize: 14, textAlign: "center", marginTop: 4, marginBottom: 32 },
  error: { color: theme.colors.danger, fontSize: 13, marginBottom: 8 },
  switchRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  switchText: { color: theme.colors.textMuted, fontSize: 14 },
  switchLink: { color: theme.colors.primary, fontSize: 14, fontWeight: "700" },
  demo: {
    marginTop: 32,
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    gap: 2,
  },
  demoTitle: { color: theme.colors.textMuted, fontSize: 11, marginBottom: 4 },
  demoText: { color: theme.colors.text, fontSize: 13 },
});
