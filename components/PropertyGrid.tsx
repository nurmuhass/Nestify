import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colorWithAlpha } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

import LikeButton from "./LikeButton";

type Property = {
  id: number | string;
  propertyName: string;
  images?: string[];
  listingType: string;
  rentPrice?: string;
  sellPrice?: string;
  rating?: string;
  city?: string;
  state?: string;
  status?: string;
};

type Props = {
  properties: Property[];
  onEndReached?: () => void;
  loadingMore?: boolean;
};

export default function PropertyGrid({ properties }: Props) {
  const { colors } = useTheme();

  const formatPrice = (price: any) => {
    return Number(String(price).replace(/,/g, "")).toLocaleString();
  };

  const renderItem = useCallback(
    ({ item }: { item: Property }) => {
      const id = Number(item.id);

      const img =
        item.images && item.images.length > 0
          ? `https://insighthub.com.ng/${item.images[0]}`
          : null;

      const listingColor =
        item.listingType === "Rent"
          ? colors.tint
          : item.listingType === "Sell"
            ? colors.success
            : colors.buttonBackground;

      const statusColor =
        item.status === "available"
          ? colors.success
          : item.status === "sold"
            ? colors.error
            : colors.mutedText;

      return (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
          onPress={() =>
            router.push({
              pathname: "/Home/Properties/Details",
              params: { id: String(id) },
            })
          }
        >
          <View style={styles.imageWrap}>
            {img ? (
              <Image source={{ uri: img }} style={styles.image} resizeMode="cover" />
            ) : (
              <View
                style={[
                  styles.imageFallback,
                  { backgroundColor: colors.inputBackground },
                ]}
              >
                <Ionicons
                  name="image-outline"
                  size={30}
                  color={colors.mutedText}
                />
              </View>
            )}

            <View
              style={[
                styles.imageOverlay,
                { backgroundColor: colorWithAlpha(colors.shadow, 0.15) },
              ]}
            />

            <TouchableOpacity
              style={[
                styles.likeWrap,
                {
                  backgroundColor: colorWithAlpha(colors.background, 0.9),
                  borderColor: colorWithAlpha(colors.buttonBackground, 0.25),
                },
              ]}
            >
              <LikeButton
                propertyId={id}
                variant="minimal"
                size={17}
                color={colors.error}
              />
            </TouchableOpacity>

            <View
              style={[
                styles.listingBadge,
                {
                  backgroundColor: listingColor,
                  borderColor: colorWithAlpha(colors.text, 0.15),
                },
              ]}
            >
              <Text style={[styles.listingText, { color: colors.background }]}>
                {item.listingType === "Rent"
                  ? "FOR RENT"
                  : item.listingType === "Sell"
                    ? "FOR SALE"
                    : item.listingType}
              </Text>
            </View>

            <View
              style={[
                styles.priceBadge,
                { backgroundColor: colors.buttonBackground },
              ]}
            >
              <Text style={[styles.priceText, { color: colors.background }]}>
                {item.listingType === "Rent"
                  ? `\u20a6${formatPrice(item.rentPrice)}/yr`
                  : `\u20a6${formatPrice(item.sellPrice)}`}
              </Text>
            </View>
          </View>

          <View style={styles.info}>
            <Text
              numberOfLines={1}
              style={[styles.name, { color: colors.text }]}
            >
              {item.propertyName}
            </Text>

            <View style={styles.detailsRow}>
              <View
                style={[styles.sellerStatusPill, { backgroundColor: statusColor }]}
              >
                <Text style={[styles.sellerStatusText, { color: colors.background }]}>
                  {item.status}
                </Text>
              </View>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={colors.mutedText}
                />

                <Text
                  numberOfLines={1}
                  style={[styles.locationText, { color: colors.mutedText }]}
                >
                  {item.city}, {item.state}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [colors],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <FlatList
        data={properties}
        numColumns={2}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.contentContainer}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={[styles.emptyText, { color: colors.mutedText }]}>
            No properties found.
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingBottom: 20,
    flex: 1,
  },
  card: {
    width: "48%",
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  imageWrap: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 140,
  },
  imageFallback: {
    width: "100%",
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  imageOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  likeWrap: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  listingBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  listingText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  priceBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
  },
  priceText: {
    fontSize: 12,
    fontWeight: "700",
  },
  info: {
    padding: 14,
  },
  name: {
    fontWeight: "700",
    fontSize: 15,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  sellerStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  sellerStatusText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 3,
    flex: 1,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  contentContainer: {
    paddingBottom: 100,
    paddingTop: 5,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },
});
