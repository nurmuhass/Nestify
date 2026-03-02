import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="Details" options={{ title: "Details" }} />
      <Stack.Screen name="Reviews" options={{ title: "Reviews" }} />
      <Stack.Screen name="Notifications" options={{ title: "Notifications" }} />
      <Stack.Screen
        name="EstateCompanyDetails"
        options={{ title: "EstateCompanyDetails" }}
      />
      <Stack.Screen name="CompanyScreen" options={{ title: "CompanyScreen" }} />
    </Stack>
  );
}
