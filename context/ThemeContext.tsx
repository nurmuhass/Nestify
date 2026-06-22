import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PropsWithChildren } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

import {
  brandColors,
  themeTokens,
} from "@/constants/theme";
import type {
  ThemeName,
  ThemePreference,
  ThemeTokens,
} from "@/constants/theme";

const THEME_STORAGE_KEY = "nestify-theme-preference";

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ThemeName;
  theme: ThemeTokens;
  colors: ThemeTokens;
  brandColors: typeof brandColors;
  isDark: boolean;
  isLoading: boolean;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  cycleThemePreference: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const themePreferenceOrder: ThemePreference[] = ["light", "dark", "system"];

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useSystemColorScheme();
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (mounted && isThemePreference(storedPreference)) {
          setPreference(storedPreference);
        }
      } catch (error) {
        console.log("THEME LOAD ERROR:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadThemePreference();

    return () => {
      mounted = false;
    };
  }, []);

  const setThemePreference = useCallback(
    async (nextPreference: ThemePreference) => {
      setPreference(nextPreference);

      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, nextPreference);
      } catch (error) {
        console.log("THEME SAVE ERROR:", error);
      }
    },
    [],
  );

  const cycleThemePreference = useCallback(async () => {
    const currentIndex = themePreferenceOrder.indexOf(preference);
    const nextPreference =
      themePreferenceOrder[(currentIndex + 1) % themePreferenceOrder.length];

    await setThemePreference(nextPreference);
  }, [preference, setThemePreference]);

  const resolvedTheme: ThemeName =
    preference === "system" ? systemColorScheme ?? "light" : preference;

  const value = useMemo(
    () => ({
      preference,
      resolvedTheme,
      theme: themeTokens[resolvedTheme],
      colors: themeTokens[resolvedTheme],
      brandColors,
      isDark: resolvedTheme === "dark",
      isLoading,
      setThemePreference,
      cycleThemePreference,
    }),
    [
      preference,
      resolvedTheme,
      isLoading,
      setThemePreference,
      cycleThemePreference,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}

export { THEME_STORAGE_KEY };
