// app/index.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";

const Index = () => {
  const segments = useSegments();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Read token and user from AsyncStorage
        const token = await AsyncStorage.getItem("authToken");
        const userJson = await AsyncStorage.getItem("authUser");
        console.log("Stored token:", token);
        console.log("Stored user JSON:", userJson);
        if (token && userJson) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error reading login status", error);
        setIsLoggedIn(false);
      } finally {
        setInitialized(true);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    console.log("Segments:", segments, "isLoggedIn:", isLoggedIn);

    const inAuthGroup = segments[0] === "(auth)";
    if (!isLoggedIn && !inAuthGroup) {
      console.log("User not logged in - routing to Welcome Screen");
      router.replace("/(auth)/Welcome");
    } else if (isLoggedIn) {
      // If already in auth group, avoid infinite loop:
      if (inAuthGroup) {
        console.log("User is logged in but in auth group - routing to home");
        router.replace("/(tabs)/Home");
      } else {
        // Already on some non-auth route (e.g., index), redirect to Home
        router.replace("/(tabs)/Home");
      }
    }
  }, [segments, initialized, isLoggedIn]);

  // Show splash or blank while initializing
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {!initialized && (
        <Image
          source={require("../assets/images/splash-icon.png")}
          style={{ height: "100%", width: "100%" }}
        />
      )}
    </View>
  );
};

export default Index;
