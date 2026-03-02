import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PropertyCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
          source={{ uri: item.images && item.images.length > 0 ? `https://insighthub.com.ng/${item.images[0]}` : item.thumbnail }}
        style={styles.image}
      />

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
