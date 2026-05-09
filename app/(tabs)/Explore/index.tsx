import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import LikeButton from '@/components/LikeButton';
import PremiumLoader from '@/components/PremiumLoader';
import { useToast } from '@/components/Toast';

const { width: SW } = Dimensions.get('window');

const COLORS = {
  bg: '#091530',
  card: '#0f2044',
  gold: '#c9a84c',
  goldLight: '#f0d98a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  border: 'rgba(255,255,255,0.06)',
  premiumGlow: 'rgba(201,168,76,0.18)',
};

type Property = {
  id: number | string;
  propertyName?: string;
  images?: string[];
  listingType?: string;
  rentPrice?: string | number | null;
  sellPrice?: string | number | null;
  city?: string;
  state?: string;
  propertyCategory?: string | number;
  owner_is_premium?: string | number;
  is_premium_listing?: string | number;
  featured_until?: string | null;
  boosted_until?: string | null;
  views_count?: string | number;
  likes_count?: string | number;
  explore_score?: string | number;
  thumbnail_image?: string | null;
  created_at?: string;
};

type Category = {
  id: number | string;
  name: string;
};

const FILTERS = ['All', 'Premium', 'Featured', 'For Rent', 'For Sell'];

export default function ExplorePage() {
  const { show } = useToast();
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('https://insighthub.com.ng/NestifyAPI/get_categories.php', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Token ' + (token ?? ''),
        },
      });
      const result = await response.json();
      if (result.status === 'success') setCategories(result.categories || []);
    } catch (err: any) {
      show({
        type: 'error',
        title: 'Error',
        message: err?.message || 'Failed to load categories',
      });
    }
  };

  const fetchProperties = async (pageToLoad = 1, refresh = false) => {
    try {
      if (pageToLoad === 1 && !refresh) setLoading(true);
      else if (refresh) setRefreshing(true);
      else setLoadingMore(true);

      const token = await AsyncStorage.getItem('authToken');

      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/get_explore_properties.php?page=${pageToLoad}&limit=10&listing_type=${encodeURIComponent(activeTab)}&category=${encodeURIComponent(activeCategory)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Token ' + (token ?? ''),
          },
        }
      );

      const text = await response.text();
      let result: any;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error('Unexpected server response');
      }

      if (response.ok && result.status === 'success') {
        const data: Property[] = result.data ?? result.properties ?? [];

        setProperties((prev) => {
          const combined = pageToLoad === 1 ? data : [...prev, ...data];
          return Array.from(new Map(combined.map((p) => [String(p.id), p])).values());
        });

        if (result.meta) {
          setHasMore(pageToLoad < result.meta.pages);
        } else {
          setHasMore(data.length > 0);
        }
      } else {
        show({
          type: 'error',
          title: 'Error',
          message: result.msg || 'Failed to load properties',
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
      show({
        type: 'error',
        title: 'Error',
        message: err?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadCategories();
    fetchProperties(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (page === 1) return;
    fetchProperties(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    // Reset page and refetch when filters change
    setPage(1);
    fetchProperties(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeCategory]);

  const formatPrice = (price: any) => {
    const n = Number(String(price ?? 0).replace(/,/g, ''));
    return Number.isFinite(n) ? n.toLocaleString() : '0';
  };

  const filteredProperties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return properties.filter((prop) => {
      const matchesSearch =
        !q ||
        prop.propertyName?.toLowerCase().includes(q) ||
        prop.city?.toLowerCase().includes(q) ||
        prop.state?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeTab === 'Premium' && Number(prop.owner_is_premium) !== 1) return false;
      if (activeTab === 'Featured' && !prop.featured_until) return false;
      if (activeTab === 'For Rent' && !['Rent', 'Both'].includes(String(prop.listingType))) return false;
      if (activeTab === 'For Sell' && !['Sell', 'Both'].includes(String(prop.listingType))) return false;

      if (activeCategory !== 'All' && String(prop.propertyCategory) !== activeCategory) return false;

      return true;
    });
  }, [properties, activeTab, activeCategory, searchQuery]);

  const featuredProperties = useMemo(() => {
    return properties
      .filter((p) => Number(p.owner_is_premium) === 1 || !!p.featured_until || !!p.boosted_until)
      .slice(0, 8);
  }, [properties]);

  const premiumCount = useMemo(
    () => properties.filter((p) => Number(p.owner_is_premium) === 1).length,
    [properties]
  );

  const featuredCount = useMemo(
    () => properties.filter((p) => !!p.featured_until).length,
    [properties]
  );

  const totalCount = properties.length;

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && filteredProperties.length > 0) {
      setPage((prev) => prev + 1);
    }
  };

  const onRefresh = useCallback(() => {
    setPage(1);
    fetchProperties(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeCategory]);

  if (loading && properties.length === 0) {
    return <PremiumLoader />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        ListHeaderComponent={
          <>
            <LinearGradient colors={['#0b1733', '#091530', '#091530']} style={styles.hero}>
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/Home')} style={styles.iconBtn}>
                  <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => searchInputRef.current?.focus()} style={styles.iconBtn}>
                  <Ionicons name="filter" size={18} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.heroTextWrap}>
                <Text style={styles.kicker}>Smart discovery</Text>
                <Text style={styles.heroTitle}>Explore premium homes</Text>
                <Text style={styles.heroSub}>
                  Curated listings ranked by relevance, location, premium status and engagement.
                </Text>
              </View>

              <View style={styles.searchWrap}>
                <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search by name, city or state..."
                  placeholderTextColor="#98a2b3"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
                    <Ionicons name="close-circle" size={18} color="#b5b8c3" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{totalCount}</Text>
                  <Text style={styles.statLabel}>Listings</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{premiumCount}</Text>
                  <Text style={styles.statLabel}>Premium</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{featuredCount}</Text>
                  <Text style={styles.statLabel}>Featured</Text>
                </View>
              </View>
            </LinearGradient>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {FILTERS.map((filter) => {
                const active = activeTab === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setActiveTab(filter)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{filter}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {[{ id: 'All', name: 'All' }, ...categories].map((cat) => {
                const active = activeCategory === String(cat.id);
                return (
                  <TouchableOpacity
                    key={String(cat.id)}
                    onPress={() => setActiveCategory(String(cat.id))}
                    style={[styles.categoryChip, active && styles.categoryChipActive]}
                  >
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {featuredProperties.length > 0 && (
              <>
                <View style={styles.sectionHead}>
                  <View>
                    <Text style={styles.sectionTitle}>Featured for you</Text>
                    <Text style={styles.sectionSub}>Premium and promoted listings</Text>
                  </View>
                  <TouchableOpacity onPress={() => setActiveTab('Premium')}>
                    <Text style={styles.sectionLink}>See premium</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
                  {featuredProperties.map((item) => {
                    const image =
                      item.thumbnail_image || (item.images && item.images.length > 0 ? item.images[0] : null);
                    const imageUrl = image ? `https://insighthub.com.ng/${image}` : undefined;
                    const isPremium = Number(item.owner_is_premium) === 1;

                    return (
                      <TouchableOpacity
                        key={String(item.id)}
                        activeOpacity={0.92}
                        style={styles.featuredCard}
                        onPress={() =>
                          router.push({
                            pathname: '/Home/Company/Details',
                            params: { id: String(item.id) },
                          })
                        }
                      >
                        {imageUrl ? (
                          <Image source={{ uri: imageUrl }} style={styles.featuredImage} />
                        ) : (
                          <View style={[styles.featuredImage, { backgroundColor: '#18284f' }]} />
                        )}

                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.82)']} style={styles.featuredOverlay} />

                        <View style={styles.featuredTopBadges}>
                          {isPremium && (
                            <View style={styles.badgeGold}>
                              <Ionicons name="diamond" size={11} color="#091530" />
                              <Text style={styles.badgeGoldText}>PREMIUM</Text>
                            </View>
                          )}
                          {item.featured_until && (
                            <View style={styles.badgeWhite}>
                              <Text style={styles.badgeWhiteText}>FEATURED</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.featuredContent}>
                          <Text numberOfLines={1} style={styles.featuredName}>{item.propertyName}</Text>
                          <Text style={styles.featuredLocation}>{item.city}, {item.state}</Text>
                          <Text style={styles.featuredPrice}>
                            ₦{formatPrice(item.sellPrice || item.rentPrice)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            <View style={styles.feedHead}>
              <Text style={styles.feedTitle}>Marketplace feed</Text>
              <Text style={styles.feedSub}>Fresh, premium and location-aware results</Text>
            </View>
          </>
        }
        renderItem={({ item: prop }) => {
          const thumbnail =
            prop.thumbnail_image || (prop.images && prop.images.length > 0 ? prop.images[0] : null);
          const thumbnailUrl = thumbnail ? `https://insighthub.com.ng/${thumbnail}` : undefined;
          const isPremium = Number(prop.owner_is_premium) === 1;
          const isFeatured = !!prop.featured_until;
          const isBoosted = !!prop.boosted_until;
          const price = prop.listingType === 'Sell' ? prop.sellPrice : prop.rentPrice || prop.sellPrice;

          return (
            <TouchableOpacity
              key={String(prop.id)}
              style={styles.card}
              activeOpacity={0.92}
              onPress={() =>
                router.push({
                  pathname: '/Home/Company/Details',
                  params: { id: String(prop.id) },
                })
              }
            >
              <View style={styles.cardImageWrap}>
                {thumbnailUrl ? (
                  <Image source={{ uri: thumbnailUrl }} style={styles.cardImage} />
                ) : (
                  <View style={[styles.cardImage, { backgroundColor: '#162751' }]} />
                )}

                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.cardOverlay} />

                <View style={styles.cardTopRow}>
                  <View style={styles.leftBadgeStack}>
                    {isPremium && (
                      <View style={styles.badgeGoldSmall}>
                        <Ionicons name="diamond" size={11} color="#091530" />
                        <Text style={styles.badgeGoldSmallText}>PREMIUM</Text>
                      </View>
                    )}

                    {isFeatured && (
                      <View style={styles.badgeWhiteSmall}>
                        <Text style={styles.badgeWhiteSmallText}>FEATURED</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.likeWrap}>
                    <LikeButton propertyId={Number(prop.id)} variant="icon" size={17} color="red" />
                  </View>
                </View>

                <View style={styles.rankPill}>
                  <Entypo name="star" size={11} color={COLORS.gold} />
                  <Text style={styles.rankPillText}>Explore</Text>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <Text numberOfLines={1} style={styles.cardName}>{prop.propertyName}</Text>

                <Text style={styles.location}>
                  <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />{' '}
                  {prop.city}, {prop.state}
                </Text>

                <Text style={styles.price}>
                  ₦{formatPrice(price)}
                  <Text style={styles.priceSuffix}>{prop.listingType === 'Rent' ? ' / month' : ''}</Text>
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="eye-outline" size={13} color={COLORS.textSecondary} />
                    <Text style={styles.metaText}>{Number(prop.views_count || 0)}</Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Ionicons name="heart-outline" size={13} color={COLORS.textSecondary} />
                    <Text style={styles.metaText}>{Number(prop.likes_count || 0)}</Text>
                  </View>

                  {isBoosted && (
                    <View style={styles.boostPill}>
                      <MaterialIcons name="rocket-launch" size={12} color="#fff" />
                      <Text style={styles.boostPillText}>Boosted</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={COLORS.gold} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading && !refreshing ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="home-outline" size={28} color={COLORS.gold} />
              </View>
              <Text style={styles.emptyTitle}>No properties found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery.trim()
                  ? `No results for “${searchQuery}”`
                  : 'Try a different filter or category to discover more listings.'}
              </Text>
              {(searchQuery.trim() || activeCategory !== 'All' || activeTab !== 'All') && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                    setActiveTab('All');
                  }}
                >
                  <Text style={styles.clearText}>Clear filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  listContent: {
    paddingBottom: 22,
  },
  hero: {
    paddingTop: getStatusBarHeight() + 10,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroTextWrap: {
    marginTop: 22,
  },
  kicker: {
    fontSize: 12,
    color: COLORS.goldLight,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  heroTitle: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  heroSub: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },
  searchWrap: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 13,
  },
  searchClear: {
    paddingLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.gold,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
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
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.bg,
  },
  categoryRow: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderColor: 'rgba(201,168,76,0.35)',
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 12.5,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.goldLight,
  },
  sectionHead: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSub: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  sectionLink: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  featuredRow: {
    paddingLeft: 16,
    paddingRight: 8,
    gap: 14,
    paddingBottom: 18,
  },
  featuredCard: {
    width: SW * 0.74,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  featuredTopBadges: {
    position: 'absolute',
    left: 14,
    top: 14,
    gap: 8,
  },
  badgeGold: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: COLORS.gold,
  },
  badgeGoldText: {
    color: COLORS.bg,
    fontSize: 10.5,
    fontWeight: '800',
  },
  badgeWhite: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  badgeWhiteText: {
    color: COLORS.bg,
    fontSize: 10,
    fontWeight: '800',
  },
  featuredContent: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
  },
  featuredName: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  featuredLocation: {
    marginTop: 4,
    color: '#e2e8f0',
    fontSize: 12.5,
  },
  featuredPrice: {
    marginTop: 7,
    color: COLORS.goldLight,
    fontSize: 18,
    fontWeight: '800',
  },
  feedHead: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  feedTitle: {
    color: COLORS.textPrimary,
    fontSize: 21,
    fontWeight: '800',
  },
  feedSub: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  cardImageWrap: {
    position: 'relative',
    height: 230,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  cardTopRow: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftBadgeStack: {
    gap: 8,
    flexShrink: 1,
  },
  badgeGoldSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: COLORS.gold,
  },
  badgeGoldSmallText: {
    color: COLORS.bg,
    fontSize: 10,
    fontWeight: '800',
  },
  badgeWhiteSmall: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  badgeWhiteSmallText: {
    color: COLORS.bg,
    fontSize: 10,
    fontWeight: '800',
  },
  likeWrap: {
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderRadius: 22,
    padding: 8,
  },
  rankPill: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  rankPillText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  cardInfo: {
    padding: 16,
  },
  cardName: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  location: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  price: {
    marginTop: 12,
    color: COLORS.goldLight,
    fontSize: 24,
    fontWeight: '800',
  },
  priceSuffix: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  metaRow: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  metaText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  boostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f97316',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  boostPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  footerLoader: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    paddingHorizontal: 28,
  },
  emptyIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.premiumGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  clearBtn: {
    marginTop: 16,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 22,
  },
  clearText: {
    color: COLORS.bg,
    fontWeight: '800',
    fontSize: 13,
  },
});
