import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const team = [
  { role: "المبرمج", name: "حمزه نور الدين" },
  { role: "المصمم", name: "حمزه محمد" },
  { role: "كتابة المواضيع", name: "قتيبة مصطفى" },
  { role: "جلب المصادر", name: "محمد صالح" },
];

const quickCards = [
  { icon: "heart-pulse" as const, label: "محددات الصحة", count: "6", color: "#43a876", tab: "determinants" },
  { icon: "book-open-variant" as const, label: "مواضيع التعلم", count: "5", color: "#a78bfa", tab: "curriculum" },
  { icon: "calculator-variant" as const, label: "حاسبة صحية", count: "BMI", color: "#38bdf8", tab: "discover" },
];

function HeartLogo() {
  const colors = useColors();
  return (
    <View style={styles.logoContainer}>
      <View style={[styles.logoCircle, { borderColor: colors.primary + "40" }]}>
        <MaterialCommunityIcons name="heart-pulse" size={36} color={colors.primary} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: isWeb ? 34 : insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={[colors.primary + "20", colors.background]}
        style={[styles.hero, { paddingTop: topPad + 20 }]}
      >
        <HeartLogo />
        <Text style={[styles.heroTitle, { color: colors.foreground, fontFamily: "Tajawal_800ExtraBold" }]}>
          صحتك أولاً
        </Text>
        <Text style={[styles.heroSubtitle, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
          الفصل ٢ / ٥ • الوعي الصحي
        </Text>
        <Text style={[styles.heroDesc, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
          رحلتك نحو الوعي الصحي تبدأ هنا. اكتشف كيف تؤثر عاداتك اليومية على صحتك العامة.
        </Text>
      </LinearGradient>

      {/* Quick access cards */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
          استكشف التطبيق
        </Text>
        <View style={styles.cardsRow}>
          {quickCards.map((card) => (
            <Pressable
              key={card.tab}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/(tabs)/${card.tab}` as any);
              }}
              style={({ pressed }) => [
                styles.quickCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View style={[styles.quickCardIcon, { backgroundColor: card.color + "20" }]}>
                <MaterialCommunityIcons name={card.icon} size={26} color={card.color} />
              </View>
              <Text style={[styles.quickCardCount, { color: card.color, fontFamily: "Tajawal_700Bold" }]}>
                {card.count}
              </Text>
              <Text style={[styles.quickCardLabel, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                {card.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* About section */}
      <View style={styles.section}>
        <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.aboutHeader}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={[styles.aboutTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
              عن هذا الفصل
            </Text>
          </View>
          <Text style={[styles.aboutText, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
            صحتك ليست مجرد غياب للمرض، بل هي نتاج تفاعل معقد لعدة عوامل في حياتك. ستتعلم في هذا الفصل كيف تفهم محددات الصحة وتتحكم فيها لتبني حياة أفضل.
          </Text>
        </View>
      </View>

      {/* Team */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
          فريق العمل
        </Text>
        <View style={[styles.teamCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {team.map((member, i) => (
            <View
              key={i}
              style={[
                styles.teamRow,
                i < team.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.teamName, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                {member.name}
              </Text>
              <Text style={[styles.teamRole, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                {member.role}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  logoContainer: { marginBottom: 16 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { fontSize: 36, fontWeight: "800", marginBottom: 4 },
  heroSubtitle: { fontSize: 14, marginBottom: 12 },
  heroDesc: { fontSize: 15, textAlign: "center", lineHeight: 24 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, textAlign: "right" },
  cardsRow: { flexDirection: "row", gap: 10 },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  quickCardIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  quickCardCount: { fontSize: 20, fontWeight: "700" },
  quickCardLabel: { fontSize: 11, textAlign: "center" },
  aboutCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  aboutHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 10 },
  aboutTitle: { fontSize: 16, fontWeight: "700" },
  aboutText: { fontSize: 14, lineHeight: 24, textAlign: "right" },
  teamCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  teamRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", padding: 14 },
  teamName: { fontSize: 14, fontWeight: "700" },
  teamRole: { fontSize: 13 },
});
