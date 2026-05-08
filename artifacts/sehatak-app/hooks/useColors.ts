import colors from "@/constants/colors";
import { useTheme } from "@/hooks/useTheme";

type Palette = typeof colors.light;

export function useColors(): Palette & { radius: number } {
  const { resolvedScheme } = useTheme();
  const palette: Palette = resolvedScheme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
