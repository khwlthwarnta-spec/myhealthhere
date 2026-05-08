import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "system" | "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedScheme: "light" | "dark";
  toggleTheme: () => void;
}

const STORAGE_KEY = "@sehatak_theme_mode";

export const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  resolvedScheme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme() ?? "dark";
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setMode(stored);
      }
    });
  }, []);

  const resolvedScheme: "light" | "dark" =
    mode === "system" ? systemScheme : mode;

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === "dark" || (prev === "system" && systemScheme === "dark") ? "light" : "dark";
      AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, [systemScheme]);

  return React.createElement(
    ThemeContext.Provider,
    { value: { mode, resolvedScheme, toggleTheme } },
    children
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
