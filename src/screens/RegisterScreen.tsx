import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { theme } from "@/theme/theme";
import PrimaryButton from "@/components/PrimaryButton";
import AuthField from "@/components/AuthField";
import { registerUser } from "@/api/mockApi";
import { useAuthStore } from "@/store/authStore";
import { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const signIn = useAuthStore((s) => s.signIn);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError("");
    if (password !== confirm) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    setLoading(true);
    try {
      const profile = await registerUser({ name, email, phone, password });
      signIn(profile.id); // đăng ký xong tự đăng nhập
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng ký không thành công.");
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Điền thông tin để bắt đầu đặt phòng học</Text>

          <AuthField label="Họ tên" icon="person" value={name} onChangeText={setName} placeholder="Nguyễn Văn A" autoCapitalize="words" />
          <AuthField label="Email" icon="mail" value={email} onChangeText={setEmail} placeholder="ten@example.com" keyboardType="email-address" />
          <AuthField label="Số điện thoại (không bắt buộc)" icon="call" value={phone} onChangeText={setPhone} placeholder="09xx xxx xxx" keyboardType="phone-pad" />
          <AuthField label="Mật khẩu" icon="lock-closed" secure value={password} onChangeText={setPassword} placeholder="Ít nhất 6 ký tự" />
          <AuthField label="Nhập lại mật khẩu" icon="lock-closed" secure value={confirm} onChangeText={setConfirm} placeholder="Nhập lại mật khẩu" onSubmitEditing={handleRegister} />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <PrimaryButton title="Đăng ký" loading={loading} onPress={handleRegister} style={{ marginTop: 6 }} />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Đã có tài khoản?</Text>
            <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
              <Text style={styles.switchLink}> Đăng nhập</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 24, paddingTop: 32 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: theme.colors.textMuted, fontSize: 14, marginTop: 4, marginBottom: 24 },
  error: { color: theme.colors.danger, fontSize: 13, marginBottom: 8 },
  switchRow: { flexDirection: "row", justifyContent: "center", marginTop: 20, marginBottom: 24 },
  switchText: { color: theme.colors.textMuted, fontSize: 14 },
  switchLink: { color: theme.colors.primary, fontSize: 14, fontWeight: "700" },
});
