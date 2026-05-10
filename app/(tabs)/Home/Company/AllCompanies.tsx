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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "../../../../components/Toast";
import { getStatusBarHeight } from "react-native-status-bar-height";
import PremiumLoader from "@/components/PremiumLoader";

export default function AllCompanies() {

  const { show } = useToast();
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
        }
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

    Promise.all([
      fetchCompanies(),

    ]);

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

    return (

      <PremiumLoader />

    );
  }

  /* =========================================
     UI
     ========================================= */

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0f2044",
        paddingTop: getStatusBarHeight(),
      }}
    >




      {/* HEADER */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: 16,
          backgroundColor: "#0f2044",
        }}
      >
        <View style={{
          flexDirection: "row",
          alignItems: "center",
        }}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#fff"
            style={{
              marginRight: 8
            }}
            onPress={() => router.back()}
          />


          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#fff",
            }}
          >
            Companies / Agents / Owners
          </Text>

        </View>

        <Text
          style={{
            marginTop: 5,
            fontSize: 14,
            color: "#bbb",
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
            backgroundColor: "#1a2f4a",
            borderRadius: 12,
            paddingHorizontal: 14,
            height: 48,
            borderWidth: 1,
            borderColor: "#fff",
          }}
        >

          <Ionicons
            name="search"
            size={18}
            color="#c9a84c"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search agency, city, state..."
            placeholderTextColor="#666"
            style={{
              flex: 1,
              marginLeft: 10,
              fontSize: 14,
              color: "#fff",
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
          backgroundColor: "#0f2044",
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#c9a84c"
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

            <Ionicons
              name="business-outline"
              size={60}
              color="#c9a84c"
            />

            <Text
              style={{
                marginTop: 14,
                fontSize: 18,
                fontWeight: "700",
                color: "#0f2044",
              }}
            >
              No companies found
            </Text>

            <Text
              style={{
                marginTop: 6,
                color: "#999",
                textAlign: "center",
              }}
            >
              Try adjusting your search or filters
            </Text>

          </View>
        )}
        renderItem={({ item }) => {

          const logo =
            item.profile_image ||
            "https://via.placeholder.com/100";

          const cover =
            item.company_cover_image ||
            item.profile_image;

          return (

            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() =>
                router.push({
                  pathname: "/Home/Company/CompanyScreen",
                  params: {
                    id: String(item.id),
                  },
                })
              }
              style={{
                marginBottom: 24,
                borderRadius: 20,
                backgroundColor: "#fff",
                overflow: "hidden",
                shadowColor: "#c9a84c",
                shadowOpacity: 0.12,
                shadowRadius: 10,
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                elevation: 6,
                borderWidth: 1,
                borderColor: "#f0ebe3",
              }}
            >

              {/* COVER IMAGE */}
              <View
                style={{
                  height: 220,
                }}
              >

                <Image
                  source={{ uri: cover }}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />

                {/* OVERLAY */}
                <LinearGradient
                  colors={[
                    "transparent",
                    "rgba(0,0,0,0.82)",
                  ]}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                  }}
                />

                {/* FEATURED BADGE */}
                {item.is_featured_company == 1 && (
                  <View
                    style={{
                      position: "absolute",
                      top: 18,
                      left: 18,
                      backgroundColor: "#c9a84c",
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "700",
                        fontSize: 11,
                      }}
                    >
                      FEATURED
                    </Text>
                  </View>
                )}

                {/* ACTIVE STATUS */}
                {item.is_online == 1 && (
                  <View
                    style={{
                      position: "absolute",
                      top: 18,
                      right: 18,
                      backgroundColor: "#22c55e",
                      borderRadius: 20,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >

                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#fff",
                        marginRight: 5,
                      }}
                    />

                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "700",
                        fontSize: 11,
                      }}
                    >
                      ACTIVE
                    </Text>

                  </View>
                )}

                {/* LOGO */}
                <View
                  style={{
                    position: "absolute",
                    bottom: -34,
                    left: 20,
                    backgroundColor: "#fff",
                    borderRadius: 22,
                    padding: 5,
                  }}
                >

                  <Image
                    source={{ uri: logo }}
                    style={{
                      width: 74,
                      height: 74,
                      borderRadius: 18,
                    }}
                  />

                </View>

              </View>

              {/* CONTENT */}
              <View
                style={{
                  paddingTop: 42,
                  paddingHorizontal: 20,
                  paddingBottom: 20,
                }}
              >

                {/* COMPANY NAME */}
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
                      fontSize: 20,
                      fontWeight: "800",
                      color: "#0f2044",
                    }}
                  >
                    {item.company_name || item.name}
                  </Text>

                  {item.seller_verified == 1 && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#22c55e"
                    />
                  )}

                </View>

                {/* LOCATION */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >

                  <Ionicons
                    name="location-outline"
                    size={15}
                    color="#c9a84c"
                  />

                  <Text
                    style={{
                      marginLeft: 5,
                      color: "#999",
                      fontSize: 14,
                    }}
                  >
                    {item.city}, {item.state}
                  </Text>

                </View>

                {/* STATS */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 24,
                    borderTopWidth: 1,
                    borderTopColor: "#e8e5df",
                    paddingTop: 18,
                  }}
                >

                  {/* PROPERTIES */}
                  <View
                    style={{
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: "#0f2044",
                      }}
                    >
                      {item.properties_count || 0}
                    </Text>

                    <Text
                      style={{
                        marginTop: 3,
                        color: "#999",
                        fontSize: 12,
                      }}
                    >
                      Listings
                    </Text>
                  </View>

                  {/* RATING */}
                  <View
                    style={{
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: "#c9a84c",
                      }}
                    >
                      {item.average_rating || "0.0"}
                    </Text>

                    <Text
                      style={{
                        marginTop: 3,
                        color: "#999",
                        fontSize: 12,
                      }}
                    >
                      Rating
                    </Text>
                  </View>

                  {/* REVIEWS */}
                  <View
                    style={{
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: "#0f2044",
                      }}
                    >
                      {item.review_count || 0}
                    </Text>

                    <Text
                      style={{
                        marginTop: 3,
                        color: "#999",
                        fontSize: 12,
                      }}
                    >
                      Reviews
                    </Text>
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