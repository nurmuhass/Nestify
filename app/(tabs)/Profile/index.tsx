// app/(tabs)/Profile/index.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import BuyerProfile from "./BuyerProfile";
import SellerProfile from "./SellerProfile";

import BuyerProfileSkeleton from "@/components/BuyerProfileSkeleton";
import SellerProfileSkeleton from "@/components/SellerProfileSkeleton";

export default function ProfileScreen() {
  const router = useRouter();

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  const [user, setUser] = useState<any>(null);

  // controls hydration completion
  const [hydrated, setHydrated] = useState(false);

  // determines which skeleton to show
  const [profileType, setProfileType] = useState<
    "buyer" | "seller" | null
  >(null);

  // refresh state
  const [refreshing, setRefreshing] = useState(false);

  // ─────────────────────────────────────────────
  // DERIVE SELLER STATUS
  // ─────────────────────────────────────────────
  const isSeller = useMemo(() => {
    if (!user) return false;

    return Number(user?.is_seller) === 1;
  }, [user]);

  // ─────────────────────────────────────────────
  // INITIAL CACHE LOAD
  // ─────────────────────────────────────────────
  useEffect(() => {
    const loadCachedUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("authUser");

        if (!userJson) {
          setProfileType("seller"); // default to seller skeleton if no cache
          return;
        }

        const cachedUser = JSON.parse(userJson);

        console.log(
          "CACHE is_seller:",
          cachedUser?.is_seller,
          typeof cachedUser?.is_seller
        );

        const seller = Number(cachedUser?.is_seller) === 1;

        // SET PROFILE TYPE IMMEDIATELY
        setProfileType(seller ? "seller" : "buyer");

        // SET USER
        setUser(cachedUser);
      } catch (e) {
        console.log("CACHE ERROR:", e);

        setProfileType("seller"); // default to seller skeleton if no cache
      } finally {
        setHydrated(true);
      }
    };

    loadCachedUser();
  }, []);

  // ─────────────────────────────────────────────
  // REFRESH USER ON FOCUS
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

          const cachedUser = JSON.parse(userJson);

          const res = await fetch(
            `https://insighthub.com.ng/NestifyAPI/get_user_by_id.php?id=${cachedUser.id}`,
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

            console.log(
              "FRESH is_seller:",
              freshUser?.is_seller,
              typeof freshUser?.is_seller
            );

            const seller = Number(freshUser?.is_seller) === 1;

            // UPDATE PROFILE TYPE
            setProfileType(seller ? "seller" : "buyer");

            // UPDATE USER
            setUser(freshUser);

            await AsyncStorage.setItem(
              "authUser",
              JSON.stringify(freshUser)
            );
          }
        } catch (e) {
          console.log("REFRESH ERROR:", e);
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

  // ─────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────
  const onMessages = () => {
    router.push("../Profile/Messages");
  };

  const onSettings = () => {
    router.push("../Profile/EditProfile");
  };

  // ─────────────────────────────────────────────
  // HYDRATING
  // ─────────────────────────────────────────────
  if (!hydrated) {
    // unknown yet
    if (profileType === null) {
      return <SellerProfileSkeleton />;
    }

    // seller skeleton
    if (profileType === "seller") {
      return <SellerProfileSkeleton />;
    }

    // buyer skeleton
    return <BuyerProfileSkeleton />;
  }

  // ─────────────────────────────────────────────
  // NO USER
  // ─────────────────────────────────────────────
  if (!user) {
    return <SellerProfileSkeleton />;
  }

  // ─────────────────────────────────────────────
  // SELLER PROFILE
  // ─────────────────────────────────────────────
  if (!isSeller) {
    return (
      <BuyerProfile
        user={user}
        refreshing={refreshing}
        onMessages={onMessages}
        onSettings={onSettings}
      />
    );
  }

  // ─────────────────────────────────────────────
  // BUYER PROFILE
  // ─────────────────────────────────────────────
  return (
    <SellerProfile
      user={user}
      refreshing={refreshing}
      onMessages={onMessages}
      onSettings={onSettings}
    />
  );
}