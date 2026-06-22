import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/context/ThemeContext";

type PropertyCardItem = {
  images?: string[];
  thumbnail?: string;
  boosted_until?: string | null;
  propertyName?: string;
  city?: string;
  state?: string;
  rentPrice?: number | string;
  [key: string]: any;
};

type PropertyCardProps = {
  item: PropertyCardItem;
  onPress: () => void;
};

const isBoosted = (boostedUntil: any) => {
  if (!boostedUntil) return false;

  try {
    return new Date(boostedUntil) > new Date();
  } catch {
    return false;
  }
};

export default function PropertyCard({ item, onPress }: PropertyCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
      onPress={onPress}
    >
      <Image
        source={{
          uri:
            item.images && item.images.length > 0
              ? `https://insighthub.com.ng/${item.images[0]}`
              : item.thumbnail,
        }}
        style={styles.image}
      />

      {isBoosted(item.boosted_until) && (
        <View
          style={[
            styles.featuredBadge,
            { backgroundColor: colors.buttonBackground },
          ]}
        >
          <MaterialIcons name="star" size={11} color={colors.background} />
          <Text style={[styles.featuredBadgeText, { color: colors.background }]}>
            Featured
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>
          {item.propertyName}
        </Text>
        <Text style={[styles.location, { color: colors.mutedText }]}>
          {item.city}, {item.state}
        </Text>

        {item.rentPrice && (
          <Text style={[styles.price, { color: colors.success }]}>
            {"\u20a6"} {item.rentPrice.toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    borderWidth: 1,
  },
  image: {
    width: "100%",
    height: 160,
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    zIndex: 10,
  },
  featuredBadgeText: {
    fontSize: 8,
    fontWeight: "700",
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  location: {
    marginTop: 4,
  },
  price: {
    marginTop: 6,
    fontWeight: "bold",
  },
});
