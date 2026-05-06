import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type Gender = "male" | "female";

type Results = {
  bmi: number;
  bmiClass: string;
  bmiColor: string;
  bmr: number;
  calories: number;
  water: number;
  sleep: string;
  healthScore: number;
  healthLabel: string;
};

function getBmiInfo(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "نحيف", color: "#38bdf8" };
  if (bmi < 25) return { label: "طبيعي", color: "#22c55e" };
  if (bmi < 30) return { label: "زائد الوزن", color: "#f59e0b" };
  return { label: "سمنة", color: "#ef4444" };
}

function calculate(weight: number, height: number, age: number, gender: Gender): Results {
  const h = height / 100;
  const bmi = +(weight / (h * h)).toFixed(1);
  const { label: bmiClass, color: bmiColor } = getBmiInfo(bmi);

  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  const calories = Math.round(bmr * 1.4);
  const water = +(weight * 0.033).toFixed(1);

  const sleep = age < 18 ? "8-10" : age < 65 ? "7-9" : "7-8";

  let score = 50;
  if (bmi >= 18.5 && bmi < 25) score += 30;
  else if (bmi >= 25 && bmi < 30) score += 15;
  const healthScore = Math.min(100, score + 20);
  const healthLabel =
    healthScore >= 80 ? "ممتاز" : healthScore >= 60 ? "جيد" : "يحتاج تحسين";

  return { bmi, bmiClass, bmiColor, bmr: Math.round(bmr), calories, water, sleep, healthScore, healthLabel };
}

function StatCard({ label, value, unit, color, icon }: {
  label: string; value: string; unit: string; color: string; icon: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <MaterialCommunityIcons name={icon as any} size={22} color={color} style={{ alignSelf: "flex-end" }} />
      <Text style={[styles.statValue, { color, fontFamily: "Tajawal_700Bold" }]}>{value}</Text>
      <Text style={[styles.statUnit, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>{unit}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>{label}</Text>
    </View>
  );
}

export default function DiscoverScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [results, setResults] = useState<Results | null>(null);

  const handleCalculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);

    if (!w || !h || !a || w < 30 || w > 300 || h < 100 || h > 250 || a < 10 || a > 100) {
      Alert.alert("خطأ", "الرجاء إدخال بيانات صحيحة");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setResults(calculate(w, h, a, gender));
  };

  const inputStyle = [styles.input, {
    backgroundColor: colors.muted,
    color: colors.foreground,
    borderColor: colors.border,
    fontFamily: "Tajawal_400Regular",
  }];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: topPad + 16,
        paddingHorizontal: 20,
        paddingBottom: isWeb ? 34 : insets.bottom + 20,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Tajawal_800ExtraBold" }]}>
        اكتشف نفسك
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
        أدخل بياناتك للحصول على تحليل صحي شخصي
      </Text>

      {/* Form */}
      <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Gender */}
        <Text style={[styles.label, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>الجنس</Text>
        <View style={styles.genderRow}>
          {(["male", "female"] as Gender[]).map((g) => (
            <Pressable
              key={g}
              onPress={() => setGender(g)}
              style={[
                styles.genderBtn,
                {
                  backgroundColor: gender === g ? colors.primary : colors.muted,
                  borderColor: gender === g ? colors.primary : colors.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={g === "male" ? "human-male" : "human-female"}
                size={20}
                color={gender === g ? "#fff" : colors.mutedForeground}
              />
              <Text style={[styles.genderText, {
                color: gender === g ? "#fff" : colors.mutedForeground,
                fontFamily: "Tajawal_700Bold"
              }]}>
                {g === "male" ? "ذكر" : "أنثى"}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>الوزن (كغ)</Text>
        <TextInput
          style={inputStyle}
          placeholder="مثال: 70"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          textAlign="right"
        />

        <Text style={[styles.label, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>الطول (سم)</Text>
        <TextInput
          style={inputStyle}
          placeholder="مثال: 170"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
          textAlign="right"
        />

        <Text style={[styles.label, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>العمر</Text>
        <TextInput
          style={inputStyle}
          placeholder="مثال: 20"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          textAlign="right"
        />

        <Pressable
          onPress={handleCalculate}
          style={({ pressed }) => [
            styles.calcBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Ionicons name="calculator" size={20} color="#fff" />
          <Text style={[styles.calcBtnText, { fontFamily: "Tajawal_700Bold" }]}>احسب</Text>
        </Pressable>
      </View>

      {/* Results */}
      {results && (
        <View style={styles.results}>
          {/* BMI */}
          <View style={[styles.bmiCard, { backgroundColor: results.bmiColor + "15", borderColor: results.bmiColor + "40" }]}>
            <Text style={[styles.bmiLabel, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
              مؤشر كتلة الجسم
            </Text>
            <Text style={[styles.bmiValue, { color: results.bmiColor, fontFamily: "Tajawal_800ExtraBold" }]}>
              {results.bmi}
            </Text>
            <View style={[styles.bmiPill, { backgroundColor: results.bmiColor + "25" }]}>
              <Text style={[styles.bmiClass, { color: results.bmiColor, fontFamily: "Tajawal_700Bold" }]}>
                {results.bmiClass}
              </Text>
            </View>
          </View>

          {/* Health score */}
          <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.scoreTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
              النقاط الصحية
            </Text>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreLabel, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                {results.healthLabel}
              </Text>
              <Text style={[styles.scoreNum, { color: colors.primary, fontFamily: "Tajawal_800ExtraBold" }]}>
                {results.healthScore} / 100
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
              <View style={[styles.progressFill, { width: `${results.healthScore}%` as any, backgroundColor: colors.primary }]} />
            </View>
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <StatCard label="السعرات اليومية" value={`${results.calories}`} unit="kcal" color="#f97316" icon="fire" />
            <StatCard label="الماء اليومي" value={`${results.water}`} unit="لتر" color="#38bdf8" icon="water" />
            <StatCard label="معدل الأيض" value={`${results.bmr}`} unit="kcal" color="#a78bfa" icon="lightning-bolt" />
            <StatCard label="النوم الموصى به" value={results.sleep} unit="ساعة" color="#22c55e" icon="sleep" />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 28, fontWeight: "800", textAlign: "right", marginBottom: 8 },
  pageSubtitle: { fontSize: 14, textAlign: "right", lineHeight: 22, marginBottom: 20 },
  formCard: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "700", textAlign: "right", marginBottom: 8, marginTop: 12 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  genderRow: { flexDirection: "row-reverse", gap: 10, marginBottom: 4 },
  genderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  genderText: { fontSize: 14, fontWeight: "700" },
  calcBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
  },
  calcBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  results: { gap: 16 },
  bmiCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  bmiLabel: { fontSize: 13, marginBottom: 8 },
  bmiValue: { fontSize: 64, fontWeight: "800", lineHeight: 72 },
  bmiPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  bmiClass: { fontSize: 16, fontWeight: "700" },
  scoreCard: { borderRadius: 20, borderWidth: 1, padding: 20 },
  scoreTitle: { fontSize: 16, fontWeight: "700", textAlign: "right", marginBottom: 12 },
  scoreRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  scoreNum: { fontSize: 22, fontWeight: "800" },
  scoreLabel: { fontSize: 14 },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "flex-end",
  },
  statValue: { fontSize: 24, fontWeight: "700", marginTop: 8 },
  statUnit: { fontSize: 12 },
  statLabel: { fontSize: 12, marginTop: 4 },
});
