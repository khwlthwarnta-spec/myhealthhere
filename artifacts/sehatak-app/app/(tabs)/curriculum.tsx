import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TOP_TAB_HEIGHT } from "@/components/TopTabBar";
import { BluetoothModal } from "@/components/BluetoothModal";
import { useBluetooth } from "@/contexts/BluetoothContext";
import { useColors } from "@/hooks/useColors";

const curriculum = [
  { title: "نمط الحياة الصحي",        description: "بناء عادات يومية مستدامة تعزز الحيوية وتؤخر الشيخوخة.",                                  icon: "heart-pulse"   as const, color: "#43a876" },
  { title: "الأمراض المعدية",          description: "فهم طرق انتقال العدوى وأساليب الوقاية الفعالة لحماية نفسك ومجتمعك.",                     icon: "virus"         as const, color: "#ef4444" },
  { title: "الأمراض غير المعدية",      description: "التعرف على الأمراض المزمنة مثل السكري وأمراض القلب وكيفية تقليل مخاطرها.",               icon: "hospital"      as const, color: "#f97316" },
  { title: "التوعية الصحية العامة",    description: "نشر المعرفة وتصحيح المفاهيم الخاطئة حول الصحة في المجتمع.",                              icon: "account-group" as const, color: "#38bdf8" },
  { title: "محددات الصحة",             description: "تحليل العوامل البيئية والاجتماعية والشخصية المؤثرة على صحتنا.",                            icon: "chart-arc"     as const, color: "#a78bfa" },
];

const outcomes = [
  { icon: "target"       as const, title: "فهم الصحة الشخصية",  description: "إدراك عميق لاحتياجات جسمك وقدراته.",               stat: "95%", label: "زيادة في الوعي الذاتي", color: "#43a876" },
  { icon: "shield-alert" as const, title: "التعرّف على المخاطر", description: "القدرة على التنبؤ بالمشكلات قبل حدوثها.",          stat: "80%", label: "انخفاض في المخاطر",     color: "#f59e0b" },
  { icon: "trending-up"  as const, title: "تحسين العادات",       description: "تطبيق خطوات عملية لبناء نمط حياة مستدام.",        stat: "100%", label: "تغيير إيجابي",        color: "#a78bfa" },
];

type WeeklyChallenge = {
  id: string;
  day: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  metricKey: string;
  verify: (val: number) => boolean;
  hint: string;
};

const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  { id: "steps",  day: "الأحد",    title: "8,000 خطوة",           description: "امشِ 8,000 خطوة على الأقل اليوم",       icon: "walk",         color: "#43a876", metricKey: "steps", verify: (v) => v >= 8000, hint: "تحقق من خطواتك عبر الساعة" },
  { id: "water",  day: "الاثنين",  title: "2 لتر ماء",            description: "اشرب كميتك المطلوبة من الماء",          icon: "water",        color: "#38bdf8", metricKey: "spo2",  verify: (v) => v >= 96,   hint: "تشبع الأكسجين 96%+ يعكس الترطيب الجيد" },
  { id: "sleep",  day: "الثلاثاء", title: "7 ساعات نوم",          description: "نم 7 ساعات أو أكثر الليلة الماضية",     icon: "sleep",        color: "#a78bfa", metricKey: "sleep", verify: (v) => v >= 7.0,  hint: "مدة النوم من الساعة الذكية" },
  { id: "heart",  day: "الأربعاء", title: "معدل قلب صحي",         description: "حافظ على معدل قلب بين 60 و 100 نبضة",  icon: "heart-pulse",  color: "#ef4444", metricKey: "heart", verify: (v) => v >= 60 && v <= 100, hint: "يُقاس مباشرة من الساعة" },
  { id: "cals",   day: "الخميس",   title: "400 سعرة محروقة",      description: "احرق 400 سعرة حرارية على الأقل",        icon: "fire",         color: "#f97316", metricKey: "cals",  verify: (v) => v >= 400,  hint: "السعرات المحروقة من الساعة" },
  { id: "temp",   day: "الجمعة",   title: "حرارة طبيعية",         description: "درجة حرارة جسمك بين 36.1 و 37.5",      icon: "thermometer",  color: "#eab308", metricKey: "temp",  verify: (v) => v >= 36.1 && v <= 37.5, hint: "قياس حراري من الساعة الذكية" },
  { id: "active", day: "السبت",    title: "يوم نشاط متكامل",      description: "خطوات + سعرات + نوم كلها ضمن المعدل",   icon: "trophy",       color: "#43a876", metricKey: "steps", verify: (v) => v >= 6000,  hint: "إتمام 3 تحديات في اليوم" },
];

function WeeklyChallengesSection() {
  const colors = useColors();
  const { isConnected, healthData } = useBluetooth();
  const [showBtModal, setShowBtModal] = useState(false);

  const getMetricValue = (key: string): number => {
    const m = healthData.find((h) => h.key === key);
    if (!m) return 0;
    return parseFloat(m.value);
  };

  const isChallengeCompleted = (ch: WeeklyChallenge): boolean => {
    if (!isConnected) return false;
    return ch.verify(getMetricValue(ch.metricKey));
  };

  const completedCount = WEEKLY_CHALLENGES.filter((ch) => isChallengeCompleted(ch)).length;

  return (
    <View style={{ marginBottom: 32 }}>
      <View style={styles.weeklyHeader}>
        <View style={styles.weeklyTitleRow}>
          <View style={[styles.weeklyBadge, { backgroundColor: "#43a876" + "20" }]}>
            <Text style={[styles.weeklyBadgeText, { color: "#43a876", fontFamily: "Tajawal_700Bold" }]}>
              {completedCount}/{WEEKLY_CHALLENGES.length}
            </Text>
          </View>
          <Text style={[styles.weeklyTitle, { color: colors.foreground, fontFamily: "Tajawal_800ExtraBold" }]}>
            التحديات الأسبوعية
          </Text>
        </View>
        <Text style={[styles.weeklySubtitle, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
          أكمل تحديات الأسبوع عبر ربط ساعتك الذكية
        </Text>
      </View>

      {!isConnected && (
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowBtModal(true); }}
          style={({ pressed }) => [styles.connectBanner, { backgroundColor: "#1a2e22", borderColor: "#43a876" + "50", opacity: pressed ? 0.88 : 1 }]}
        >
          <MaterialCommunityIcons name="bluetooth-audio" size={20} color="#43a876" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.connectBannerTitle, { fontFamily: "Tajawal_700Bold" }]}>اربط ساعتك لتفعيل التحديات</Text>
            <Text style={[styles.connectBannerSub, { fontFamily: "Tajawal_400Regular" }]}>سيتم التحقق من إنجازك تلقائياً</Text>
          </View>
          <MaterialCommunityIcons name="chevron-left" size={20} color="#43a876" />
        </Pressable>
      )}

      {isConnected && (
        <View style={[styles.progressBar, { backgroundColor: colors.muted, marginBottom: 16 }]}>
          <View style={[styles.progressFill, { width: `${(completedCount / WEEKLY_CHALLENGES.length) * 100}%` as any, backgroundColor: "#43a876" }]} />
        </View>
      )}

      <View style={styles.challengesList}>
        {WEEKLY_CHALLENGES.map((ch, i) => {
          const completed = isChallengeCompleted(ch);
          const locked = !isConnected;
          return (
            <Pressable
              key={ch.id}
              onPress={() => {
                if (locked) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowBtModal(true);
                } else {
                  Haptics.selectionAsync();
                }
              }}
              style={({ pressed }) => [
                styles.challengeRow,
                {
                  backgroundColor: completed ? ch.color + "12" : colors.card,
                  borderColor: completed ? ch.color + "50" : colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <View style={styles.challengeRight}>
                {completed ? (
                  <View style={[styles.checkCircle, { backgroundColor: ch.color }]}>
                    <MaterialCommunityIcons name="check" size={18} color="#fff" />
                  </View>
                ) : locked ? (
                  <View style={[styles.checkCircle, { backgroundColor: colors.muted, borderWidth: 2, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="lock-outline" size={16} color={colors.mutedForeground} />
                  </View>
                ) : (
                  <View style={[styles.checkCircle, { backgroundColor: colors.muted, borderWidth: 2, borderColor: ch.color + "40" }]}>
                    <MaterialCommunityIcons name={ch.icon as any} size={16} color={ch.color + "80"} />
                  </View>
                )}

                <View style={styles.challengeInfo}>
                  <View style={styles.challengeTitleRow}>
                    <View style={[styles.dayBadge, { backgroundColor: ch.color + "20" }]}>
                      <Text style={[styles.dayText, { color: ch.color, fontFamily: "Tajawal_700Bold" }]}>{ch.day}</Text>
                    </View>
                    <Text style={[styles.challengeTitle, { color: completed ? ch.color : colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                      {ch.title}
                    </Text>
                  </View>
                  <Text style={[styles.challengeDesc, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                    {ch.description}
                  </Text>
                  {isConnected && !completed && (
                    <Text style={[styles.challengeHint, { color: ch.color, fontFamily: "Tajawal_400Regular" }]}>
                      💡 {ch.hint}
                    </Text>
                  )}
                </View>
              </View>

              <View style={[styles.challengeIcon, { backgroundColor: completed ? ch.color : ch.color + "15" }]}>
                <MaterialCommunityIcons name={ch.icon as any} size={22} color={completed ? "#fff" : ch.color} />
              </View>
            </Pressable>
          );
        })}
      </View>

      {isConnected && completedCount === WEEKLY_CHALLENGES.length && (
        <View style={[styles.perfectBanner, { backgroundColor: "#43a876" + "15", borderColor: "#43a876" + "40" }]}>
          <MaterialCommunityIcons name="trophy" size={28} color="#43a876" />
          <View>
            <Text style={[styles.perfectTitle, { color: "#43a876", fontFamily: "Tajawal_700Bold" }]}>أسبوع مثالي! 🎉</Text>
            <Text style={[styles.perfectSub, { color: "#43a876" + "aa", fontFamily: "Tajawal_400Regular" }]}>أكملت جميع تحديات الأسبوع</Text>
          </View>
        </View>
      )}

      <BluetoothModal visible={showBtModal} onClose={() => setShowBtModal(false)} />
    </View>
  );
}

export default function CurriculumScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 + TOP_TAB_HEIGHT : insets.top + TOP_TAB_HEIGHT;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingHorizontal: 20, paddingBottom: isWeb ? 34 : insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Tajawal_800ExtraBold" }]}>
        خطة التعلّم
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
        خارطة طريق مبسطة لفهم شامل للصحة العامة
      </Text>

      {/* Weekly Challenges */}
      <WeeklyChallengesSection />

      {/* Curriculum Timeline */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Tajawal_800ExtraBold" }]}>
        مواضيع الفصل
      </Text>
      <View style={styles.timeline}>
        {curriculum.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            {index < curriculum.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
            <View style={[styles.timelineDot, { backgroundColor: item.color, borderColor: colors.background }]}>
              <MaterialCommunityIcons name={item.icon} size={14} color="#fff" />
            </View>
            <View style={[styles.timelineContent, { backgroundColor: colors.card, borderColor: item.color + "50", shadowColor: item.color, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 }]}>
              <View style={styles.timelineHeader}>
                <View style={[styles.indexBadge, { backgroundColor: item.color + "20" }]}>
                  <Text style={[styles.indexText, { color: item.color, fontFamily: "Tajawal_700Bold" }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.timelineTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>{item.title}</Text>
              </View>
              <Text style={[styles.timelineDesc, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Outcomes */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Tajawal_800ExtraBold" }]}>
        نتائج التعلّم
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
        ماذا ستحقق بنهاية هذا الفصل؟
      </Text>
      <View style={styles.outcomesList}>
        {outcomes.map((item, index) => (
          <View key={index} style={[styles.outcomeCard, { backgroundColor: colors.card, borderColor: item.color + "40", shadowColor: item.color, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 5 }]}>
            <LinearGradient colors={[item.color + "18", "transparent"]} style={styles.outcomeGradient} />
            <View style={styles.outcomeTop}>
              <View style={[styles.outcomeIcon, { backgroundColor: item.color + "20" }]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.outcomeStat}>
                <Text style={[styles.outcomeStatNum, { color: item.color, fontFamily: "Tajawal_800ExtraBold" }]}>{item.stat}</Text>
                <Text style={[styles.outcomeStatLabel, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>{item.label}</Text>
              </View>
            </View>
            <Text style={[styles.outcomeTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>{item.title}</Text>
            <Text style={[styles.outcomeDesc, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>{item.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle:    { fontSize: 28, fontWeight: "800", textAlign: "right", marginBottom: 8 },
  pageSubtitle: { fontSize: 14, textAlign: "right", lineHeight: 22, marginBottom: 24 },
  sectionTitle: { fontSize: 24, fontWeight: "800", textAlign: "right", marginBottom: 12, marginTop: 8 },

  weeklyHeader: { marginBottom: 14 },
  weeklyTitleRow: { flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 6 },
  weeklyTitle: { fontSize: 22, fontWeight: "800" },
  weeklyBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  weeklyBadgeText: { fontSize: 13 },
  weeklySubtitle: { fontSize: 13, textAlign: "right", lineHeight: 20 },

  connectBanner: { flexDirection: "row-reverse", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1.5, marginBottom: 16 },
  connectBannerTitle: { color: "#fff", fontSize: 15 },
  connectBannerSub: { color: "#43a876aa", fontSize: 12, marginTop: 2 },

  progressBar: { height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 0 },
  progressFill: { height: 6, borderRadius: 3 },

  challengesList: { gap: 10 },
  challengeRow: { flexDirection: "row-reverse", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  challengeRight: { flex: 1, flexDirection: "row-reverse", alignItems: "flex-start", gap: 12 },
  checkCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  challengeInfo: { flex: 1, gap: 4 },
  challengeTitleRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8, flexWrap: "wrap" },
  dayBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  dayText: { fontSize: 11 },
  challengeTitle: { fontSize: 15, fontWeight: "700" },
  challengeDesc: { fontSize: 12, lineHeight: 18, textAlign: "right" },
  challengeHint: { fontSize: 11, textAlign: "right" },
  challengeIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },

  perfectBanner: { flexDirection: "row-reverse", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1, marginTop: 12 },
  perfectTitle: { fontSize: 16 },
  perfectSub: { fontSize: 12, marginTop: 2 },

  timeline: { marginBottom: 32, paddingRight: 8 },
  timelineItem: { flexDirection: "row-reverse", marginBottom: 16, position: "relative" },
  timelineLine: { position: "absolute", right: 18, top: 36, bottom: -16, width: 2 },
  timelineDot: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 3, zIndex: 1, marginLeft: 12, flexShrink: 0 },
  timelineContent: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14 },
  timelineHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 8 },
  indexBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  indexText: { fontSize: 13, fontWeight: "700" },
  timelineTitle: { fontSize: 15, fontWeight: "700", flex: 1, textAlign: "right" },
  timelineDesc: { fontSize: 13, lineHeight: 20, textAlign: "right" },

  outcomesList: { gap: 14 },
  outcomeCard: { borderRadius: 20, borderWidth: 1, padding: 20, overflow: "hidden", position: "relative" },
  outcomeGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 100 },
  outcomeTop: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  outcomeIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  outcomeStat: { alignItems: "flex-end" },
  outcomeStatNum: { fontSize: 32, fontWeight: "800", lineHeight: 38 },
  outcomeStatLabel: { fontSize: 11 },
  outcomeTitle: { fontSize: 17, fontWeight: "700", textAlign: "right", marginBottom: 6 },
  outcomeDesc: { fontSize: 13, lineHeight: 20, textAlign: "right" },
});
