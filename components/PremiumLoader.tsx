import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "@/context/ThemeContext";

export default function PremiumLoader({ text = "" }) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [opacityAnim, scaleAnim]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: colors.buttonBackground,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />

      <View
        style={[
          styles.innerCircle,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.warning,
          },
        ]}
      />

      <Text style={[styles.text, { color: colors.mutedText }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  innerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  text: {
    marginTop: 20,
    fontSize: 14,
  },
});
