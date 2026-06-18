// app/(tabs)/Profile/_layout.tsx
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="EditProfile" />
      <Stack.Screen name="Messages" />
      <Stack.Screen name="UserReviews" />
      <Stack.Screen name="Wishlist" />
      <Stack.Screen name="EditProperty" />
      <Stack.Screen name="Reviews" />
      <Stack.Screen name="EditStaff" />
      
      
    </Stack>
  );
}