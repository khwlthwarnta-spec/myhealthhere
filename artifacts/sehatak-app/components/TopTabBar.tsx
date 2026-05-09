import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/hooks/useTheme";
import { BluetoothModal } from "./BluetoothModal";

export const TOP_TAB_HEIGHT = 56;

const TAB_ICONS: Record<string, { icon: string; label: string }> = {
  index:        { icon: "home",               label: "الرئيسية" },
  determinants: { icon: "heart-pulse",        label: "المحددات" },
  discover:     { icon: "calculator-variant", label: "اكتشف"    },
  curriculum:   { icon: "book-open-variant",  label: "التعلم"   },
};

export function TopTabBar({ state, descriptors, navigation }: any) {
  const colors = useColors();
  const { resolvedScheme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [btVisible, setBtVisible]     = useState(false);
  const [btConnected, setBtConnected] = useState(false);
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 0 : insets.top;

  const isDark = resolvedScheme === "dark";

  // Theme button: vivid contrasting colors regardless of mode
  const themeIcon  = isDark ? "weather-sunny"  : "weather-night";
  const themeColor = isDark ? "#f59e0b"         : "#6366f1";   // amber / indigo
  const themeBg    = isDark ? "#2d1f04"         : "#eef2ff";   // warm dark / indigo tint

  // Bluetooth button
  const btColor  = btConnected ? colors.primary : "#3b82f6";  // green / blue
  const btBg     = btConnected ? colors.primary + "22"       : isDark ? "#0c1a2e" : "#eff6ff";

  return (
    <>
      <View
        style={[
          styles.container,
          {
            paddingTop: topPad,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.inner}>
          {/* Right side: Theme toggle + Bluetooth */}
          <View style={styles.rightBtns}>

            {/* Theme toggle */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleTheme();
              }}
              style={[styles.iconBtn, { backgroundColor: themeBg, borderColor: themeColor + "55" }]}
            >
              <MaterialCommunityIcons name={themeIcon} size={20} color={themeColor} />
            </Pressable>

            {/* Bluetooth */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setBtVisible(true);
              }}
              style={[styles.iconBtn, { backgroundColor: btBg, borderColor: btColor + "55" }]}
            >
              <MaterialCommunityIcons
                name={btConnected ? "bluetooth-audio" : "bluetooth"}
                size={20}
                color={btColor}
              />
              {btConnected && (
                <View style={[styles.connectedDot, { backgroundColor: "#22c55e" }]} />
              )}
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {state.routes.map((route: any, index: number) => {
              const isFocused = state.index === index;
              const tabInfo   = TAB_ICONS[route.name] ?? { icon: "circle", label: route.name };

              const onPress = () => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!isFocused && !event.defaultPrevented) {
                  Haptics.selectionAsync();
                  navigation.navigate(route.name, route.params);
                }
              };

              return (
                <Pressable key={route.key} onPress={onPress} style={styles.tab}>
                  <MaterialCommunityIcons
                    name={tabInfo.icon as any}
                    size={21}
                    color={isFocused ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isFocused ? colors.primary : colors.mutedForeground,
                        fontFamily: "Tajawal_700Bold",
                      },
                    ]}
                  >
                    {tabInfo.label}
                  </Text>
                  {isFocused && (
                    <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <BluetoothModal
        visible={btVisible}
        onClose={() => setBtVisible(false)}
        onConnect={(c) => setBtConnected(c)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  inner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    height: TOP_TAB_HEIGHT,
    paddingHorizontal: 10,
    gap: 4,
  },
  rightBtns: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  iconBtn: {
    width: 38, height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  connectedDot: {
    position: "absolute",
    top: 4, right: 4,
    width: 8, height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  tabs: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: TOP_TAB_HEIGHT,
    position: "relative",
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: "15%", right: "15%",
    height: 3,
    borderRadius: 3,
  },
});
