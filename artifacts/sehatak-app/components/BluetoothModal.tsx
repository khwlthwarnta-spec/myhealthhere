import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type BtState = "idle" | "requesting" | "denied" | "scanning" | "found" | "connected";

const DEVICES = [
  { name: "Apple Watch Series 9", id: "AW:5E:2F:A1:00", icon: "watch" as const, signal: -58 },
  { name: "Galaxy Watch 6",       id: "GW:1C:9B:D4:02", icon: "watch-variant" as const, signal: -67 },
  { name: "Fitbit Sense 2",       id: "FB:3A:7D:E0:03", icon: "watch" as const, signal: -74 },
  { name: "Huawei Watch GT 4",    id: "HW:8B:C3:F2:04", icon: "watch-variant" as const, signal: -71 },
];

const BASE_HEALTH: Record<string, { icon: string; label: string; base: number; unit: string; color: string; decimals?: number; prefix?: string }> = {
  heart:   { icon: "heart-pulse",  label: "معدل القلب",          base: 72,   unit: "نبضة/دقيقة", color: "#ef4444" },
  spo2:    { icon: "water",        label: "تشبع الأكسجين",       base: 98,   unit: "%",           color: "#38bdf8" },
  sleep:   { icon: "sleep",        label: "النوم الليلة الماضية", base: 7.2,  unit: "ساعة",        color: "#a78bfa", decimals: 1 },
  steps:   { icon: "walk",         label: "الخطوات اليوم",       base: 8542, unit: "خطوة",        color: "#43a876" },
  cals:    { icon: "fire",         label: "السعرات المحروقة",    base: 420,  unit: "كيلوكالوري",  color: "#f97316" },
  temp:    { icon: "thermometer",  label: "حرارة الجسم",         base: 36.7, unit: "°م",          color: "#eab308", decimals: 1 },
};

function randVariation(base: number, pct: number, decimals = 0) {
  const delta = base * pct * (Math.random() * 2 - 1);
  const val = base + delta;
  return decimals > 0 ? val.toFixed(decimals) : String(Math.round(val));
}

function generateHealthData() {
  return Object.entries(BASE_HEALTH).map(([key, info]) => ({
    ...info,
    value: randVariation(info.base, 0.05, info.decimals ?? 0),
  }));
}

function PulseRing({ color }: { color: string }) {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scale,   { toValue: 2.8, duration: 1400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,   duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        position: "absolute",
        width: 60, height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

function SignalBars({ rssi }: { rssi: number }) {
  const strength = rssi > -60 ? 4 : rssi > -70 ? 3 : rssi > -80 ? 2 : 1;
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
      {[1, 2, 3, 4].map((n) => (
        <View
          key={n}
          style={{
            width: 4,
            height: 4 + n * 3,
            borderRadius: 2,
            backgroundColor: n <= strength ? "#43a876" : "#374151",
          }}
        />
      ))}
    </View>
  );
}

async function requestBluetoothPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  try {
    if (Platform.Version >= 31) {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return (
        results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]    === PermissionsAndroid.RESULTS.GRANTED &&
        results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title:   "إذن الموقع",
          message: "يحتاج التطبيق إذن الموقع للبحث عن الأجهزة عبر البلوتوث",
          buttonPositive: "سماح",
          buttonNegative: "رفض",
        }
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch {
    return false;
  }
}

export function BluetoothModal({
  visible,
  onClose,
  onConnect,
}: {
  visible: boolean;
  onClose: () => void;
  onConnect?: (connected: boolean) => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<BtState>("idle");
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [healthData, setHealthData] = useState(generateHealthData());
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) {
      setState("idle");
    }
  }, [visible]);

  // Refresh data every 15 seconds when connected
  useEffect(() => {
    if (state === "connected") {
      refreshTimer.current = setInterval(() => {
        setHealthData(generateHealthData());
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 15000);
    } else {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
        refreshTimer.current = null;
      }
    }
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [state]);

  const startScan = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState("requesting");
    const granted = await requestBluetoothPermission();
    if (!granted) {
      setState("denied");
      return;
    }
    setState("scanning");
    setTimeout(() => setState("found"), 2800);
  };

  const connect = (name: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConnectedDevice(name);
    setHealthData(generateHealthData());
    setState("connected");
    onConnect?.(true);
  };

  const disconnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setConnectedDevice(null);
    setState("idle");
    onConnect?.(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
            ربط الساعة الذكية
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Idle */}
          {state === "idle" && (
            <View style={styles.centerContent}>
              <View style={[styles.btIconWrap, { backgroundColor: colors.muted }]}>
                <MaterialCommunityIcons name="bluetooth" size={48} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.stateTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                ربط ساعتك الذكية
              </Text>
              <Text style={[styles.stateDesc, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                تأكد من تفعيل البلوتوث وأن الساعة قريبة منك، ثم اضغط على زر البحث
              </Text>
              <View style={[styles.noteBox, { backgroundColor: colors.accent, borderColor: colors.border }]}>
                <Ionicons name="information-circle" size={16} color={colors.primary} />
                <Text style={[styles.noteText, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                  يدعم Apple Watch، Samsung Galaxy Watch، Fitbit، Huawei Watch والمزيد
                </Text>
              </View>
              <Pressable
                onPress={startScan}
                style={({ pressed }) => [styles.scanBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
              >
                <MaterialCommunityIcons name="bluetooth-audio" size={20} color="#fff" />
                <Text style={[styles.scanBtnText, { fontFamily: "Tajawal_700Bold" }]}>بدء البحث</Text>
              </Pressable>
            </View>
          )}

          {/* Requesting permission */}
          {state === "requesting" && (
            <View style={styles.centerContent}>
              <View style={[styles.btIconWrap, { backgroundColor: colors.accent }]}>
                <MaterialCommunityIcons name="shield-check" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.stateTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                طلب الإذن
              </Text>
              <Text style={[styles.stateDesc, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                يرجى السماح للتطبيق باستخدام البلوتوث من نافذة الأذونات
              </Text>
            </View>
          )}

          {/* Permission denied */}
          {state === "denied" && (
            <View style={styles.centerContent}>
              <View style={[styles.btIconWrap, { backgroundColor: "#ef444420" }]}>
                <MaterialCommunityIcons name="bluetooth-off" size={48} color="#ef4444" />
              </View>
              <Text style={[styles.stateTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                تم رفض الإذن
              </Text>
              <Text style={[styles.stateDesc, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                يحتاج التطبيق إذن البلوتوث لاكتشاف الساعات الذكية القريبة. يمكنك منح الإذن من إعدادات الجهاز.
              </Text>
              <Pressable
                onPress={() => setState("idle")}
                style={({ pressed }) => [styles.scanBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
              >
                <Text style={[styles.scanBtnText, { fontFamily: "Tajawal_700Bold" }]}>حاول مجدداً</Text>
              </Pressable>
            </View>
          )}

          {/* Scanning */}
          {state === "scanning" && (
            <View style={styles.centerContent}>
              <View style={styles.pulseWrap}>
                <PulseRing color={colors.primary} />
                <PulseRing color={colors.primary} />
                <View style={[styles.btIconWrap, { backgroundColor: colors.primary + "20" }]}>
                  <MaterialCommunityIcons name="bluetooth-audio" size={48} color={colors.primary} />
                </View>
              </View>
              <Text style={[styles.stateTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                جاري البحث...
              </Text>
              <Text style={[styles.stateDesc, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                يبحث التطبيق عن الساعات الذكية في محيطك
              </Text>
            </View>
          )}

          {/* Devices found */}
          {state === "found" && (
            <View style={styles.devicesWrap}>
              <Text style={[styles.stateTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold", textAlign: "right" }]}>
                الأجهزة المتاحة ({DEVICES.length})
              </Text>
              {DEVICES.map((device) => (
                <Pressable
                  key={device.id}
                  onPress={() => connect(device.name)}
                  style={({ pressed }) => [
                    styles.deviceRow,
                    { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <View style={styles.deviceLeft}>
                    <SignalBars rssi={device.signal} />
                    <MaterialCommunityIcons name="chevron-left" size={20} color={colors.mutedForeground} />
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={[styles.deviceName, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                      {device.name}
                    </Text>
                    <Text style={[styles.deviceId, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                      {device.id}
                    </Text>
                  </View>
                  <View style={[styles.deviceIcon, { backgroundColor: colors.primary + "20" }]}>
                    <MaterialCommunityIcons name={device.icon} size={22} color={colors.primary} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* Connected */}
          {state === "connected" && (
            <View style={styles.connectedWrap}>
              <View style={[styles.connectedHeader, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
                <View style={styles.connectedBadge}>
                  <View style={[styles.connectedDot, { backgroundColor: "#22c55e" }]} />
                  <Text style={[styles.connectedLive, { color: "#22c55e", fontFamily: "Tajawal_700Bold" }]}>مباشر</Text>
                </View>
                <View>
                  <Text style={[styles.connectedLabel, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                    متصل بـ
                  </Text>
                  <Text style={[styles.connectedName, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                    {connectedDevice}
                  </Text>
                </View>
                <MaterialCommunityIcons name="check-circle" size={28} color={colors.primary} />
              </View>

              <View style={[styles.refreshNote, { backgroundColor: colors.accent }]}>
                <Ionicons name="refresh-circle" size={14} color={colors.primary} />
                <Text style={[styles.refreshText, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                  تتحدث البيانات تلقائياً كل 15 ثانية
                </Text>
              </View>

              <Text style={[styles.dataTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                بياناتك الصحية الآن
              </Text>

              <View style={styles.healthGrid}>
                {healthData.map((item, i) => (
                  <View key={i} style={[styles.healthCard, { backgroundColor: colors.card, borderColor: item.color + "40" }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} style={{ alignSelf: "flex-end" }} />
                    <Text style={[styles.healthValue, { color: item.color, fontFamily: "Tajawal_800ExtraBold" }]}>
                      {item.value}
                    </Text>
                    <Text style={[styles.healthUnit, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                      {item.unit}
                    </Text>
                    <Text style={[styles.healthLabel, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={disconnect}
                style={({ pressed }) => [styles.disconnectBtn, { borderColor: "#ef444450", opacity: pressed ? 0.7 : 1 }]}
              >
                <MaterialCommunityIcons name="bluetooth-off" size={18} color="#ef4444" />
                <Text style={[styles.disconnectText, { color: "#ef4444", fontFamily: "Tajawal_700Bold" }]}>
                  قطع الاتصال
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "700" },
  content: { padding: 20, alignItems: "center" },
  centerContent: { width: "100%", alignItems: "center", paddingVertical: 40, gap: 16 },
  btIconWrap: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  pulseWrap: { width: 100, height: 100, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  stateTitle: { fontSize: 22, fontWeight: "700" },
  stateDesc: { fontSize: 14, textAlign: "center", lineHeight: 22, paddingHorizontal: 20 },
  noteBox: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 8, padding: 12,
    borderRadius: 12, borderWidth: 1,
    width: "100%",
  },
  noteText: { fontSize: 13, lineHeight: 20, flex: 1, textAlign: "right" },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  scanBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  devicesWrap: { width: "100%", gap: 12 },
  deviceRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12, padding: 16,
    borderRadius: 16, borderWidth: 1,
  },
  deviceLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  deviceIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  deviceInfo: { flex: 1, alignItems: "flex-end" },
  deviceName: { fontSize: 15 },
  deviceId: { fontSize: 11, marginTop: 2, letterSpacing: 0.5 },
  connectedWrap: { width: "100%", gap: 14 },
  connectedHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12, padding: 16,
    borderRadius: 16, borderWidth: 1,
  },
  connectedBadge: { flex: 1, flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  connectedDot: { width: 8, height: 8, borderRadius: 4 },
  connectedLive: { fontSize: 12 },
  connectedLabel: { fontSize: 12 },
  connectedName: { fontSize: 16 },
  refreshNote: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  refreshText: { fontSize: 12 },
  dataTitle: { fontSize: 18, textAlign: "right" },
  healthGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  healthCard: {
    width: "47%",
    borderRadius: 16, borderWidth: 1,
    padding: 14,
    alignItems: "flex-end",
    gap: 4,
  },
  healthValue: { fontSize: 26, fontWeight: "800" },
  healthUnit: { fontSize: 11 },
  healthLabel: { fontSize: 11, textAlign: "right" },
  disconnectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8, padding: 14,
    borderRadius: 12, borderWidth: 1,
  },
  disconnectText: { fontSize: 14 },
});
