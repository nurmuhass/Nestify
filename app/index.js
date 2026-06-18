// app/index.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";

import * as SplashScreen from "expo-splash-screen";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const bootstrapApp = async () => {
      let nextRoute: "/(tabs)/Home" | "/(auth)/Welcome" =
        "/(auth)/Welcome";

      try {
        const token = await AsyncStorage.getItem("authToken");
        const userJson = await AsyncStorage.getItem("authUser");

        if (token && userJson) {
          nextRoute = "/(tabs)/Home";
        } else {
          nextRoute = "/(auth)/Welcome";
        }
      } catch (error) {
        console.log("BOOTSTRAP ERROR:", error);
        nextRoute = "/(auth)/Welcome";
      } finally {
        if (!mounted) return;

        router.replace(nextRoute);

        /**
         * Give Expo Router a short moment to mount the next screen,
         * then fade out the native splash.
         */
        setTimeout(async () => {
          try {
            await SplashScreen.hideAsync();
          } catch (error) {
            console.log("SPLASH HIDE ERROR:", error);
          }
        }, 250);
      }
    };

    bootstrapApp();

    return () => {
      mounted = false;
    };
  }, [router]);

  /**
   * Return null because the native splash screen is still visible.
   * No custom React splash needed.
   */
  return null;
}