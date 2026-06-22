import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { brandColors } from "@/constants/theme";
import type { ThemePreference } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

type ThemeToggleProps = {
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
};

const preferenceIcon: Record<
  ThemePreference,
  ComponentProps<typeof Ionicons>["name"]
> = {
  light: "sunny-outline",
  dark: "moon-outline",
  system: "phone-portrait-outline",
};

export default function ThemeToggle({ style, iconColor }: ThemeToggleProps) {
  const { preference, cycleThemePreference } = useTheme();

  return (
    <TouchableOpacity
      accessibilityLabel={`Theme mode: ${preference}. Tap to change theme mode.`}
      accessibilityRole="button"
      activeOpacity={0.85}
      onPress={cycleThemePreference}
      style={[styles.button, style]}
    >
      <Ionicons
        name={preferenceIcon[preference]}
        size={18}
        color={iconColor ?? brandColors.goldCta}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});
