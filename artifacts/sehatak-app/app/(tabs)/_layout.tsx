import { Tabs } from "expo-router";
import React from "react";
import { TopTabBar } from "@/components/TopTabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TopTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="determinants" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="curriculum" />
    </Tabs>
  );
}
