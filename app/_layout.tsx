
// File: app/_layout.tsx
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../store";
import { ToastProvider } from '../components/Toast';

export default function Layout() {
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
