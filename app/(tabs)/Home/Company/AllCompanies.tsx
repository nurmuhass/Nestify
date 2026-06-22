import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "../../../../components/Toast";
import { getStatusBarHeight } from "react-native-status-bar-height";
import PremiumLoader from "@/components/PremiumLoader";
import { useTheme } from "@/context/ThemeContext";

export default function AllCompanies() {
  const { show } = useToast();
  const { colors } = useTheme();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* =========================================
     FETCH COMPANIES
     ========================================= */

  const fetchCompanies = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch(
        "https://insighthub.com.ng/NestifyAPI/get_companies.php",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Token " + (token ?? ""),
          },
        },
      );

      const result = await response.json();

      if (result.status === "success") {
        setCompanies(result.companies || []);
      } else {
        show({
          type: "error",
          title: "Error",
          message: result.msg || "Failed to load companies",
        });
      }
    } catch (err: any) {
      show({
        type: "error",
        title: "Error",
        message: err.message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchCompanies()]);
  }, []);

  /* =========================================
     REFRESH
     ========================================= */

  const onRefresh = () => {
    setRefreshing(true);
    fetchCompanies();
  };

  /* =========================================
     FILTERED COMPANIES
     ========================================= */

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        company.company_name?.toLowerCase().includes(searchText) ||
        company.city?.toLowerCase().includes(searchText) ||
        company.state?.toLowerCase().includes(searchText);

      if (search && !matchesSearch) {
        return false;
      }

      return true;
    });
  }, [companies, search]);

  /* =========================================
     LOADING
     ========================================= */

  if (loading) {
    return <PremiumLoader />;
  }

  /* =========================================
     UI
     ========================================= */

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: getStatusBarHeight(),
      }}
    >
      {/* HEADER */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: 16,
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.icon}
            style={{
              marginRight: 8,
            }}
            onPress={() => router.back()}
          />

          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: colors.text,
            }}
          >
            Companies / Agents / Owners
          </Text>
        </View>

        <Text
          style={{
            marginTop: 5,
            fontSize: 14,
            color: colors.mutedText,
          }}
        >
          Discover trusted real estate companies
        </Text>

        {/* SEARCH */}
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.inputBackground,
            borderRadius: 12,
            paddingHorizontal: 14,
            height: 48,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Ionicons name="search" size={18} color={colors.buttonBackground} />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search agency, city, state..."
            placeholderTextColor={colors.mutedText}
            style={{
              flex: 1,
              marginLeft: 10,
              fontSize: 14,
              color: colors.text,
            }}
          />
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredCompanies}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
          backgroundColor: colors.background,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.buttonBackground}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View
            style={{
              marginTop: 100,
              alignItems: "center",
            }}
          >
            <Ionicons name="business-outline" size={60} color={colors.buttonBackground} />

            <Text
              style={{
                marginTop: 14,
                fontSize: 18,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              No companies found
            </Text>

            <Text
              style={{
                marginTop: 6,
                color: colors.mutedText,
                textAlign: "center",
              }}
            >
              Try adjusting your search or filters
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const logo = item.profile_image || "https://via.placeholder.com/100";
          const cover = item.company_cover_image || item.profile_image || logo;

          const displayName =
            item.company_name || item.name || "Unnamed Company";
          const locationText =
            item.city && item.state
              ? `${item.city}, ${item.state}`
              : item.state || item.city || "Location not available";

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: "/Home/Company/CompanyScreen",
                  params: {
                    id: String(item.id),
                  },
                })
              }
              style={{
                marginBottom: 22,
                borderRadius: 24,
                backgroundColor: colors.cardBackground,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {/* COVER */}
              <View style={{ height: 210 }}>
                <Image
                  source={{ uri: cover }}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />

                <LinearGradient
                  colors={["rgba(15,32,68,0.05)", "rgba(15,32,68,0.95)"]}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                  }}
                />

                {/* TOP BADGES */}
                <View
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    right: 16,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {item.is_featured_company == 1 ? (
                    <View
                      style={{
                        backgroundColor: "#c9a84c",
                        borderRadius: 20,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons name="star" size={13} color="#091530" />

                      <Text
                        style={{
                          marginLeft: 5,
                          color: "#091530",
                          fontWeight: "900",
                          fontSize: 11,
                        }}
                      >
                        FEATURED
                      </Text>
                    </View>
                  ) : (
                    <View />
                  )}

                  {item.is_online == 1 && (
                    <View
                      style={{
                        backgroundColor: "rgba(34,197,94,0.95)",
                        borderRadius: 20,
                        paddingHorizontal: 11,
                        paddingVertical: 7,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 4,
                          backgroundColor: "#fff",
                          marginRight: 6,
                        }}
                      />

                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "800",
                          fontSize: 11,
                        }}
                      >
                        ACTIVE
                      </Text>
                    </View>
                  )}
                </View>

                {/* LOGO */}
                <View
                  style={{
                    position: "absolute",
                    bottom: -36,
                    left: 18,
                    backgroundColor: colors.cardBackground,
                    borderRadius: 22,
                    padding: 5,
                    borderWidth: 1,
                    borderColor: "rgba(201,168,76,0.35)",
                  }}
                >
                  <Image
                    source={{ uri: logo }}
                    style={{
                      width: 74,
                      height: 74,
                      borderRadius: 18,
                      backgroundColor: colors.inputBackground,
                    }}
                  />
                </View>
              </View>

              {/* BODY */}
              <View
                style={{
                  paddingTop: 48,
                  paddingHorizontal: 18,
                  paddingBottom: 18,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          flex: 1,
                          fontSize: 17,
                          fontWeight: "900",
                          color: colors.text,
                        }}
                      >
                        {displayName}
                      </Text>
                      {item.seller_verified == 1 && (
                        <View style={styles.verifiedBadgeDark}>
                          <Ionicons
                            name="shield-checkmark"
                            size={13}
                            color="#22c55e"
                          />
                          <Text style={styles.verifiedTextDark}>Verified</Text>
                        </View>
                      )}
                    </View>

                    <Text
                      numberOfLines={1}
                      style={{
                        marginTop: 5,
                        color: colors.mutedText,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {locationText}
                    </Text>
                  </View>
                </View>

                {/* NO RATING / NO REVIEWS */}
                <View
                  style={{
                    marginTop: 18,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingTop: 16,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: "rgba(201,168,76,0.13)",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 10,
                      }}
                    >
                        <Ionicons name="home-outline" size={18} color={colors.buttonBackground} />
                    </View>

                    <View>
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 16,
                          fontWeight: "900",
                        }}
                      >
                        {item.properties_count || 0}
                      </Text>

                      <Text
                        style={{
                          color: colors.mutedText,
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        Listings
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      backgroundColor: colors.buttonBackground,
                      height: 38,
                      paddingHorizontal: 14,
                      borderRadius: 19,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.background,
                        fontSize: 12,
                        fontWeight: "900",
                        marginRight: 6,
                      }}
                    >
                      View Profile
                    </Text>

                    <Ionicons name="arrow-forward" size={15} color={colors.background} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  verifiedBadgeDark: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.12)",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.35)",
    marginLeft: 8,
  },

  verifiedTextDark: {
    marginLeft: 4,
    color: "#86efac",
    fontSize: 11,
    fontWeight: "900",
  },
});
