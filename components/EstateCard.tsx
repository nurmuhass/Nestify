import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EstateCard({totalCount, item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: item.image_path }} style={styles.cover} />

      <View style={styles.infoBox}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.location} numberOfLines={1}>
          📍 {item.location}
        </Text>

        <View style={styles.row}>
          <Text style={styles.count}>{totalCount} Properties</Text>
          {/* {item.verified && (
            <Text style={styles.verified}>✔ Verified</Text>
          )} */}
          <Text style={styles.verified}>✔ Verified</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
  },
  cover: {
    width: "100%",
    height: 150,
  },
  infoBox: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  location: {
    color: "#777",
    marginTop: 3,
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    alignItems: "center",
  },
  count: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0a84ff",
  },
  verified: {
    backgroundColor: "#e6f3ff",
    color: "#0a84ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
  },
});
