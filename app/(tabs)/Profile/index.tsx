// app/(tabs)/Profile/index.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import BuyerProfile from "./BuyerProfile";
import SellerProfile from "./SellerProfile";

import BuyerProfileSkeleton from "@/components/BuyerProfileSkeleton";
import SellerProfileSkeleton from "@/components/SellerProfileSkeleton";
import PremiumLoader from "@/components/PremiumLoader";
import { useNetwork } from "@/NetworkContext";


type ProfileType = "buyer" | "seller";

function sellerValueToBoolean(value: any): boolean {
  if (value === true) return true;
  if (value === false) return false;

  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "seller" ||
    normalized === "company"
  );
}

function isUserSeller(rawUser: any): boolean {
  if (!rawUser) return false;

  /**
   * Support both backend styles:
   * - is_seller
   * - isSeller
   *
   * Your login/register/cache may use isSeller,
   * while get_user_by_id.php may use is_seller.
   */
  const explicitSellerValue =
    rawUser?.is_seller ??
    rawUser?.isSeller ??
    rawUser?.is_seller_account ??
    rawUser?.isSellerAccount;

  if (explicitSellerValue !== undefined && explicitSellerValue !== null) {
    return sellerValueToBoolean(explicitSellerValue);
  }

  /**
   * Optional fallback, in case your API returns account type/role.
   */
  const accountType =
    rawUser?.account_type ??
    rawUser?.accountType ??
    rawUser?.user_type ??
    rawUser?.userType ??
    rawUser?.role;

  if (accountType !== undefined && accountType !== null) {
    return sellerValueToBoolean(accountType);
  }

  /**
   * Optional seller clues.
   * These help if older cached users do not have is_seller/isSeller.
   */
  if (
    rawUser?.sellerType ||
    rawUser?.seller_type ||
    rawUser?.companyName ||
    rawUser?.company_name ||
    rawUser?.rc_number
  ) {
    return true;
  }

  return false;
}

function normalizeUser(rawUser: any) {
  if (!rawUser) return null;

  const seller = isUserSeller(rawUser);

  return {
    ...rawUser,

    /**
     * Force both formats to exist everywhere in your app.
     * This prevents the buyer/seller flicker.
     */
    is_seller: seller ? 1 : 0,
    isSeller: seller ? 1 : 0,
  };
}

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [booting, setBooting] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
const { isOnline } = useNetwork();

  const profileType: ProfileType | null = useMemo(() => {
    if (!user) return null;

    return Number(user.is_seller) === 1 ? "seller" : "buyer";
  }, [user]);

  const onMessages = () => {
    router.push("../Profile/Messages");
  };

  const onSettings = () => {
    router.push("../Profile/EditProfile");
  };

    useFocusEffect(
    useCallback(() => {
      /**
       * Extra safety.
       * OfflineGate should already block this screen,
       * but this prevents API refresh if the screen is still mounted.
       */
      if (!isOnline) {
        return;
      }

      let cancelled = false;

      const loadProfile = async () => {
        try {
          const userJson = await AsyncStorage.getItem("authUser");

          let cachedUser: any = null;

          if (userJson) {
            cachedUser = normalizeUser(JSON.parse(userJson));

            if (!cancelled && cachedUser) {
              console.log("NORMALIZED CACHE USER:", {
                id: cachedUser.id,
                is_seller: cachedUser.is_seller,
                isSeller: cachedUser.isSeller,
              });

              setUser(cachedUser);

              await AsyncStorage.setItem(
                "authUser",
                JSON.stringify(cachedUser)
              );
            }
          }

          if (!cancelled) {
            setBooting(false);
          }

          const token = await AsyncStorage.getItem("authToken");

          if (!token || !cachedUser?.id) {
            return;
          }

          if (!cancelled) {
            setRefreshing(true);
          }

          const res = await fetch(
            `https://insighthub.com.ng/NestifyAPI/get_user_by_id.php?id=${cachedUser.id}`,
            {
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          );

          const text = await res.text();

          let result: any;

          try {
            result = JSON.parse(text);
          } catch {
            console.log("PROFILE API INVALID JSON:", text.slice(0, 300));
            return;
          }

          if (cancelled) return;

          if (result.status === "success" && result.data) {
            const freshUser = normalizeUser(result.data);

            console.log("NORMALIZED FRESH USER:", {
              id: freshUser.id,
              is_seller: freshUser.is_seller,
              isSeller: freshUser.isSeller,
            });

            setUser(freshUser);

            await AsyncStorage.setItem(
              "authUser",
              JSON.stringify(freshUser)
            );
          }
        } catch (e) {
          console.log("PROFILE LOAD ERROR:", e);
        } finally {
          if (!cancelled) {
            setBooting(false);
            setRefreshing(false);
          }
        }
      };

      loadProfile();

      return () => {
        cancelled = true;
      };
    }, [isOnline])
  );

  /**
   * Important:
   * Do NOT show BuyerProfileSkeleton or SellerProfileSkeleton
   * when we do not yet know the user type.
   *
   * AsyncStorage is async, so the first render cannot know buyer/seller yet.
   * Showing buyer/seller skeleton here causes flicker.
   */
  if (booting && profileType === null) {
       return <PremiumLoader />;
  }

  /**
   * If user exists and profile type is already known,
   * you may show the correct skeleton.
   */
  if (booting && profileType === "seller") {
    return <SellerProfileSkeleton />;
  }

  if (booting && profileType === "buyer") {
    return <BuyerProfileSkeleton />;
  }

  /**
   * No cached user and no loaded user.
   * You can redirect to login here if needed.
   */
  if (!user || !profileType) {
       return <PremiumLoader />;
  }

  if (profileType === "seller") {
    return (
      <SellerProfile
        user={user}
        refreshing={refreshing}
        onMessages={onMessages}
        onSettings={onSettings}
      />
    );
  }

  return (
    <BuyerProfile
      user={user}
      refreshing={refreshing}
      onMessages={onMessages}
      onSettings={onSettings}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});