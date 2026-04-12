import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useCallback } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import LikeButton from "./LikeButton";

/* =========================
   TYPES
========================= */
type Property = {
  id: number | string; // allow API flexibility
  propertyName: string;
  images?: string[];
  listingType: string;
  rentPrice?: string;
  sellPrice?: string;
  rating?: string;
  city?: string;
  state?: string;
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
  const [liked, setLiked] = useState<number[]>([]);


  

  /* =========================
     RENDER ITEM (OPTIMIZED)
  ========================= */
  const renderItem = useCallback(({ item }: { item: Property }) => {
    const id = Number(item.id); // 🔥 normalize id

    const img =
      item.images && item.images.length > 0
        ? `https://insighthub.com.ng/${item.images[0]}`
        : null;

    return (
      <TouchableOpacity
        style={{
          width: "48%",
          backgroundColor: "#fff",
          borderRadius: 15,
          overflow: "hidden",
          elevation: 2,
        }}
        onPress={() =>
          router.push({
            pathname: "/Home/Company/Details",
            params: { id: String(id) },
          })
        }
      >
        {/* IMAGE */}
        <View style={{ position: "relative" }}>
          {img ? (
            <Image
              source={{ uri: img }}
              style={{ width: "100%", height: 100 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: 100,
                backgroundColor: "#ddd",
              }}
            />
          )}

          {/* LIKE BUTTON */}
          <TouchableOpacity
            
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "white",
              padding: 5,
              borderRadius: 15,
            }}
          >
         <LikeButton
    propertyId={Number(id)}
    variant="minimal"
    size={17}
    color="red"
  />
          </TouchableOpacity>

          {/* PRICE BADGE */}
          <View
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              backgroundColor: "#00BFFF",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 15,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {item.listingType === "Rent"
                ? `₦${item.rentPrice}/yr`
                : `₦${item.sellPrice}`}
            </Text>
          </View>
        </View>

        {/* INFO */}
        <View style={{ padding: 10 }}>
          <Text style={{ fontWeight: "bold", fontSize: 14 }}>
            {item.propertyName}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <Ionicons name="star" size={14} color="gold" />
            <Text style={{ marginLeft: 4, fontSize: 12 }}>
              {item.rating ?? "4.8"}
            </Text>

            <Ionicons
              name="location-outline"
              size={14}
              color="gray"
              style={{ marginLeft: 10 }}
            />
            <Text
              style={{
                fontSize: 12,
                marginLeft: 2,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {item.city}, {item.state}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [liked]);

  /* =========================
     RENDER
  ========================= */
  return (
    <View style={{ marginTop: 20, paddingBottom: 20 }}>
      <FlatList
        data={properties}
        numColumns={2}
        keyExtractor={(item, index) => `${item.id}-${index}`}

        /* PERFORMANCE */
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}

        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 10,
          marginBottom: 15,
        }}

        contentContainerStyle={{
          paddingBottom: 80, // good spacing for bottom nav
        }}

        renderItem={renderItem}

        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
            No properties found.
          </Text>
        )}
      />
    </View>
  );
}