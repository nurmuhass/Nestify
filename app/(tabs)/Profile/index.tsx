// app/(tabs)/Profile/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import BuyerProfile from "./BuyerProfile";
import SellerProfile from "./SellerProfile";
import { useFocusEffect, useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const refreshUser = async () => {
        try {
          const token = await AsyncStorage.getItem("authToken");
          const userJson = await AsyncStorage.getItem("authUser");
          if (!token || !userJson) { setLoading(false); return; }

          const cached = JSON.parse(userJson);

          // Re-fetch fresh user data from API
          const res = await fetch(
            `https://insighthub.com.ng/NestifyAPI/get_user_by_id.php?id=${cached.id}`,
            { headers: { Authorization: `Token ${token}` } }
          );
          const result = await res.json();

          if (result.status === "success") {
            const freshUser = result.data;
            // Update AsyncStorage so next load is also correct
            await AsyncStorage.setItem("authUser", JSON.stringify(freshUser));
            setUser(freshUser);
          } else {
            // Fallback to cached if API fails
            setUser(cached);
          }
        } catch {
          const userJson = await AsyncStorage.getItem("authUser");
          if (userJson) setUser(JSON.parse(userJson));
        } finally {
          setLoading(false);
        }
      };

      refreshUser();
    }, [])
  );
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const isSeller = user?.is_seller == 1;

  const onMessages = () => router.push("../Profile/Messages");
  const onSettings = () => router.push("../Profile/EditProfile");

  if (isSeller) {
    return <SellerProfile user={user} onMessages={onMessages} onSettings={onSettings} />;
  }
  return <BuyerProfile user={user} onMessages={onMessages} onSettings={onSettings} />;
}