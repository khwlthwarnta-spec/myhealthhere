import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type BtState = "idle" | "scanning" | "found" | "connected";

const DEVICES = [
  { name: "Apple Watch Series 9", id: "AW-001", icon: "watch" as const },
  { name: "Galaxy Watch 6", id: "GW-002", icon: "watch-variant" as const },
  { name: "Fitbit Sense 2", id: "FB-003", icon: "watch" as const },
];

const HEALTH_DATA = [
  { icon: "heart-pulse", label: "معدل القلب", value: "72", unit: "نبضة/دقيقة", color: "#ef4444" },
  { icon: "water", label: "تشبع الأكسجين", value: "98", unit: "%", color: "#38bdf8" },
  { icon: "sleep", label: "النوم الليلة الماضية", value: "7.2", unit: "ساعة", color: "#a78bfa" },
  { icon: "walk", label: "الخطوات اليوم", value: "8,542", unit: "خطوة", color: "#43a876" },
  { icon: "fire", label: "السعرات المحروقة", value: "420", unit: "كيلوكالوري", color: "#f97316" },
  { icon: "thermometer", label: "درجة حرارة الجسم", value: "36.7", unit: "°م", color: "#eab308" },
];

function PulseRing({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: 2.5, duration: 1500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        position: "absolute",
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
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

  useEffect(() => {
    if (!visible) {
      setState("idle");
    }
  }, [visible]);

  const startScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState("scanning");
    setTimeout(() => setState("found"), 2500);
  };

  const connect = (name: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConnectedDevice(name);
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

          {/* Idle state */}
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
                  يدعم Apple Watch، Samsung Galaxy Watch، Fitbit والمزيد
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

          {/* Scanning state */}
          {state === "scanning" && (
            <View style={styles.centerContent}>
              <View style={styles.pulseWrap}>
                <PulseRing color={colors.primary} />
                <View style={[styles.btIconWrap, { backgroundColor: colors.primary + "20" }]}>
                  <MaterialCommunityIcons name="bluetooth-audio" size={48} color={colors.primary} />
                </View>
              </View>
              <Text style={[styles.stateTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                جاري البحث...
              </Text>
              <Text style={[styles.stateDesc, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                يتم البحث عن الأجهزة المتاحة في محيطك
              </Text>
            </View>
          )}

          {/* Devices found */}
          {state === "found" && (
            <View style={styles.devicesWrap}>
              <Text style={[styles.stateTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold", textAlign: "right" }]}>
                الأجهزة المتاحة
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
                  <MaterialCommunityIcons name="chevron-left" size={20} color={colors.mutedForeground} />
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

          {/* Connected state */}
          {state === "connected" && (
            <View style={styles.connectedWrap}>
              <View style={[styles.connectedHeader, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
                <MaterialCommunityIcons name="check-circle" size={28} color={colors.primary} />
                <View>
                  <Text style={[styles.connectedLabel, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
                    متصل بـ
                  </Text>
                  <Text style={[styles.connectedName, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                    {connectedDevice}
                  </Text>
                </View>
              </View>

              <Text style={[styles.dataTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
                بيانات صحتك الآن
              </Text>

              <View style={styles.healthGrid}>
                {HEALTH_DATA.map((item, i) => (
                  <View key={i} style={[styles.healthCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
                style={({ pressed }) => [styles.disconnectBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              >
                <MaterialCommunityIcons name="bluetooth-off" size={18} color={colors.mutedForeground} />
                <Text style={[styles.disconnectText, { color: colors.mutedForeground, fontFamily: "Tajawal_700Bold" }]}>
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
  pulseWrap: { width: 100, height: 100, alignItems: "center", justifyContent: "center" },
  stateTitle: { fontSize: 22, fontWeight: "700" },
  stateDesc: { fontSize: 14, textAlign: "center", lineHeight: 22, paddingHorizontal: 20 },
  noteBox: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: "100%",
  },
  noteText: { fontSize: 13, lineHeight: 20, flex: 1, textAlign: "right" },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  scanBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  devicesWrap: { width: "100%", gap: 12 },
  deviceRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  deviceIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  deviceInfo: { flex: 1, alignItems: "flex-end" },
  deviceName: { fontSize: 15 },
  deviceId: { fontSize: 12, marginTop: 2 },
  connectedWrap: { width: "100%", gap: 16 },
  connectedHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  connectedLabel: { fontSize: 12 },
  connectedName: { fontSize: 16 },
  dataTitle: { fontSize: 18, textAlign: "right" },
  healthGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  healthCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
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
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  disconnectText: { fontSize: 14 },
});
