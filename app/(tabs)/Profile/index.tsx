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
  const [user, setUser]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  // null = not yet read from cache
  // true = seller, false = buyer
  const [isSeller, setIsSeller] = useState<boolean | null>(null);

  // ── Read cache ONCE on mount so the first render already knows the type ──
  // This useEffect runs before useFocusEffect and before the API call,
  // so `isSeller` is set on the very first meaningful render.
  useEffect(() => {
    AsyncStorage.getItem("authUser").then((json) => {
      if (!json) return;
      try {
        const cached = JSON.parse(json);
        setIsSeller(cached?.is_seller == 1);
      } catch { /* ignore */ }
    });
  }, []);

  // ── Full refresh every time the tab comes into focus ─────────────────────
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const refreshUser = async () => {
        setLoading(true);
        try {
          const token    = await AsyncStorage.getItem("authToken");
          const userJson = await AsyncStorage.getItem("authUser");

          if (!token || !userJson) {
            if (!cancelled) setLoading(false);
            return;
          }

          const cached = JSON.parse(userJson);

          // Ensure skeleton matches while we wait for the API response
          if (!cancelled) setIsSeller(cached?.is_seller == 1);

          const res    = await fetch(
            `https://insighthub.com.ng/NestifyAPI/get_user_by_id.php?id=${cached.id}`,
            { headers: { Authorization: `Token ${token}` } }
          );
          const result = await res.json();

          if (cancelled) return;

          if (result.status === "success") {
            const freshUser = result.data;
            await AsyncStorage.setItem("authUser", JSON.stringify(freshUser));
            setIsSeller(freshUser?.is_seller == 1);
            setUser(freshUser);
          } else {
            setUser(cached);
          }
        } catch {
          if (cancelled) return;
          try {
            const userJson = await AsyncStorage.getItem("authUser");
            if (userJson) {
              const cached = JSON.parse(userJson);
              setIsSeller(cached?.is_seller == 1);
              setUser(cached);
            }
          } catch { /* storage unavailable */ }
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      refreshUser();

      // Cleanup: if the tab loses focus before the fetch resolves,
      // don't apply stale state updates.
      return () => { cancelled = true; };
    }, [])
  );

  const onMessages = () => router.push("../Profile/Messages");
  const onSettings = () => router.push("../Profile/EditProfile");

  // ── Show skeleton while loading ───────────────────────────────────────────
  // isSeller === null  → cache read hasn't resolved yet (< one JS tick)
  //                      fall back to BuyerProfileSkeleton as safe default
  // isSeller === true  → show SellerProfileSkeleton
  // isSeller === false → show BuyerProfileSkeleton
  if (loading) {
    return isSeller === true
      ? <SellerProfileSkeleton />
      : <BuyerProfileSkeleton />;
  }

  // ── Real content ──────────────────────────────────────────────────────────
  if (isSeller) {
    return <SellerProfile user={user} onMessages={onMessages} onSettings={onSettings} />;
  }
  return <BuyerProfile user={user} onMessages={onMessages} onSettings={onSettings} />;
}
