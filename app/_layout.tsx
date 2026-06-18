// File: app/_layout.tsx

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";

import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";

import { AuthProvider } from "../store";
import { ToastProvider } from "../components/Toast";

import { NetworkProvider } from "../NetworkContext";
import OfflineGate from "../components/OfflineGate";

// Keep native splash visible until we manually hide it
SplashScreen.preventAutoHideAsync();

// Smooth fade-out
SplashScreen.setOptions({
  duration: 600,
  fade: true,
});

// ─────────────────────────────────────────────
// NOTIFICATION CONFIG
// ─────────────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Layout() {
  useEffect(() => {
    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          console.log(
            "Notification tapped:",
            response
          );
        }
      );

    const notificationListener =
      Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log(
            "Notification received:",
            notification
          );
        }
      );

    return () => {
      responseListener.remove();
      notificationListener.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NetworkProvider>
          <ToastProvider>
            <OfflineGate>
              <Stack screenOptions={{ headerShown: false }} />
            </OfflineGate>
          </ToastProvider>
        </NetworkProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}