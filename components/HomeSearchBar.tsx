import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "@/context/ThemeContext";

export default function HomeSearchBar() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.bar,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/Home/Searchscreen",
        })
      }
    >
      <Ionicons name="search-outline" size={18} color={colors.mutedText} />
      <Text style={[styles.placeholder, { color: colors.mutedText }]}>
        Search house, apartment...
      </Text>
      <View style={[styles.filterBtn, { backgroundColor: colors.buttonBackground }]}>
        <Ionicons name="options-outline" size={13} color={colors.background} />
        <Text style={[styles.filterText, { color: colors.background }]}>
          Filter
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  placeholder: {
    flex: 1,
    fontSize: 14,
    fontWeight: "400",
  },
  filterBtn: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
