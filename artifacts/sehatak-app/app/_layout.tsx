import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/tajawal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Animated, I18nManager, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SplashLoader } from "@/components/SplashLoader";
import { ThemeContext, ThemeProvider } from "@/hooks/useTheme";

I18nManager.forceRTL(true);

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function ThemeTransitionOverlay() {
  const { resolvedScheme } = useContext(ThemeContext);
  const overlayOp = useRef(new Animated.Value(0)).current;
  const prevScheme = useRef(resolvedScheme);

  useEffect(() => {
    if (prevScheme.current === resolvedScheme) return;
    prevScheme.current = resolvedScheme;
    Animated.sequence([
      Animated.timing(overlayOp, { toValue: 0.35, duration: 180, useNativeDriver: true }),
      Animated.timing(overlayOp, { toValue: 0,    duration: 320, useNativeDriver: true }),
    ]).start();
  }, [resolvedScheme]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: resolvedScheme === "dark" ? "#000" : "#fff",
          opacity: overlayOp,
          zIndex: 9999,
        },
      ]}
    />
  );
}

function RootLayoutNav() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <ThemeTransitionOverlay />
    </View>
  );
}

export default function RootLayout() {
  // Only load Tajawal fonts — vector-icons fonts are auto-linked in the APK
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
  });

  // Fallback: if fonts haven't loaded after 4s, show app anyway
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const ready = fontsLoaded || fontError || timedOut;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Show our custom heartbeat splash while loading
  if (!ready) return <SplashLoader />;

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
