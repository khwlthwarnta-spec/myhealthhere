import { useContext } from "react";
import { ThemeContext } from "./useTheme";
import colors from "@/constants/colors";

export function useColors() {
  const { resolvedScheme } = useContext(ThemeContext);
  const palette =
    resolvedScheme === "dark" && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;
  return { ...palette, radius: colors.radius };
}
