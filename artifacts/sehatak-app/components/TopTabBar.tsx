import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { BluetoothModal } from "./BluetoothModal";

export const TOP_TAB_HEIGHT = 56;

const TAB_ICONS: Record<string, { icon: string; label: string }> = {
  index: { icon: "home", label: "الرئيسية" },
  determinants: { icon: "heart-pulse", label: "المحددات" },
  discover: { icon: "calculator-variant", label: "اكتشف" },
  curriculum: { icon: "book-open-variant", label: "خطة التعلم" },
};

export function TopTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [btVisible, setBtVisible] = useState(false);
  const [btConnected, setBtConnected] = useState(false);
  const isWeb = Platform.OS === "web";

  const topPad = isWeb ? 0 : insets.top;

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
          {/* Bluetooth button (right side in RTL) */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setBtVisible(true);
            }}
            style={[styles.btBtn, { backgroundColor: btConnected ? colors.primary + "20" : colors.muted }]}
          >
            <MaterialCommunityIcons
              name={btConnected ? "bluetooth-audio" : "bluetooth"}
              size={20}
              color={btConnected ? colors.primary : colors.mutedForeground}
            />
          </Pressable>

          {/* Tabs */}
          <View style={styles.tabs}>
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              const tabInfo = TAB_ICONS[route.name] ?? { icon: "circle", label: route.name };

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
                    size={22}
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
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  inner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    height: TOP_TAB_HEIGHT,
    paddingHorizontal: 12,
    gap: 6,
  },
  btBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
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
    left: "15%",
    right: "15%",
    height: 3,
    borderRadius: 3,
  },
});
