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
import LikeButton from "./LikeButton";

/* =========================
   COLORS
========================= */
const COLORS = {
  bg: "#091530",
  card: "#0f2044",
  gold: "#c9a84c",
  goldLight: "#f0d98a",
  textPrimary: "#ffffff",
  textSecondary: "#94a3b8",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(201,168,76,0.25)",
  mutedCard: "#0b1a33",
  success: "#22c55e",
  danger: "#ef4444",
};

/* =========================
   TYPES
========================= */
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

/* =========================
   COMPONENT
========================= */
export default function PropertyGrid({ properties }: Props) {
  const formatPrice = (price: any) => {
    return Number(String(price).replace(/,/g, "")).toLocaleString();
  };

  /* =========================
     RENDER ITEM
  ========================= */
  const renderItem = useCallback(({ item }: { item: Property }) => {
    const id = Number(item.id);

    const img =
      item.images && item.images.length > 0
        ? `https://insighthub.com.ng/${item.images[0]}`
        : null;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          width: "48%",
          backgroundColor: COLORS.card,
          borderRadius: 22,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: COLORS.border,
          marginBottom: 10,

          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 14,

          elevation: 6,
        }}
        onPress={() =>
          router.push({
            pathname: "/Home/Properties/Details",
            params: { id: String(id) },
          })
        }
      >
        {/* IMAGE */}
        <View style={{ position: "relative" }}>
          {img ? (
            <Image
              source={{ uri: img }}
              style={{
                width: "100%",
                height: 140,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: 140,
                backgroundColor: COLORS.mutedCard,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="image-outline"
                size={30}
                color={COLORS.textSecondary}
              />
            </View>
          )}

          {/* DARK OVERLAY */}
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.15)",
            }}
          />

          {/* LIKE BUTTON */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "rgba(9,21,48,0.9)",
              padding: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: COLORS.borderStrong,
            }}
          >
            <LikeButton
              propertyId={id}
              variant="minimal"
              size={17}
              color={COLORS.danger}
            />
          </TouchableOpacity>

          {/* PRICE BADGE */}
          <View
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              backgroundColor: COLORS.gold,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 30,
            }}
          >
            <Text
              style={{
                color: COLORS.bg,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              {item.listingType === "Rent"
                ? `₦${formatPrice(item.rentPrice)}/yr`
                : `₦${formatPrice(item.sellPrice)}`}
            </Text>
          </View>
        </View>

        {/* INFO */}
        <View
          style={{
            padding: 14,
          }}
        >
          {/* PROPERTY NAME */}
          <Text
            numberOfLines={1}
            style={{
              fontWeight: "700",
              fontSize: 15,
              color: COLORS.textPrimary,
            }}
          >
            {item.propertyName}
          </Text>

          {/* DETAILS */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <View
              style={[
                styles.sellerStatusPill,
                {
                  backgroundColor:
                    item.status === "available" ? "#166534"
                      : item.status === "sold" ? "#991b1b"
                        : "#374151",
                },
              ]}
            >
              <Text style={styles.sellerStatusText}>{item.status}</Text>
            </View>

            {/* LOCATION */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 10,
                flex: 1,
              }}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={COLORS.textSecondary}
              />

              <Text
                numberOfLines={1}
                style={{
                  fontSize: 12,
                  marginLeft: 3,
                  color: COLORS.textSecondary,
                  flex: 1,
                }}
              >
                {item.city}, {item.state}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  /* =========================
     RENDER
  ========================= */
  return (
    <View
      style={{
        marginTop: 20,
        paddingBottom: 20,
        backgroundColor: COLORS.bg,
        flex: 1,
      }}
    >
      <FlatList
        data={properties}
        numColumns={2}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 12,
          marginBottom: 16,
        }}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingTop: 5,
        }}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text
            style={{
              textAlign: "center",
              marginTop: 40,
              color: COLORS.textSecondary,
              fontSize: 15,
            }}
          >
            No properties found.
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sellerStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  sellerStatusText: { fontSize: 9, fontWeight: "700", color: "#fff", textTransform: "capitalize" },

});