import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const GOLD = "#C9A84C";

const isBoosted = (boostedUntil: any) => {
  if (!boostedUntil) return false;
  try {
    return new Date(boostedUntil) > new Date();
  } catch {
    return false;
  }
};

export default function PropertyCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: item.images && item.images.length > 0 ? `https://insighthub.com.ng/${item.images[0]}` : item.thumbnail }}
        style={styles.image}
      />
      {isBoosted(item.boosted_until) && (
        <View style={styles.featuredBadge}>
          <MaterialIcons name="star" size={11} color="#fff" />
          <Text style={styles.featuredBadgeText}>Featured</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{item.propertyName}</Text>
        <Text style={styles.location}>
          {item.city}, {item.state}
        </Text>

        {item.rentPrice && (
          <Text style={styles.price}>
            ₦ {item.rentPrice.toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
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
    backgroundColor: GOLD,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    zIndex: 10,
  },
  featuredBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  location: {
    color: "#777",
    marginTop: 4,
  },
  price: {
    marginTop: 6,
    fontWeight: "bold",
    color: "#2B7A0B",
  },
});
