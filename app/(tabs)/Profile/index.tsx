// app/(tabs)/Profile/index.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import BuyerProfile from "./BuyerProfile";
import SellerProfile from "./SellerProfile";

import BuyerProfileSkeleton from "@/components/BuyerProfileSkeleton";
import SellerProfileSkeleton from "@/components/SellerProfileSkeleton";

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  // null means not determined yet
  const [isSeller, setIsSeller] = useState<boolean | null>(null);

  // ONLY for first app load
  const [initializing, setInitializing] = useState(true);

  // Background refresh
  const [refreshing, setRefreshing] = useState(false);

  // ─────────────────────────────────────────────
  // INITIAL LOAD FROM CACHE
  // ─────────────────────────────────────────────
  useEffect(() => {
    const loadCachedUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("authUser");

        if (!userJson) {
          setInitializing(false);
          return;
        }

        const cached = JSON.parse(userJson);

        setUser(cached);

        // VERY IMPORTANT
        setIsSeller(cached?.is_seller == 1);
      } catch (e) {
        console.log(e);
      } finally {
        setInitializing(false);
      }
    };

    loadCachedUser();
  }, []);

  // ─────────────────────────────────────────────
  // BACKGROUND REFRESH
  // ─────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const refreshUser = async () => {
        try {
          setRefreshing(true);

          const token = await AsyncStorage.getItem("authToken");
          const userJson = await AsyncStorage.getItem("authUser");

          if (!token || !userJson) return;

          const cached = JSON.parse(userJson);

          const res = await fetch(
            `https://insighthub.com.ng/NestifyAPI/get_user_by_id.php?id=${cached.id}`,
            {
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          );

          const result = await res.json();

          if (cancelled) return;

          if (result.status === "success") {
            const freshUser = result.data;

            setUser(freshUser);

            setIsSeller(freshUser?.is_seller == 1);

            await AsyncStorage.setItem(
              "authUser",
              JSON.stringify(freshUser)
            );
          }
        } catch (e) {
          console.log(e);
        } finally {
          if (!cancelled) {
            setRefreshing(false);
          }
        }
      };

      refreshUser();

      return () => {
        cancelled = true;
      };
    }, [])
  );

  const onMessages = () => router.push("../Profile/Messages");

  const onSettings = () => router.push("../Profile/EditProfile");

  // ─────────────────────────────────────────────
  // ONLY SHOW SKELETON ON VERY FIRST LOAD
  // ─────────────────────────────────────────────
  if (initializing || isSeller === null) {
    return <SellerProfileSkeleton />;
  }

  // ─────────────────────────────────────────────
  // SELLER
  // ─────────────────────────────────────────────
  if (isSeller) {
    return (
      <SellerProfile
        user={user}
        refreshing={refreshing}
        onMessages={onMessages}
        onSettings={onSettings}
      />
    );
  }

  // ─────────────────────────────────────────────
  // BUYER
  // ─────────────────────────────────────────────
  return (
    <BuyerProfile
      user={user}
      refreshing={refreshing}
      onMessages={onMessages}
      onSettings={onSettings}
    />
  );
}