import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import CustomSplash from "../components/CustomSplash";

export default function Index() {
  const segments = useSegments();
  const router = useRouter();

  const [initialized, setInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userJson = await AsyncStorage.getItem("authUser");

        if (token && userJson) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setInitialized(true);
      }
    };

    checkLoginStatus();
  }, []);

  // 🔥 Handle routing AFTER splash finishes
  const handleFinish = () => {
    setShowSplash(false);

    const inAuthGroup = segments[0] === "(auth)";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/(auth)/Welcome");
    } else {
      router.replace("/(tabs)/Home");
    }
  };

  // 🚀 SHOW CUSTOM SPLASH FIRST
  if (showSplash) {
    return <CustomSplash onFinish={handleFinish} />;
  }

  return null;
}