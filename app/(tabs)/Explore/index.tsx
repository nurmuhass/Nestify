//Explore
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {

  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import CategoryTabs from '../../../components/CategoryTabs';
import SearchBar from '../../../components/SearchBar';
import LikeButton from '@/components/LikeButton';
import PremiumLoader from '@/components/PremiumLoader';

const COLORS = {
  bg: '#091530',
  card: '#0f2044',
  gold: '#c9a84c',
  goldLight: '#f0d98a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  border: 'rgba(255,255,255,0.06)',
};

export default function ExplorePage() {
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);
  const [properties, setProperties] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<Array<{ id: number | string; name: string }>>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [seed] = useState(Math.floor(Math.random() * 99999));
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProperties = async (pageToLoad = 1) => {
    try {
      if (pageToLoad === 1) setLoading(true);
      else setLoadingMore(true);

      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/get_properties.php?page=${pageToLoad}&limit=10&seed=${seed}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + (token ?? ''),
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        const data = result.data ?? result.properties ?? [];


        setProperties(prev => {
          const combined = pageToLoad === 1 ? data : [...prev, ...data];
          const unique = Array.from(
            new Map(combined.map((p: any) => [p.id, p])).values()
          );
          return unique;
        });







        if (result.meta) {
          setHasMore(pageToLoad < result.meta.pages);
        } else {
          setHasMore(data.length > 0);
        }
      }

    } catch (err: any) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };



  const handleLoadMore = () => {
    if (!loadingMore && hasMore && filteredProperties.length > 0) {
      setPage(prev => {
        const nextPage = prev + 1;
        fetchProperties(nextPage);
        return nextPage;
      });
    }
  };

  const formatPrice = (price: any) => {
    return Number(String(price).replace(/,/g, '')).toLocaleString();
  };

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('https://insighthub.com.ng/NestifyAPI/get_categories.php', {
        headers: { 'Content-Type': 'application/json', Authorization: 'Token ' + (token ?? '') },
      });
      const result = await response.json();
      if (result.status === 'success') setCategories(result.categories || []);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  useEffect(() => {
    fetchProperties(1);
    fetchCategories();
  }, []);


  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      if (activeTab === 'For Rent' && !['Rent', 'Both'].includes(prop.listingType)) return false;
      if (activeTab === 'For Sell' && !['Sell', 'Both'].includes(prop.listingType)) return false;
      if (activeCategory !== 'All' && String(prop.propertyCategory) !== activeCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prop.propertyName?.toLowerCase().includes(q);
        const matchesCity = prop.city?.toLowerCase().includes(q);
        const matchesState = prop.state?.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesState) return false;
      }

      return true;
    });
  }, [properties, activeTab, activeCategory, searchQuery]);

  if (loading && properties.length === 0) {
    return <PremiumLoader />;
  }


  return (
    <FlatList
      data={filteredProperties}
      keyExtractor={(item) => item.id.toString()}

      contentContainerStyle={{
        padding: 14,
        paddingTop: getStatusBarHeight(),
        backgroundColor: COLORS.bg,
        flex: 1,
      }}
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Ionicons name="arrow-back-circle-outline" size={29} color={COLORS.textPrimary} onPress={() => router.replace("/(tabs)/Home")} />
            <Text style={{ fontSize: 18, fontWeight: '500', color: COLORS.textPrimary }}>Explore</Text>

            <TouchableOpacity onPress={() => searchInputRef.current?.focus()}>
              <Ionicons name="filter-circle-outline" size={29} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* ── Local search bar ── */}
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color="#888" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search by name, city or state..."
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
                <Ionicons name="close-circle" size={17} color="#bbb" />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Segmented listing-type control ── */}
          <View style={styles.segmentWrap}>
            {['All', 'For Rent', 'For Sell'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.segBtn, activeTab === tab && styles.segBtnActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.segText, activeTab === tab && styles.segTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Underline category tabs ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.catScroll}
            contentContainerStyle={styles.catContent}
          >
            {[{ id: 'All', name: 'All' }, ...categories].map((cat) => {
              const isActive = activeCategory === String(cat.id);
              return (
                <TouchableOpacity
                  key={String(cat.id)}
                  onPress={() => setActiveCategory(String(cat.id))}
                  style={[styles.catBtn, isActive && styles.catBtnActive]}
                >
                  <Text style={[styles.catText, isActive && styles.catTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      }
      renderItem={({ item: prop }) => {
        const thumbnailUrl =
          prop.images && prop.images.length > 0
            ? `https://insighthub.com.ng/${prop.images[0]}`
            : undefined;

        return (
          <TouchableOpacity
            key={prop.id}
            style={styles.card}
            onPress={() =>
              router.push({ pathname: '/Home/Company/Details', params: { id: String(prop.id) } })
            }
          >
            <View style={styles.cardContent}>
              <View style={styles.imageContainer}>
                {thumbnailUrl ? (
                  <Image source={{ uri: thumbnailUrl }} style={styles.image} />
                ) : (
                  <View style={[styles.image, { backgroundColor: '#ddd' }]} />
                )}
                <TouchableOpacity style={styles.heartIcon}>
                  <LikeButton
                    propertyId={Number(prop.id)}
                    variant="icon"
                    size={17}
                    color="red"
                  />
                </TouchableOpacity>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    {prop.listingType === 'Both' ? 'House' : prop.listingType}
                  </Text>
                </View>
              </View>

              <View style={styles.info}>
                <Text style={styles.name}>{prop.propertyName}</Text>

                <View style={styles.row}>
                  <MaterialIcons name="star" size={14} color="#fbbf24" />
                  <Text style={styles.rating}>
                    ₦{formatPrice(prop.rentPrice ? prop.rentPrice : prop.sellPrice)}
                  </Text>
                </View>

                <Text style={styles.location}>
                  {prop.city}, {prop.state}
                </Text>

                <Text style={styles.price}>
                  {prop.listingType === 'Sell'
                    ? `₦${formatPrice(prop.sellPrice)}`
                    : prop.listingType === 'Rent'
                      ? `₦${formatPrice(prop.rentPrice)}`
                      : `₦${formatPrice(prop.sellPrice)} / ₦${formatPrice(prop.rentPrice)}`}
                  <Text style={styles.month}> /month</Text>
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        !loading && !loadingMore ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="home-outline" size={48} color="#ddd" />
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.trim()
                ? `No results for "${searchQuery}"`
                : 'No properties under this category yet'}
            </Text>
            {(searchQuery.trim() || activeCategory !== 'All' || activeTab !== 'All') && (
              <TouchableOpacity
                style={styles.emptyReset}
                onPress={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                  setActiveTab('All');
                }}
              >
                <Text style={styles.emptyResetText}>Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    color: COLORS.textPrimary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  card: {

    backgroundColor: COLORS.card,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    padding: 14,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: 170,
    height: 140,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  heartIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',

    padding: 4,
    borderRadius: 22,
    elevation: 2,
  },

  tag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  tagText: {
    color: COLORS.bg,
    fontSize: 11,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },

  name: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    color: COLORS.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    marginLeft: 4,
    fontSize: 13,
    color: '#666666',
  },
  location: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },


  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gold,
  },
  month: {
    fontSize: 13,
    fontWeight: '400',
    color: '#888888',
  },
  // Segmented control
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 3,
    marginTop: 14,
    borderWidth: 0.5,

  },
  segBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segBtnActive: {
    backgroundColor: COLORS.gold,
    borderWidth: 0.5,
    borderColor: '#d1d5db',
  },
  segText: {
    fontSize: 13,
    color: '#888',
  },
  segTextActive: {
    color: COLORS.bg,
    fontWeight: '600',
  },
  // Search bar
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 4,
    borderWidth: 0.6,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 10,
  },
  searchClear: {
    paddingLeft: 6,
  },

  // Empty state
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  emptyReset: {
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 24,
    backgroundColor: COLORS.gold,
    borderRadius: 22,
  },
  emptyResetText: {
    color: COLORS.bg,
    fontSize: 13,
    fontWeight: '600',
  },
  // Underline category tabs
  catScroll: {
    marginTop: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  catContent: {
    paddingHorizontal: 4,
  },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -0.5,
  },
  catBtnActive: {
    borderBottomColor: COLORS.gold,
  }
  ,
  catText: {
    fontSize: 13,
    color: COLORS.textSecondary,

  },
  catTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  }
});
