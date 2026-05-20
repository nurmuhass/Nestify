// File: app/_layout.tsx

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../store";
import { ToastProvider } from "../components/Toast";

import * as Notifications from "expo-notifications";
import { useEffect } from "react";

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
    // App opened from notification
    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          console.log(
            "Notification tapped:",
            response
          );
        }
      );

    // Notification received while app open
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
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ToastProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}