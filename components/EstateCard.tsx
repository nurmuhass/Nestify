import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colorWithAlpha } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

type EstateCardItem = {
  image_path?: string;
  num_properties?: number | string;
  boosted_until?: string | null;
  name?: string;
  location?: string;
  city?: string;
  [key: string]: any;
};

type EstateCardProps = {
  item: EstateCardItem;
  onPress: () => void;
};

const isBoosted = (boostedUntil: string | null | undefined) => {
  if (!boostedUntil) return false;
  return new Date(boostedUntil) > new Date();
};

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://insighthub.com.ng/NestifyAPI/${path}`;
};

export default function EstateCard({ item, onPress }: EstateCardProps) {
  const { colors } = useTheme();
  const imageUrl = getImageUrl(item?.image_path);
  const propertyCount = Number(item?.num_properties || 0);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[
        styles.card,
        {
          backgroundColor: colorWithAlpha(colors.cardBackground, 0.7),
          borderColor: colorWithAlpha(colors.buttonBackground, 0.18),
        },
      ]}
      onPress={onPress}
    >
      <ImageBackground
        source={
          imageUrl
            ? { uri: imageUrl }
            : require("../assets/images/placeholder-estate.jpg")
        }
        style={styles.cover}
        imageStyle={styles.coverImage}
      >
        <LinearGradient
          colors={[
            colorWithAlpha(colors.background, 0.05),
            colorWithAlpha(colors.background, 0.88),
          ]}
          style={styles.gradient}
        />

        <View style={styles.topRow}>
          {isBoosted(item?.boosted_until) ? (
            <View
              style={[
                styles.featuredBadge,
                { backgroundColor: colors.buttonBackground },
              ]}
            >
              <MaterialIcons name="star" size={12} color={colors.background} />
              <Text style={[styles.featuredBadgeText, { color: colors.background }]}>
                Featured
              </Text>
            </View>
          ) : (
            <View />
          )}

          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: colorWithAlpha(colors.background, 0.72),
                borderColor: colorWithAlpha(colors.text, 0.14),
              },
            ]}
          >
            <Text style={[styles.countBadgeText, { color: colors.text }]}>
              {propertyCount}
            </Text>
            <Text style={[styles.countBadgeLabel, { color: colors.mutedText }]}>
              {propertyCount === 1 ? "Property" : "Properties"}
            </Text>
          </View>
        </View>

        <View style={styles.bottomContent}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {item?.name || "Unnamed Estate"}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={15} color={colors.buttonBackground} />
            <Text style={[styles.location, { color: colors.mutedText }]} numberOfLines={1}>
              {item?.location || item?.city || "Location not available"}
            </Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <Ionicons name="business-outline" size={16} color={colors.buttonBackground} />
          <Text style={[styles.metaText, { color: colors.mutedText }]}>Estate Community</Text>
        </View>

        <View style={[styles.viewBtn, { backgroundColor: colors.buttonBackground }]}>
          <Text style={[styles.viewBtnText, { color: colors.background }]}>View Estate</Text>
          <Ionicons name="arrow-forward" size={15} color={colors.background} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
  },

  cover: {
    height: 190,
    width: "100%",
  },

  coverImage: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  topRow: {
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },

  featuredBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },

  countBadge: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },

  countBadgeText: {
    fontSize: 15,
    fontWeight: "900",
  },

  countBadgeLabel: {
    fontSize: 9,
    fontWeight: "700",
    marginTop: -1,
  },

  bottomContent: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  location: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },

  footer: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },

  metaText: {
    fontSize: 12,
    fontWeight: "700",
  },

  viewBtn: {
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 17,
    gap: 5,
  },

  viewBtnText: {
    fontSize: 12,
    fontWeight: "900",
  },
});
