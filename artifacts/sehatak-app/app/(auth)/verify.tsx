import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

const CODE_LENGTH = 6;

export default function VerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { verifyOtp, resendOtp } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleDigit(val: string, idx: number) {
    const cleaned = val.replace(/[^0-9]/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[idx] = "";
      setDigits(next);
      if (idx > 0) inputRefs.current[idx - 1]?.focus();
      return;
    }
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, CODE_LENGTH).split("");
      const next = [...digits];
      pasted.forEach((d, i) => { if (idx + i < CODE_LENGTH) next[idx + i] = d; });
      setDigits(next);
      const lastFilled = Math.min(idx + pasted.length, CODE_LENGTH - 1);
      inputRefs.current[lastFilled]?.focus();
      return;
    }
    const next = [...digits];
    next[idx] = cleaned;
    setDigits(next);
    if (idx < CODE_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  }

  async function handleVerify() {
    const code = digits.join("");
    if (code.length < CODE_LENGTH) {
      setError("أدخل الرمز المكون من 6 أرقام");
      return;
    }
    setError("");
    Keyboard.dismiss();
    setLoading(true);
    try {
      await verifyOtp(email ?? "", code);
    } catch (e: any) {
      setError(e.message ?? "الرمز غير صحيح");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      await resendOtp(email ?? "");
      setSuccess("تم إعادة إرسال الرمز");
      setCountdown(60);
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: any) {
      setError(e.message ?? "حدث خطأ");
    } finally {
      setResending(false);
    }
  }

  const maskEmail = (e: string) => {
    const [user, domain] = (e ?? "").split("@");
    if (!user || !domain) return e;
    return `${user[0]}${"*".repeat(Math.max(0, user.length - 2))}${user[user.length - 1] ?? ""}@${domain}`;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>

        {/* Back button */}
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-right" size={24} color={colors.foreground} />
        </Pressable>

        {/* Icon */}
        <View style={styles.centerContent}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
            <MaterialCommunityIcons name="email-check-outline" size={52} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Tajawal_800ExtraBold" }]}>
            تحقق من بريدك
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
            أرسلنا رمز التحقق إلى{"\n"}
            <Text style={[styles.emailText, { color: colors.primary, fontFamily: "Tajawal_700Bold" }]}>
              {maskEmail(email ?? "")}
            </Text>
          </Text>

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {digits.map((d, idx) => (
              <TextInput
                key={idx}
                ref={(r) => { inputRefs.current[idx] = r; }}
                style={[
                  styles.otpBox,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.card,
                    borderColor: d ? colors.primary : colors.border,
                    fontFamily: "Tajawal_700Bold",
                    shadowColor: d ? colors.primary : "transparent",
                  },
                ]}
                value={d}
                onChangeText={(v) => handleDigit(v, idx)}
                keyboardType="number-pad"
                maxLength={6}
                selectTextOnFocus
                textAlign="center"
              />
            ))}
          </View>

          {/* Error / Success */}
          {error ? (
            <View style={[styles.msgBox, { backgroundColor: "#ef444420", borderColor: "#ef4444" }]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#ef4444" />
              <Text style={[styles.msgText, { color: "#ef4444", fontFamily: "Tajawal_400Regular" }]}>{error}</Text>
            </View>
          ) : success ? (
            <View style={[styles.msgBox, { backgroundColor: "#22c55e20", borderColor: "#22c55e" }]}>
              <MaterialCommunityIcons name="check-circle-outline" size={16} color="#22c55e" />
              <Text style={[styles.msgText, { color: "#22c55e", fontFamily: "Tajawal_400Regular" }]}>{success}</Text>
            </View>
          ) : null}

          {/* Verify button */}
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: colors.primary, opacity: pressed || loading ? 0.8 : 1 },
            ]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.btnText, { fontFamily: "Tajawal_700Bold" }]}>تأكيد الرمز</Text>
            )}
          </Pressable>

          {/* Resend */}
          <Pressable
            style={[styles.resendBtn, { opacity: countdown > 0 ? 0.5 : 1 }]}
            onPress={handleResend}
            disabled={countdown > 0 || resending}
          >
            {resending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.resendText, { color: colors.primary, fontFamily: "Tajawal_500Medium" }]}>
                {countdown > 0 ? `إعادة الإرسال خلال ${countdown}ث` : "إعادة إرسال الرمز"}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24 },
  backBtn: { alignSelf: "flex-end", padding: 8 },
  centerContent: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  iconCircle: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 2, alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 26, fontWeight: "900", textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  emailText: { fontSize: 14 },
  otpRow: { flexDirection: "row", gap: 10, marginVertical: 8 },
  otpBox: {
    width: 48, height: 58, borderRadius: 14, borderWidth: 2,
    fontSize: 24, fontWeight: "900", textAlign: "center",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3,
    shadowRadius: 8, elevation: 4,
  },
  msgBox: {
    flexDirection: "row-reverse", alignItems: "center", gap: 8,
    borderRadius: 12, borderWidth: 1, padding: 12, width: "100%",
  },
  msgText: { fontSize: 13, flex: 1, textAlign: "right" },
  btn: {
    borderRadius: 16, height: 54, alignItems: "center",
    justifyContent: "center", width: "100%",
    shadowColor: "#43a876", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  resendBtn: { paddingVertical: 8 },
  resendText: { fontSize: 14 },
});
