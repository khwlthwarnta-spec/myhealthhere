import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    setError("");
    if (!email.trim() || !password.trim() || !confirm.trim()) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("البريد الإلكتروني غير صالح");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password);
      router.replace({ pathname: "/(auth)/verify", params: { email: email.trim() } });
    } catch (e: any) {
      setError(e.message ?? "حدث خطأ، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={[styles.logoCircle, { borderColor: colors.primary + "50", backgroundColor: colors.card }]}>
            <MaterialCommunityIcons name="account-plus" size={44} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.foreground, fontFamily: "Tajawal_800ExtraBold" }]}>
            إنشاء حساب
          </Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
            انضم إلى صحتك أولاً 💙
          </Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Tajawal_500Medium" }]}>
              البريد الإلكتروني
            </Text>
            <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: "Tajawal_400Regular" }]}
                placeholder="example@email.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textAlign="right"
              />
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.mutedForeground} style={styles.inputIcon} />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Tajawal_500Medium" }]}>
              كلمة المرور
            </Text>
            <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <MaterialCommunityIcons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.mutedForeground}
                />
              </Pressable>
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: "Tajawal_400Regular" }]}
                placeholder="6 أحرف على الأقل"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                textAlign="right"
              />
              <MaterialCommunityIcons name="lock-outline" size={20} color={colors.mutedForeground} style={styles.inputIcon} />
            </View>
          </View>

          {/* Confirm password */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Tajawal_500Medium" }]}>
              تأكيد كلمة المرور
            </Text>
            <View style={[
              styles.inputRow,
              {
                backgroundColor: colors.background,
                borderColor: confirm && confirm !== password ? "#ef4444" : colors.border,
              },
            ]}>
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: "Tajawal_400Regular" }]}
                placeholder="أعد كتابة كلمة المرور"
                placeholderTextColor={colors.mutedForeground}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPass}
                textAlign="right"
              />
              <MaterialCommunityIcons name="lock-check-outline" size={20} color={colors.mutedForeground} style={styles.inputIcon} />
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: "#ef444420", borderColor: "#ef4444" }]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#ef4444" />
              <Text style={[styles.errorText, { fontFamily: "Tajawal_400Regular" }]}>{error}</Text>
            </View>
          ) : null}

          {/* Register button */}
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: colors.primary, opacity: pressed || loading ? 0.8 : 1 },
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.btnText, { fontFamily: "Tajawal_700Bold" }]}>إنشاء الحساب</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>لديك حساب؟</Text>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
          </View>

          {/* Login link */}
          <Pressable
            style={({ pressed }) => [
              styles.outlineBtn,
              { borderColor: colors.primary, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={[styles.outlineBtnText, { color: colors.primary, fontFamily: "Tajawal_700Bold" }]}>
              تسجيل الدخول
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { paddingHorizontal: 20, flexGrow: 1, justifyContent: "center" },
  logoWrap: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2, alignItems: "center", justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#43a876", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  appName: { fontSize: 28, fontWeight: "900" },
  tagline: { fontSize: 14, marginTop: 4 },
  card: {
    borderRadius: 24, borderWidth: 1, padding: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 6,
  },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 8, textAlign: "right" },
  inputRow: {
    flexDirection: "row-reverse", alignItems: "center",
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 52,
  },
  input: { flex: 1, fontSize: 15, textAlign: "right" },
  inputIcon: { marginLeft: 10 },
  eyeBtn: { padding: 4, marginRight: 4 },
  errorBox: {
    flexDirection: "row-reverse", alignItems: "center", gap: 8,
    borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 16,
  },
  errorText: { color: "#ef4444", fontSize: 13, flex: 1, textAlign: "right" },
  btn: {
    borderRadius: 16, height: 54, alignItems: "center",
    justifyContent: "center", marginTop: 4,
    shadowColor: "#43a876", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20, gap: 12 },
  line: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  outlineBtn: {
    borderRadius: 16, height: 54, alignItems: "center",
    justifyContent: "center", borderWidth: 1.5,
  },
  outlineBtnText: { fontSize: 16, fontWeight: "700" },
});
