// components/OfflineScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";

import { useNetwork } from "@/NetworkContext";

type Props = {
  checking?: boolean;
};

export default function OfflineScreen({ checking = false }: Props) {
  const { refreshConnection, isChecking } = useNetwork();

  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    const animation = Animated.parallel([
      createPulse(pulse1, 0),
      createPulse(pulse2, 450),
      floating,
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse1, pulse2, floatAnim]);

  const getPulseStyle = (value: Animated.Value) => ({
    opacity: value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.45, 0],
    }),
    transform: [
      {
        scale: value.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1.8],
        }),
      },
    ],
  });

  const floatStyle = {
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.decorTop} />
      <View style={styles.decorBottom} />

      <View style={styles.content}>
        <View style={styles.animationBox}>
          <Animated.View
            style={[
              styles.pulseCircle,
              getPulseStyle(pulse1),
            ]}
          />

          <Animated.View
            style={[
              styles.pulseCircle,
              getPulseStyle(pulse2),
            ]}
          />

          <Animated.View style={[styles.iconCircle, floatStyle]}>
            <Ionicons
              name="cloud-offline-outline"
              size={58}
              color="#f0d98a"
            />
          </Animated.View>
        </View>

        <Text style={styles.title}>
          {checking ? "Checking connection..." : "No Internet Connection"}
        </Text>

        <Text style={styles.subtitle}>
          {checking
            ? "Please wait while Nestify checks your network."
            : "You appear to be offline. Please check your Wi-Fi or mobile data and try again."}
        </Text>

        {!checking && (
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
            disabled={isChecking}
            onPress={refreshConnection}
          >
            <Ionicons
              name="refresh"
              size={18}
              color="#091530"
            />

            <Text style={styles.retryText}>
              {isChecking ? "Checking..." : "Try Again"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: getStatusBarHeight(),
    backgroundColor: "#091530",
    overflow: "hidden",
  },

  decorTop: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(201,168,76,0.12)",
  },

  decorBottom: {
    position: "absolute",
    bottom: -90,
    left: -70,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(240,217,138,0.08)",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  animationBox: {
    width: 190,
    height: 190,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  pulseCircle: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(240,217,138,0.22)",
  },

  iconCircle: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(240,217,138,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.62)",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 330,
  },

  retryButton: {
    marginTop: 28,
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: "#c9a84c",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  retryButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },

  retryText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#091530",
  },
});