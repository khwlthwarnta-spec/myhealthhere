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

const curriculum = [
  {
    title: "نمط الحياة الصحي",
    description: "بناء عادات يومية مستدامة تعزز الحيوية وتؤخر الشيخوخة.",
    icon: "heart-pulse" as const,
    color: "#43a876",
  },
  {
    title: "الأمراض المعدية",
    description: "فهم طرق انتقال العدوى وأساليب الوقاية الفعالة لحماية نفسك ومجتمعك.",
    icon: "virus" as const,
    color: "#ef4444",
  },
  {
    title: "الأمراض غير المعدية",
    description: "التعرف على الأمراض المزمنة مثل السكري وأمراض القلب وكيفية تقليل مخاطرها.",
    icon: "hospital" as const,
    color: "#f97316",
  },
  {
    title: "التوعية الصحية العامة",
    description: "نشر المعرفة وتصحيح المفاهيم الخاطئة حول الصحة في المجتمع.",
    icon: "account-group" as const,
    color: "#38bdf8",
  },
  {
    title: "محددات الصحة",
    description: "تحليل العوامل البيئية والاجتماعية والشخصية المؤثرة على صحتنا.",
    icon: "chart-arc" as const,
    color: "#a78bfa",
  },
];

const outcomes = [
  {
    icon: "target" as const,
    title: "فهم الصحة الشخصية",
    description: "إدراك عميق لاحتياجات جسمك وقدراته.",
    stat: "95%",
    label: "زيادة في الوعي الذاتي",
    color: "#43a876",
  },
  {
    icon: "shield-alert" as const,
    title: "التعرّف على المخاطر",
    description: "القدرة على التنبؤ بالمشكلات قبل حدوثها.",
    stat: "80%",
    label: "انخفاض في المخاطر",
    color: "#f59e0b",
  },
  {
    icon: "trending-up" as const,
    title: "تحسين العادات",
    description: "تطبيق خطوات عملية لبناء نمط حياة مستدام.",
    stat: "100%",
    label: "تغيير إيجابي",
    color: "#a78bfa",
  },
];

export default function CurriculumScreen() {
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
      {/* خطة التعلم */}
      <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Tajawal_800ExtraBold" }]}>
        خطة التعلّم
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
        خارطة طريق مبسطة لفهم شامل للصحة العامة
      </Text>

      <View style={styles.timeline}>
        {curriculum.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            {/* Line */}
            {index < curriculum.length - 1 && (
              <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
            )}
            {/* Dot */}
            <View style={[styles.timelineDot, { backgroundColor: item.color, borderColor: colors.background }]}>
              <MaterialCommunityIcons name={item.icon} size={14} color="#fff" />
            </View>
            {/* Content */}
            <View style={[styles.timelineContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.timelineHeader}>
                <View style={[styles.indexBadge, { backgroundColor: item.color + "20" }]}>
                  <Text style={[styles.indexText, { color: item.color, fontFamily: "Tajawal_700Bold" }]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={[styles.timelineTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                  {item.title}
                </Text>
              </View>
              <Text style={[styles.timelineDesc, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* نتائج التعلم */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Tajawal_800ExtraBold" }]}>
        نتائج التعلّم
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
        ماذا ستحقق بنهاية هذا الفصل؟
      </Text>

      <View style={styles.outcomesList}>
        {outcomes.map((item, index) => (
          <View
            key={index}
            style={[styles.outcomeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <LinearGradient
              colors={[item.color + "15", "transparent"]}
              style={styles.outcomeGradient}
            />
            <View style={styles.outcomeTop}>
              <View style={[styles.outcomeIcon, { backgroundColor: item.color + "20" }]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.outcomeStat}>
                <Text style={[styles.outcomeStatNum, { color: item.color, fontFamily: "Tajawal_800ExtraBold" }]}>
                  {item.stat}
                </Text>
                <Text style={[styles.outcomeStatLabel, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                  {item.label}
                </Text>
              </View>
            </View>
            <Text style={[styles.outcomeTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
              {item.title}
            </Text>
            <Text style={[styles.outcomeDesc, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
              {item.description}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 28, fontWeight: "800", textAlign: "right", marginBottom: 8 },
  pageSubtitle: { fontSize: 14, textAlign: "right", lineHeight: 22, marginBottom: 24 },
  sectionTitle: { fontSize: 24, fontWeight: "800", textAlign: "right", marginBottom: 8, marginTop: 8 },
  timeline: { marginBottom: 32, paddingRight: 8 },
  timelineItem: { flexDirection: "row-reverse", marginBottom: 16, position: "relative" },
  timelineLine: {
    position: "absolute",
    right: 18,
    top: 36,
    bottom: -16,
    width: 2,
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    zIndex: 1,
    marginLeft: 12,
    flexShrink: 0,
  },
  timelineContent: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  timelineHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 8 },
  indexBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  indexText: { fontSize: 13, fontWeight: "700" },
  timelineTitle: { fontSize: 15, fontWeight: "700", flex: 1, textAlign: "right" },
  timelineDesc: { fontSize: 13, lineHeight: 20, textAlign: "right" },
  outcomesList: { gap: 14 },
  outcomeCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    overflow: "hidden",
    position: "relative",
  },
  outcomeGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 100 },
  outcomeTop: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  outcomeIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  outcomeStat: { alignItems: "flex-end" },
  outcomeStatNum: { fontSize: 32, fontWeight: "800", lineHeight: 38 },
  outcomeStatLabel: { fontSize: 11 },
  outcomeTitle: { fontSize: 17, fontWeight: "700", textAlign: "right", marginBottom: 6 },
  outcomeDesc: { fontSize: 13, lineHeight: 20, textAlign: "right" },
});
