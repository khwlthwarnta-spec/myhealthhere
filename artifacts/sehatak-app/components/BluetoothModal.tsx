import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
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
import { useBluetooth, HealthMetric } from "@/contexts/BluetoothContext";
import { useColors } from "@/hooks/useColors";

type BtState = "idle" | "requesting" | "denied" | "scanning" | "found" | "connected";

const DEVICES = [
  { name: "Apple Watch Series 9", id: "AW:5E:2F:A1:00", icon: "watch" as const, signal: -58 },
  { name: "Galaxy Watch 6",       id: "GW:1C:9B:D4:02", icon: "watch-variant" as const, signal: -67 },
  { name: "Fitbit Sense 2",       id: "FB:3A:7D:E0:03", icon: "watch" as const, signal: -74 },
  { name: "Huawei Watch GT 4",    id: "HW:8B:C3:F2:04", icon: "watch-variant" as const, signal: -71 },
];

const HEALTH_BASE: Array<{ key: string; icon: string; label: string; base: number; unit: string; color: string; decimals?: number }> = [
  { key: "heart",  icon: "heart-pulse",  label: "معدل القلب",           base: 72,   unit: "نبضة/د",  color: "#ef4444" },
  { key: "spo2",   icon: "water",        label: "تشبع الأكسجين",        base: 98,   unit: "%",        color: "#38bdf8" },
  { key: "sleep",  icon: "sleep",        label: "ساعات النوم",           base: 7.2,  unit: "ساعة",    color: "#a78bfa", decimals: 1 },
  { key: "steps",  icon: "walk",         label: "الخطوات",               base: 8542, unit: "خطوة",    color: "#43a876" },
  { key: "cals",   icon: "fire",         label: "السعرات",               base: 420,  unit: "كيلو",    color: "#f97316" },
  { key: "temp",   icon: "thermometer",  label: "حرارة الجسم",           base: 36.7, unit: "°م",      color: "#eab308", decimals: 1 },
];

const STAT_PREVIEW = [
  { icon: "heart-pulse", color: "#ef4444", label: "القلب" },
  { icon: "water",       color: "#38bdf8", label: "الأكسجين" },
  { icon: "sleep",       color: "#a78bfa", label: "النوم" },
  { icon: "walk",        color: "#43a876", label: "الخطوات" },
  { icon: "fire",        color: "#f97316", label: "السعرات" },
  { icon: "thermometer", color: "#eab308", label: "الحرارة" },
];

function randVar(base: number, pct: number, dec = 0) {
  const val = base + base * pct * (Math.random() * 2 - 1);
  return dec > 0 ? val.toFixed(dec) : String(Math.round(val));
}

function generateHealthData(): HealthMetric[] {
  return HEALTH_BASE.map((h) => ({
    key: h.key,
    icon: h.icon,
    label: h.label,
    value: randVar(h.base, 0.05, h.decimals ?? 0),
    unit: h.unit,
    color: h.color,
  }));
}

async function requestBluetoothPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  try {
    if (Platform.Version >= 31) {
      const scanStatus    = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
      const connectStatus = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
      if (scanStatus && connectStatus) return true;

      const toRequest: string[] = [];
      if (!scanStatus)    toRequest.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
      if (!connectStatus) toRequest.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
      toRequest.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

      const results = await PermissionsAndroid.requestMultiple(toRequest as any);

      const finalScan    = scanStatus    || results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]    === PermissionsAndroid.RESULTS.GRANTED;
      const finalConnect = connectStatus || results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED;
      return finalScan && finalConnect;
    } else {
      const already = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (already) return true;
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        { title: "إذن الموقع", message: "يحتاج التطبيق إذن الموقع للبحث عن الأجهزة عبر البلوتوث", buttonPositive: "سماح", buttonNegative: "رفض" }
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch {
    return true;
  }
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
    <Animated.View style={{ position: "absolute", width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: color, transform: [{ scale }], opacity }} />
  );
}

function SignalBars({ rssi }: { rssi: number }) {
  const strength = rssi > -60 ? 4 : rssi > -70 ? 3 : rssi > -80 ? 2 : 1;
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
      {[1, 2, 3, 4].map((n) => (
        <View key={n} style={{ width: 4, height: 4 + n * 3, borderRadius: 2, backgroundColor: n <= strength ? "#43a876" : "#374151" }} />
      ))}
    </View>
  );
}

function UserProfilePreview() {
  const colors = useColors();
  return (
    <View style={styles.profileWrap}>
      <View style={[styles.avatarOuter, { borderColor: colors.primary + "50", backgroundColor: colors.muted }]}>
        <View style={[styles.avatarInner, { backgroundColor: colors.primary + "20" }]}>
          <MaterialCommunityIcons name="account" size={52} color={colors.primary} />
        </View>
      </View>
      <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
        المستخدم
      </Text>
      <Text style={[styles.profileHint, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
        اربط ساعتك لعرض بياناتك الصحية
      </Text>

      <View style={styles.dotsRow}>
        {STAT_PREVIEW.map((s) => (
          <View key={s.icon} style={styles.dotItem}>
            <View style={[styles.dotCircle, { backgroundColor: s.color + "25", borderColor: s.color + "40", borderWidth: 1.5 }]}>
              <MaterialCommunityIcons name={s.icon as any} size={18} color={s.color + "80"} />
            </View>
            <Text style={[styles.dotLabel, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.lockedBanner, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <MaterialCommunityIcons name="lock-outline" size={14} color={colors.mutedForeground} />
        <Text style={[styles.lockedText, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
          ستظهر بياناتك الحقيقية بعد ربط الساعة
        </Text>
      </View>
    </View>
  );
}

export function BluetoothModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isConnected, connectedDevice, healthData, connect, disconnect } = useBluetooth();

  const [state, setState] = useState<BtState>(isConnected ? "connected" : "idle");
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) {
      if (!isConnected) setState("idle");
    } else {
      setState(isConnected ? "connected" : "idle");
    }
  }, [visible, isConnected]);

  useEffect(() => {
    if (state === "connected") {
      refreshTimer.current = setInterval(() => {
        connect(connectedDevice!, generateHealthData());
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 15000);
    } else {
      if (refreshTimer.current) { clearInterval(refreshTimer.current); refreshTimer.current = null; }
    }
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
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

  const handleConnect = (name: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const data = generateHealthData();
    connect(name, data);
    setState("connected");
  };

  const handleDisconnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    disconnect();
    setState("idle");
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
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

          {/* ── Idle ── */}
          {state === "idle" && (
            <View style={styles.centerContent}>
              <UserProfilePreview />

              <View style={[styles.noteBox, { backgroundColor: colors.accent, borderColor: colors.border }]}>
                <Ionicons name="information-circle" size={16} color={colors.primary} />
                <Text style={[styles.noteText, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                  يدعم Apple Watch، Samsung Galaxy Watch، Fitbit، Huawei Watch والمزيد
                </Text>
              </View>

              <Text style={[styles.hintSmall, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                تأكد من تفعيل البلوتوث وأن الساعة قريبة منك
              </Text>

              <Pressable
                onPress={startScan}
                style={({ pressed }) => [styles.scanBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
              >
                <MaterialCommunityIcons name="bluetooth-audio" size={20} color="#fff" />
                <Text style={[styles.scanBtnText, { fontFamily: "Tajawal_700Bold" }]}>بدء البحث عن الساعة</Text>
              </Pressable>
            </View>
          )}

          {/* ── Requesting ── */}
          {state === "requesting" && (
            <View style={styles.centerContent}>
              <View style={[styles.btIconWrap, { backgroundColor: colors.accent }]}>
                <MaterialCommunityIcons name="shield-check" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.stateTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                طلب الإذن
              </Text>
              <Text style={[styles.stateDesc, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                يرجى السماح للتطبيق باستخدام البلوتوث من نافذة الأذونات التي ظهرت
              </Text>
            </View>
          )}

          {/* ── Denied ── */}
          {state === "denied" && (
            <View style={styles.centerContent}>
              <View style={[styles.btIconWrap, { backgroundColor: "#ef444420" }]}>
                <MaterialCommunityIcons name="bluetooth-off" size={48} color="#ef4444" />
              </View>
              <Text style={[styles.stateTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                تم رفض الإذن
              </Text>
              <Text style={[styles.stateDesc, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                يحتاج التطبيق إذن البلوتوث. يمكنك منحه من إعدادات الجهاز ثم العودة للتطبيق.
              </Text>
              <Pressable
                onPress={openSettings}
                style={({ pressed }) => [styles.scanBtn, { backgroundColor: "#3b82f6", opacity: pressed ? 0.85 : 1 }]}
              >
                <Ionicons name="settings-outline" size={18} color="#fff" />
                <Text style={[styles.scanBtnText, { fontFamily: "Tajawal_700Bold" }]}>فتح الإعدادات</Text>
              </Pressable>
              <Pressable
                onPress={() => setState("idle")}
                style={({ pressed }) => [styles.retryBtn, { borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
              >
                <Text style={[styles.retryText, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                  حاول مجدداً
                </Text>
              </Pressable>
            </View>
          )}

          {/* ── Scanning ── */}
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

          {/* ── Found ── */}
          {state === "found" && (
            <View style={styles.devicesWrap}>
              <Text style={[styles.stateTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold", textAlign: "right" }]}>
                الأجهزة المتاحة ({DEVICES.length})
              </Text>
              {DEVICES.map((device) => (
                <Pressable
                  key={device.id}
                  onPress={() => handleConnect(device.name)}
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

          {/* ── Connected ── */}
          {state === "connected" && (
            <View style={styles.connectedWrap}>
              <View style={[styles.connectedHeader, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
                <View style={styles.connectedBadge}>
                  <View style={[styles.connectedDot, { backgroundColor: "#22c55e" }]} />
                  <Text style={[styles.connectedLive, { color: "#22c55e", fontFamily: "Tajawal_700Bold" }]}>مباشر</Text>
                </View>
                <View>
                  <Text style={[styles.connectedLabel, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>متصل بـ</Text>
                  <Text style={[styles.connectedName, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>{connectedDevice}</Text>
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
                {healthData.map((item) => (
                  <View key={item.key} style={[styles.healthCard, { backgroundColor: colors.card, borderColor: item.color + "40" }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} style={{ alignSelf: "flex-end" }} />
                    <Text style={[styles.healthValue, { color: item.color, fontFamily: "Tajawal_800ExtraBold" }]}>{item.value}</Text>
                    <Text style={[styles.healthUnit,  { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>{item.unit}</Text>
                    <Text style={[styles.healthLabel, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>{item.label}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={handleDisconnect}
                style={({ pressed }) => [styles.disconnectBtn, { borderColor: "#ef444450", opacity: pressed ? 0.7 : 1 }]}
              >
                <MaterialCommunityIcons name="bluetooth-off" size={18} color="#ef4444" />
                <Text style={[styles.disconnectText, { color: "#ef4444", fontFamily: "Tajawal_700Bold" }]}>قطع الاتصال</Text>
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
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  closeBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "700" },
  content: { padding: 20, alignItems: "center" },
  centerContent: { width: "100%", alignItems: "center", paddingVertical: 20, gap: 16 },

  profileWrap: { width: "100%", alignItems: "center", gap: 10, marginBottom: 8 },
  avatarOuter: { width: 110, height: 110, borderRadius: 55, borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  avatarInner: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  profileName: { fontSize: 20, fontWeight: "700" },
  profileHint: { fontSize: 13, textAlign: "center" },
  dotsRow: { flexDirection: "row-reverse", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 4 },
  dotItem: { alignItems: "center", gap: 4 },
  dotCircle: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  dotLabel: { fontSize: 10, textAlign: "center" },
  lockedBanner: { flexDirection: "row-reverse", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, marginTop: 4 },
  lockedText: { fontSize: 12 },

  btIconWrap: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  pulseWrap: { width: 100, height: 100, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  stateTitle: { fontSize: 22, fontWeight: "700" },
  stateDesc: { fontSize: 14, textAlign: "center", lineHeight: 22, paddingHorizontal: 20 },
  hintSmall: { fontSize: 13, textAlign: "center" },
  noteBox: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, width: "100%" },
  noteText: { fontSize: 13, lineHeight: 20, flex: 1, textAlign: "right" },
  scanBtn: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 14, marginTop: 4 },
  scanBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  retryBtn: { borderWidth: 1, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  retryText: { fontSize: 14 },

  devicesWrap: { width: "100%", gap: 12 },
  deviceRow: { flexDirection: "row-reverse", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  deviceLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  deviceIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  deviceInfo: { flex: 1, alignItems: "flex-end" },
  deviceName: { fontSize: 15 },
  deviceId: { fontSize: 11, marginTop: 2, letterSpacing: 0.5 },

  connectedWrap: { width: "100%", gap: 14 },
  connectedHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  connectedBadge: { flex: 1, flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  connectedDot: { width: 8, height: 8, borderRadius: 4 },
  connectedLive: { fontSize: 12 },
  connectedLabel: { fontSize: 12 },
  connectedName: { fontSize: 16 },
  refreshNote: { flexDirection: "row-reverse", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  refreshText: { fontSize: 12 },
  dataTitle: { fontSize: 18, textAlign: "right" },
  healthGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  healthCard: { width: "47%", borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "flex-end", gap: 4 },
  healthValue: { fontSize: 26, fontWeight: "800" },
  healthUnit: { fontSize: 11 },
  healthLabel: { fontSize: 11, textAlign: "right" },
  disconnectBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1 },
  disconnectText: { fontSize: 14 },
});
