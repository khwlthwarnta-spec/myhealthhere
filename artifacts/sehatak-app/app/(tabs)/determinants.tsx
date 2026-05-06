import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const determinants = [
  {
    icon: "heart" as const,
    title: "الصحة الشخصية",
    description: "العوامل الوراثية والتاريخ الصحي العائلي الذي يشكل أساس بنيتك الجسدية.",
    color: "#ef4444",
    bg: "#ef444420",
  },
  {
    icon: "run" as const,
    title: "نمط الحياة",
    description: "الخيارات اليومية من النوم والعمل والترفيه التي تؤثر بشكل مباشر على جودة حياتك.",
    color: "#43a876",
    bg: "#43a87620",
  },
  {
    icon: "leaf" as const,
    title: "البيئة",
    description: "المحيط الذي تعيش فيه، بما في ذلك جودة الهواء والماء والمساحات الخضراء المتاحة.",
    color: "#22c55e",
    bg: "#22c55e20",
  },
  {
    icon: "food-apple" as const,
    title: "التغذية",
    description: "ما تستهلكه يومياً من أطعمة ومشروبات تبني خلايا جسمك وتزوده بالطاقة.",
    color: "#f97316",
    bg: "#f9731620",
  },
  {
    icon: "dumbbell" as const,
    title: "النشاط البدني",
    description: "الحركة وممارسة الرياضة التي تعزز قوة العضلات وكفاءة الجهاز الدوري.",
    color: "#eab308",
    bg: "#eab30820",
  },
  {
    icon: "brain" as const,
    title: "الصحة النفسية",
    description: "حالتك العاطفية وقدرتك على التعامل مع ضغوط الحياة وبناء علاقات إيجابية.",
    color: "#a78bfa",
    bg: "#a78bfa20",
  },
];

export default function DeterminantsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: topPad + 16,
        paddingHorizontal: 20,
        paddingBottom: isWeb ? 34 : insets.bottom + 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Tajawal_800ExtraBold" }]}>
        محددات الصحة
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
        صحتك ليست مجرد غياب للمرض، بل هي نتاج تفاعل معقد لعدة عوامل في حياتك.
      </Text>

      <View style={styles.grid}>
        {determinants.map((item, index) => (
          <View
            key={index}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <LinearGradient
              colors={[item.bg, "transparent"]}
              style={styles.cardGradient}
            />
            <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
              <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
              {item.title}
            </Text>
            <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
              {item.description}
            </Text>
            <View style={[styles.cardBadge, { backgroundColor: item.bg }]}>
              <Text style={[styles.cardBadgeText, { color: item.color, fontFamily: "Tajawal_700Bold" }]}>
                {index + 1} / 6
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 28, fontWeight: "800", textAlign: "right", marginBottom: 8 },
  pageSubtitle: { fontSize: 14, textAlign: "right", lineHeight: 22, marginBottom: 24 },
  grid: { gap: 14 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    overflow: "hidden",
    position: "relative",
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", textAlign: "right", marginBottom: 8 },
  cardDesc: { fontSize: 14, textAlign: "right", lineHeight: 22, marginBottom: 12 },
  cardBadge: {
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  cardBadgeText: { fontSize: 12, fontWeight: "700" },
});
