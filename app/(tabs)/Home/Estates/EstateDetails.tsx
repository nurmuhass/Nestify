import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { initiateChat } from "@/hooks/useChat";
import ConfirmModal from "@/components/ConfirmModal";
import PremiumLoader from "@/components/PremiumLoader";
import { useToast } from "@/components/Toast";
import { useTheme } from "@/context/ThemeContext";

const COLORS = {
  bg: "#091530",
  card: "#0f2044",
  gold: "#c9a84c",
  goldLight: "#f0d98a",
  textPrimary: "#ffffff",
  textSecondary: "#94a3b8",
  border: "rgba(255,255,255,0.06)",
  danger: "#ef4444",
};

export default function EstateDetails() {
  const { show } = useToast();
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [company, setCompany] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] =
    useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [estate, setEstate] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isPremium = user?.plan_type === "premium";

  const formatPrice = (price: any) => {
    return Number(String(price).replace(/,/g, "")).toLocaleString();
  };

  useFocusEffect(
    React.useCallback(() => {
      if (id) {
        fetchEstateById();
      }
    }, [id]),
  );

  useEffect(() => {
    if (estate?.id) {
      fetchPropertiesByEstate();
      fetchCompanyById();
    }
  }, [estate]); // ✅ triggered when estate loads

  const fetchEstateById = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userJson = await AsyncStorage.getItem("authUser");
      if (userJson) {
        setUser(JSON.parse(userJson));
      }

      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/get_estate_by_id.php?id=${id}`,

        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        },
      );
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setEstate(result.estate);
      } else {
        const msg = result.msg || "Failed to load property details";
        setError(msg);
        show({ type: "error", title: "Error", message: msg });
      }
    } catch (err: any) {
      setError(err.message);
      show({ type: "error", title: "Error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertiesByEstate = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/get_properties_by_estate.php?estateId=${estate.id}&companyId=${estate.company_id}&page=1&limit=10`, // ✅ use estate from state
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        },
      );
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setProperties(result.properties);
      } else {
        const msg = result.msg || "Failed to load property details";
        setError(msg);
        show({ type: "error", title: "Error", message: msg });
      }
    } catch (err: any) {
      setError(err.message);
      show({ type: "error", title: "Error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyById = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/get_CompanyById.php?id=${estate.company_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        },
      );
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setCompany(result.user);
        setLoading(false);
      } else {
        const msg = result.msg || "Failed to load property details";
        setError(msg);
        show({ type: "error", title: "Error", message: msg });
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message);
      show({ type: "error", title: "Error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChatAction = async (type: "chat" | "inspection") => {
    const userJson = await AsyncStorage.getItem("authUser");
    if (!userJson) return;
    const currentUser = JSON.parse(userJson);

    if (currentUser.plan_type !== "premium") {
      show({
        type: "warning",
        title: "⭐ Premium Feature",
        message: "Chat with agents is available for premium members only.",
        action: {
          label: "Upgrade",
          onPress: () => router.push("/Subscription"),
        },
      });
      return;
    }

    // Guard — make sure we have a seller
    const sellerId = estate?.company_id;
    if (!sellerId) {
      show({
        type: "error",
        title: "Error",
        message: "Could not identify the company. Please try again.",
      });
      return;
    }

    setChatLoading(true);

    const openingMessage =
      type === "inspection"
        ? `Hi, I'd like to schedule an inspection. Are you available?`
        : `Hi, I'm interested in your properties. Can we talk?`;

    try {
      const result = await initiateChat(
        sellerId,
        null,
        openingMessage,
        "general",
      );

      if (result.success && result.conversationId) {
        router.push({
          pathname: "/Home/ChatRoom",
          params: {
            conversation_id: result.conversationId,
            property_name: estate?.name ?? "General Enquiry",
            property_id: "",
            company_id: estate?.company_id ?? "",
          },
        });
      } else if (result.notPremium) {
        show({
          type: "error",
          title: "Premium Required",
          message: result.msg ?? "Upgrade to chat.",
        });
      } else {
        show({
          type: "error",
          title: "Error",
          message: result.msg ?? "Could not start chat",
        });
      }
    } catch (e: any) {
      show({
        type: "error",
        title: "Error",
        message: e.message ?? "Something went wrong",
      });
    } finally {
      setChatLoading(false); // ← always runs, stops the spinner
    }
  };

  const confirmDelete = () => {
    setDeleteConfirmVisible(true);
  };

  const deleteEstate = async () => {
    if (!estate?.id) return;

    try {
      const token = await AsyncStorage.getItem("authToken");
      setDeleting(true);

      const response = await fetch(
        "https://insighthub.com.ng/NestifyAPI/delete-estate.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ estateId: estate.id }),
        },
      );

      const result = await response.json();

      console.log("DELETE RESPONSE:", result);

      if (response.ok && result.status === "success") {
        show({
          type: "success",
          title: "Deleted",
          message: "Estate deleted successfully.",
        });

        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        show({
          type: "error",
          title: "Error",
          message: result.msg || "Could not delete estate",
        });
      }
    } catch (err: any) {
      show({
        type: "error",
        title: "Error",
        message: err.message || "Something went wrong.",
      });
    } finally {
      setDeleting(false);
    }
  };
  if (!estate) {
    return <PremiumLoader />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Image */}
      <View style={{ position: "relative", backgroundColor: colors.inputBackground }}>
        <Image source={{ uri: estate.image_path }} style={[styles.coverImage, { backgroundColor: colors.inputBackground }]} />

        <View
          style={{
            position: "absolute",
            top: 40,
            left: 15,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            paddingHorizontal: 10,
          }}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>

          {user?.id === estate.company_id && (
            <TouchableOpacity
              onPress={confirmDelete}
              disabled={deleting}
              style={{
                marginRight: 15,
              }}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={COLORS.danger} />
              ) : (
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={COLORS.danger}
                />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={22} color="#ff4d4d" />
        </TouchableOpacity> */}

        {user?.id === estate.company_id && (
          <View
            style={{
              alignItems: "center",
              paddingHorizontal: 16,
              position: "absolute",
              bottom: 10,
              right: 0,
            }}
          >
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() =>
                router.push(`/Home/Estates/EditEstate?id=${estate.id}`)
              }
            >
              <Text style={styles.ctaText}>Edit Estate</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Company Info */}
      <View style={styles.section}>
        <View
          style={{
            marginBottom: 12,
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={[styles.title, { color: colors.text }]}>{estate.name}</Text>

          <View style={styles.subtitle}>
            <Ionicons
              name="location-outline"
              size={16}
              style={{ color: colors.mutedText }}
            />
            <Text
              style={{ fontSize: 16, color: colors.mutedText }}
              numberOfLines={3}
            >
              {estate.location}
            </Text>
          </View>
        </View>

        {/* 
        {company.verified && (
          <View style={styles.row}>
            <Ionicons name="shield-checkmark" size={18} color="#0f2044" />
            <Text style={styles.verified}>Verified Estate Company</Text>
          </View>
        )} */}

        <TouchableOpacity
          style={[styles.agentCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={() =>
            router.push(`/Home/Company/CompanyScreen?id=${estate.company_id}`)
          }
        >
          {company?.profile_image ? (
            <Image
              source={{ uri: company.profile_image }}
              style={styles.agentImg}
            />
          ) : (
            <View style={[styles.agentAvatar, { backgroundColor: colors.buttonBackground }]}>
              <Text style={[styles.agentInitials, { color: colors.background }]}>
                {(company?.company_name ?? "?")[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.agentName, { color: colors.text }]} numberOfLines={1}>
              {company?.company_name ?? "Company Name"}
            </Text>
            <Text style={[styles.agentLoc, { color: colors.mutedText }]} numberOfLines={1}>
              {[company?.city, company?.state].filter(Boolean).join(", ")}
            </Text>
          </View>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color={colors.buttonBackground}
          />
        </TouchableOpacity>
      </View>

      {/* CTA Buttons */}
      {user?.id && user.id !== estate.company_id && (
        <ScrollView
          contentContainerStyle={{}}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled
        >
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => handleChatAction("inspection")}
              disabled={chatLoading}
            >
              {chatLoading ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Ionicons name="calendar-outline" size={18} color={colors.background} />
              )}
              <Text style={styles.ctaText}>Book Inspection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => handleChatAction("chat")}
              disabled={chatLoading}
            >
              {chatLoading ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color={colors.background}
                />
              )}
              <Text style={styles.ctaText}>Chat With Company</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.buttonBackground }]}>About the Estate</Text>
        <Text style={[styles.bodyText, { color: colors.mutedText }]}>{estate.about}</Text>
      </View>

      {/* Amenities */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.buttonBackground }]}>Amenities</Text>

        <View style={styles.amenitiesRow}>
          {estate.estate_facilities.map((name: string, idx: number) => (
            <View key={idx.toString()} style={[styles.amenityBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Ionicons
                name="business-outline"
                size={20}
                color={colors.icon}
              />
              <Text style={[styles.amenityText, { color: colors.mutedText }]}>{name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Properties */}
      <View style={{ ...styles.section, marginBottom: 5 }}>
        {properties.length === 0 ? (
          <Text style={[styles.bodyText, { color: colors.mutedText }]}>
            No properties available for this estate yet.
          </Text>
        ) : (
          <>
            <View style={styles.rowSpace}>
              <Text style={{ ...styles.sectionTitle, marginBottom: 5, color: colors.buttonBackground }}>
                Properties
              </Text>
              <TouchableOpacity>
                <Text style={{ color: colors.buttonBackground }}>See all</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={properties}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) =>
                item.id ? item.id.toString() : Math.random().toString()
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.propertyCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() =>
                    router.push(`/Home/Properties/Details?id=${item.id}`)
                  }
                >
                  <Image
                    source={{
                      uri:
                        item.images && item.images.length > 0
                          ? `https://insighthub.com.ng/${item.images[0]}`
                          : estate.image_path,
                    }}
                    style={[styles.propertyImage, { backgroundColor: colors.inputBackground }]}
                  />

                  <Text style={[styles.propertyName, { color: colors.text }]} numberOfLines={1}>
                    {item.propertyName}
                  </Text>

                  <Text style={[styles.propertyPrice, { color: colors.buttonBackground }]}>
                    {item.listingType === "Rent"
                      ? `₦${formatPrice(item.rentPrice)}`
                      : item.listingType === "Sell"
                        ? `₦${formatPrice(item.sellPrice)}`
                        : `₦${formatPrice(item.sellPrice)} / ₦${formatPrice(item.rentPrice)}`}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </View>

      {/* Gallery */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gallery</Text>

        <View style={styles.galleryGrid}>
          {company.gallery.map((img, index) => (
            <Image key={index} source={{ uri: img }} style={styles.galleryImg} />
          ))}
        </View>
      </View> */}

      {/* Contact */}

      {!isPremium && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.buttonBackground }]}>Contact Information</Text>
          <Text style={[styles.bodyText, { color: colors.mutedText }]}>
            Upgrade to premium to view contact information and chat with the
            company.
          </Text>
        </View>
      )}

      {isPremium && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.buttonBackground }]}>Contact Information</Text>

          <Text style={[styles.contactText, { color: colors.mutedText }]}>📍 Address: {company?.address}</Text>
          <Text style={[styles.contactText, { color: colors.mutedText }]}>📞 Phone: {company?.phone}</Text>
          <Text style={[styles.contactText, { color: colors.mutedText }]}>✉ Email: {company?.email}</Text>
          <Text style={[styles.contactText, { color: colors.mutedText }]}>🌐 Website: {company?.website}</Text>
        </View>
      )}

      <View style={{ height: 60 }} />

      <ConfirmModal
        visible={deleteConfirmVisible}
        title="Delete Estate"
        message="Are you sure you want to delete this estate? This action cannot be undone."
        onCancel={() => setDeleteConfirmVisible(false)}
        onConfirm={async () => {
          setDeleteConfirmVisible(false);
          await deleteEstate();
        }}
        loading={deleting}
        confirmText="Delete"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  coverImage: { width: "100%", height: 240 },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 30,
  },
  favoriteButton: {
    position: "absolute",
    top: 40,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 30,
  },

  section: { padding: 16 },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.textPrimary },
  subtitle: {
    marginTop: 6,

    alignItems: "center",
    flexDirection: "row",
  },
  verified: { marginLeft: 6, fontSize: 14, color: COLORS.gold },

  row: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  rowSpace: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bodyText: { lineHeight: 22, color: COLORS.textSecondary, marginTop: 6 },

  ctaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 10,
    gap: 12,
  },
  ctaBtn: {
    backgroundColor: COLORS.gold,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  ctaText: { color: COLORS.textPrimary, fontWeight: "600", fontSize: 12 },

  // Amenities
  amenitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  amenityBox: {
    width: "45%",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 1,
    color: COLORS.textSecondary,
  },

  // Properties
  propertyCard: {
    width: 150,
    marginRight: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  propertyImage: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  propertyName: {
    marginTop: 5,
    marginLeft: 8,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  propertyPrice: {
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 8,
    color: COLORS.gold,
    fontWeight: "700",
  },

  // Gallery
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  galleryImg: {
    width: "48%",
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  agentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    borderRadius: 10,
    marginBottom: 2,
    backgroundColor: COLORS.card,
  },
  agentImg: { width: 42, height: 42, borderRadius: 21 },
  agentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  agentInitials: { fontSize: 16, fontWeight: "600", color: COLORS.bg },
  agentName: { fontWeight: "bold", fontSize: 14, color: COLORS.textPrimary },
  agentLoc: { fontSize: 12, color: COLORS.textSecondary },

  contactText: { marginTop: 6, fontSize: 14, color: COLORS.textSecondary },
  sectionTitle: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: "600",
  },
});
