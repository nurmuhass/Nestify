import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

import { getStatusBarHeight } from "react-native-status-bar-height";

import PremiumLoader from "@/components/PremiumLoader";
import LikeButton from "@/components/LikeButton";
import { useToast } from "@/components/Toast";
import { useTheme } from "@/context/ThemeContext";

/* =========================================================
   THEME
========================================================= */

const COLORS = {
  bg: "#091530",
  card: "#0f2044",
  gold: "#c9a84c",
  goldLight: "#f0d98a",
  textPrimary: "#ffffff",
  textSecondary: "#94a3b8",
  border: "rgba(255,255,255,0.06)",
  success: "#10b981",
  danger: "#ef4444",
};

/* =========================================================
   TYPES
========================================================= */

type Property = {
  id: number;
  propertyName: string;
  images?: string[];
  listingType: string;
  city?: string;
  state?: string;
  rentPrice?: string;
  sellPrice?: string;

  likes_count?: number;
  views_count?: number;

  owner_is_premium?: number;
  is_premium_listing?: number;

  featured_until?: string | null;
  boosted_until?: string | null;

  created_at?: string;
};

/* =========================================================
   FILTERS
========================================================= */

const FILTERS = [
  "All",
  "Premium",
  "Featured",
  "For Rent",
  "For Sell",
];

/* =========================================================
   SCREEN
========================================================= */

export default function AllPropertiesScreen() {
  const { colors } = useTheme();
  const { companyId } = useLocalSearchParams();

  const { show } = useToast();

  const [properties, setProperties] = useState<Property[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] = useState("All");

  /* =========================================================
     FETCH
  ========================================================= */

  const loadProperties = async (
    pageToLoad = 1,
    refresh = false
  ) => {
    try {
      if (pageToLoad === 1 && !refresh) {
        setLoading(true);
      } else if (refresh) {
        setRefreshing(true);
      } else {
        setLoadingMore(true);
      }

      const token = await AsyncStorage.getItem("authToken");

      const url = companyId
        ? `https://insighthub.com.ng/NestifyAPI/get_Company_properties.php?companyId=${companyId}&page=${pageToLoad}&limit=10`
        : `https://insighthub.com.ng/NestifyAPI/get_feed_properties.php?page=${pageToLoad}&limit=10`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const result = await response.json();

      if (result.status === "success") {
        const incoming: Property[] = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.properties)
            ? result.properties
            : [];

        setProperties((prev) => {
          const combined =
            pageToLoad === 1
              ? incoming
              : [...prev, ...incoming];

          return Array.from(
            new Map(combined.map((p) => [p.id, p])).values()
          );
        });

        if (result.meta) {
          setHasMore(pageToLoad < result.meta.pages);
        } else {
          setHasMore(incoming.length > 0);
        }
      } else {
        show({
          type: "error",
          title: "Error",
          message: result.msg || "Failed to load properties",
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
      setLoadingMore(false);
    }
  };

  /* =========================================================
     INITIAL
  ========================================================= */

  useEffect(() => {
    loadProperties(1);
  }, []);

  /* =========================================================
     LOAD MORE
  ========================================================= */

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const next = page + 1;

      setPage(next);

      loadProperties(next);
    }
  };

  /* =========================================================
     REFRESH
  ========================================================= */

  const onRefresh = useCallback(() => {
    setPage(1);
    loadProperties(1, true);
  }, []);

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      const q = search.toLowerCase();

      const matchesSearch =
        item.propertyName?.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q) ||
        item.state?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (
        activeFilter === "For Rent" &&
        !["Rent", "Both"].includes(item.listingType)
      ) {
        return false;
      }

      if (
        activeFilter === "For Sell" &&
        !["Sell", "Both"].includes(item.listingType)
      ) {
        return false;
      }

      if (
        activeFilter === "Premium" &&
        Number(item.owner_is_premium) !== 1
      ) {
        return false;
      }

      if (
        activeFilter === "Featured" &&
        !item.featured_until
      ) {
        return false;
      }

      return true;
    });
  }, [properties, search, activeFilter]);

  /* =========================================================
     PRICE
  ========================================================= */

  const formatPrice = (price: any) => {
    return Number(
      String(price || 0).replace(/,/g, "")
    ).toLocaleString();
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading && properties.length === 0) {
    return <PremiumLoader />;
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id.toString()}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.buttonBackground}
          />
        }
        contentContainerStyle={{
          paddingBottom: 80,
        }}
        ListHeaderComponent={
          <>
            {/* =====================================================
               HEADER
            ===================================================== */}

            <View style={styles.hero}>
              <View style={styles.heroTop}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={[styles.backBtn, { backgroundColor: colors.inputBackground }]}
                >
                  <Ionicons
                    name="arrow-back"
                    size={22}
                    color={colors.icon}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.filterBtn, { backgroundColor: colors.inputBackground }]}>
                  <Feather
                    name="sliders"
                    size={18}
                    color={colors.icon}
                  />
                </TouchableOpacity>
              </View>

              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Discover Luxury Homes
              </Text>

              <Text style={[styles.heroSubtitle, { color: colors.mutedText }]}>
                Explore premium real estate opportunities
              </Text>

              {/* SEARCH */}

              <View style={[styles.searchWrap, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Ionicons
                  name="search"
                  size={18}
                  color={colors.icon}
                />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search by property, city or state..."
                  placeholderTextColor={
                    colors.mutedText
                  }
                  style={[styles.searchInput, { color: colors.text }]}
                />

                {search.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearch("")}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={colors.mutedText}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* STATS */}

              <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: colors.buttonBackground }]}>
                    {properties.length}
                  </Text>

                  <Text style={[styles.statLabel, { color: colors.mutedText }]}>
                    Listings
                  </Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: colors.buttonBackground }]}>
                    {
                      properties.filter(
                        (p) => Number(p.owner_is_premium) === 1
                      ).length
                    }
                  </Text>

                  <Text style={[styles.statLabel, { color: colors.mutedText }]}>
                    Premium
                  </Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: colors.buttonBackground }]}>
                    {
                      properties.filter(
                        (p) => p.featured_until
                      ).length
                    }
                  </Text>

                  <Text style={[styles.statLabel, { color: colors.mutedText }]}>
                    Featured
                  </Text>
                </View>
              </View>
            </View>

            {/* =====================================================
               FILTER CHIPS
            ===================================================== */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersWrap}
            >
              {FILTERS.map((filter) => {
                const active =
                  activeFilter === filter;

                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: active ? colors.buttonBackground : colors.cardBackground,
                        borderColor: active ? colors.buttonBackground : colors.border,
                      },
                    ]}
                    onPress={() =>
                      setActiveFilter(filter)
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: active ? colors.background : colors.text },
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* =====================================================
               FEATURED SECTION
            ===================================================== */}

            {properties.some(
              (p) =>
                p.featured_until ||
                p.owner_is_premium === 1
            ) && (
                <>
                  <View style={styles.sectionHead}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Featured Properties
                    </Text>

                    <Text style={[styles.sectionSub, { color: colors.mutedText }]}>
                      Curated premium listings
                    </Text>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                      false
                    }
                    contentContainerStyle={{
                      paddingHorizontal: 16,
                      gap: 14,
                      paddingBottom: 18,
                    }}
                  >
                    {properties
                      .filter(
                        (p: Property) =>
                          p.featured_until ||
                          p.owner_is_premium === 1
                      )
                      .slice(0, 8)
                      .map((item) => {
                        const image =
                          item.images?.[0]
                            ? `https://insighthub.com.ng/${item.images[0]}`
                            : undefined;

                        return (
                          <TouchableOpacity
                            key={item.id}
                            style={
                              styles.featuredCard
                            }
                            onPress={() =>
                              router.push({
                                pathname:
                                  "/Home/Properties/Details",
                                params: {
                                  id: String(
                                    item.id
                                  ),
                                },
                              })
                            }
                          >
                            <Image
                              source={{
                                uri: image,
                              }}
                              style={
                                styles.featuredImage
                              }
                            />

                            <View
                              style={
                                styles.featuredOverlay
                              }
                            >
                              <View
                                style={
                                  styles.premiumBadge
                                }
                              >
                                <Ionicons
                                  name="diamond"
                                  size={12}
                                  color={colors.background}
                                />

                                <Text
                                  style={
                                    styles.premiumBadgeText
                                  }
                                >
                                  PREMIUM
                                </Text>
                              </View>

                              <Text
                                numberOfLines={1}
                                style={
                                  styles.featuredName
                                }
                              >
                                {
                                  item.propertyName
                                }
                              </Text>

                              <Text
                                style={
                                  styles.featuredPrice
                                }
                              >
                                ₦
                                {formatPrice(
                                  item.sellPrice ||
                                  item.rentPrice
                                )}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                  </ScrollView>
                </>
              )}

            {/* =====================================================
               FEED TITLE
            ===================================================== */}

            <View style={styles.feedHead}>
              <Text style={[styles.feedTitle, { color: colors.text }]}>
                Marketplace Feed
              </Text>

              <Text style={[styles.feedSub, { color: colors.mutedText }]}>
                Smart personalized recommendations
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const image =
            item.images?.[0]
              ? `https://insighthub.com.ng/${item.images[0]}`
              : undefined;

          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() =>
                router.push({
                  pathname:
                    "/Home/Properties/Details",
                  params: {
                    id: String(item.id),
                  },
                })
              }
            >
              <View style={[styles.imageWrap, { backgroundColor: colors.inputBackground }]}>
                <Image
                  source={{ uri: image }}
                  style={[styles.image, { backgroundColor: colors.inputBackground }]}
                />

                {/* PREMIUM BADGES */}

                <View style={styles.topBadges}>
                  {Number(item.owner_is_premium) === 1 && (
                    <View
                      style={
                        styles.smallPremiumBadge
                      }
                    >
                      <Ionicons
                        name="diamond"
                        size={11}
                        color={colors.background}
                      />

                      <Text
                        style={
                          styles.smallPremiumText
                        }
                      >
                        PREMIUM
                      </Text>
                    </View>
                  )}

                  {item.featured_until && (
                    <View
                      style={
                        styles.featuredBadge
                      }
                    >
                      <Text
                        style={
                          styles.featuredBadgeText
                        }
                      >
                        FEATURED
                      </Text>
                    </View>
                  )}
                </View>

                {/* LIKE */}

                <View style={styles.likeBtn}>
                  <LikeButton
                    propertyId={item.id}
                    variant="icon"
                    size={17}
                    color="red"
                  />
                </View>
              </View>

              <View style={styles.info}>
                <Text
                  numberOfLines={1}
                  style={[styles.name, { color: colors.text }]}
                >
                  {item.propertyName}
                </Text>

                <Text style={[styles.location, { color: colors.mutedText }]}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={colors.mutedText}
                  />{" "}
                  {item.city}, {item.state}
                </Text>

                <Text style={[styles.price, { color: colors.buttonBackground }]}>
                  ₦
                  {formatPrice(
                    item.sellPrice ||
                    item.rentPrice
                  )}
                </Text>

                {/* META */}

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="eye-outline"
                      size={13}
                      color={colors.mutedText}
                    />

                    <Text style={[styles.metaText, { color: colors.mutedText }]}>
                      {item.views_count || 0}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Ionicons
                      name="heart-outline"
                      size={13}
                      color={colors.mutedText}
                    />

                    <Text style={[styles.metaText, { color: colors.mutedText }]}>
                      {item.likes_count || 0}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <MaterialIcons
                      name="verified"
                      size={13}
                      color={colors.buttonBackground}
                    />

                    <Text style={[styles.metaText, { color: colors.mutedText }]}>
                      Verified
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color={colors.buttonBackground}
              style={{
                marginTop: 20,
              }}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons
              name="home-outline"
              size={55}
              color={colors.mutedText}
            />

            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No properties found
            </Text>

            <Text style={[styles.emptySub, { color: colors.mutedText }]}>
              Try changing your filters or search
            </Text>
          </View>
        }
      />
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  hero: {
    paddingTop: getStatusBarHeight() + 8,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },

  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },

  heroTitle: {
    marginTop: 26,
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },

  heroSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  searchWrap: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    color: "#fff",
    fontSize: 14,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statNumber: {
    color: COLORS.gold,
    fontSize: 22,
    fontWeight: "800",
  },

  statLabel: {
    color: COLORS.textSecondary,
    marginTop: 5,
    fontSize: 12,
  },

  filtersWrap: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 18,
  },

  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filterChipActive: {
    backgroundColor: COLORS.gold,
  },

  filterChipText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  filterChipTextActive: {
    color: COLORS.bg,
  },

  sectionHead: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  sectionSub: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  featuredCard: {
    width: 270,
    height: 190,
    borderRadius: 24,
    overflow: "hidden",
  },

  featuredImage: {
    width: "100%",
    height: "100%",
  },

  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    marginBottom: 10,
  },

  premiumBadgeText: {
    color: COLORS.bg,
    fontWeight: "700",
    fontSize: 11,
  },

  featuredName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  featuredPrice: {
    marginTop: 5,
    color: COLORS.goldLight,
    fontSize: 16,
    fontWeight: "700",
  },

  feedHead: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
  },

  feedTitle: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "800",
  },

  feedSub: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 18,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  imageWrap: {
    position: "relative",
  },

  image: {
    width: "100%",
    height: 230,
  },

  topBadges: {
    position: "absolute",
    top: 14,
    left: 14,
    gap: 8,
  },

  smallPremiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },

  smallPremiumText: {
    color: COLORS.bg,
    fontWeight: "800",
    fontSize: 10,
  },

  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  featuredBadgeText: {
    color: COLORS.bg,
    fontWeight: "700",
    fontSize: 10,
  },

  likeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 22,
    padding: 8,
  },

  info: {
    padding: 16,
  },

  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  location: {
    marginTop: 7,
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  price: {
    marginTop: 14,
    color: COLORS.gold,
    fontSize: 24,
    fontWeight: "800",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  metaText: {
    color: "#aaa",
    fontSize: 12,
  },

  emptyWrap: {
    alignItems: "center",
    marginTop: 120,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: 18,
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  emptySub: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
});
