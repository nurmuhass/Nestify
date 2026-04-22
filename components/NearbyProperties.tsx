import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropertyGrid from './PropertyGrid'; // ← your existing grid component

const { width: SW } = Dimensions.get('window');

/* ── Types (your originals) ───────────────────────────────────── */
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
  propertyCategory?: string | number;
};

type Category = {
  id: number | string;
  name: string;
};

const LISTING_TABS = ['All', 'For Rent', 'For Sell'];

export default function NearbyEstates() {
  const router = useRouter();

  // ── state (your originals) ─────────────────────────────────
  const [properties,     setProperties]     = useState<Property[]>([]);
  const [categories,     setCategories]     = useState<Category[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [loadingMore,    setLoadingMore]    = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [page,           setPage]           = useState(1);
  const [hasMore,        setHasMore]        = useState(true);
  const [activeTab,      setActiveTab]      = useState('All');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [user,           setUser]           = useState(null);
  const [seed]                              = useState(Math.floor(Math.random() * 99999));

  /* ── your original auth check ─────────────────────────────── */
  useEffect(() => {
    const checkAuth = async () => {
      const token   = await AsyncStorage.getItem('authToken');
      const userJson = await AsyncStorage.getItem('authUser');
      if (!token || !userJson) {
        setLoading(false);
        return;
      }
      setUser(JSON.parse(userJson));
      setLoading(false);
    };
    checkAuth();
  }, []);

  /* ── your original initial load ───────────────────────────── */
  useEffect(() => {
    fetchCategories();
    fetchNearby(1);
  }, []);

  /* ── your original focus refetch ──────────────────────────── */
  useFocusEffect(
    useCallback(() => {
      if (user) fetchNearby(1);
    }, [user])
  );

  /* ── your original fetchCategories ────────────────────────── */
  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        'https://insighthub.com.ng/NestifyAPI/get_categories.php',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Token ' + (token ?? ''),
          },
        }
      );
      const result = await response.json();
      if (result.status === 'success') {
        setCategories(result.categories || []);
      } else {
        Alert.alert('Error', result.msg || 'Failed to load categories');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Something went wrong');
    }
  };

  /* ── your original fetchNearby ────────────────────────────── */
  const fetchNearby = async (pageToLoad = 1) => {
    try {
      pageToLoad === 1 ? setLoading(true) : setLoadingMore(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/get_properties.php?page=${pageToLoad}&limit=10&seed=${seed}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Token ' + (token ?? ''),
          },
        }
      );
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        const data: Property[] = result.data ?? result.properties ?? [];
        setProperties((prev) => {
          const combined = pageToLoad === 1 ? data : [...prev, ...data];
          return Array.from(
            new Map(combined.map((p) => [String(p.id), p])).values()
          );
        });
        if (result.meta) setHasMore(pageToLoad < result.meta.pages);
      } else {
        Alert.alert('Error', result.msg || 'Failed to fetch properties');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
      Alert.alert('Error', err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /* ── your original handleLoadMore ─────────────────────────── */
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && filteredProperties.length > 0) {
      const next = page + 1;
      setPage(next);
      fetchNearby(next);
    }
  };

  /* ── your original filter logic ───────────────────────────── */
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      if (activeTab === 'For Rent' && !['Rent', 'Both'].includes(item.listingType)) return false;
      if (activeTab === 'For Sell' && !['Sell', 'Both'].includes(item.listingType)) return false;
      if (activeCategory !== 'All' && String(item.propertyCategory) !== activeCategory) return false;
      return true;
    });
  }, [properties, activeTab, activeCategory]);

  if (loading) return null;

  return (
    <View style={styles.container}>

      {/* ── Section header ── */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Nearby Properties</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/Home/Properties/AllPropertiesScreen' })}
        >
          <Text style={styles.sectionLink}>View all →</Text>
        </TouchableOpacity>
      </View>

      {/* ── Listing type tabs (segmented style) ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {LISTING_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Category chips (underline style) ── */}
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
              style={[styles.catBtn, isActive && styles.catBtnActive]}
              onPress={() => setActiveCategory(String(cat.id))}
            >
              <Text style={[styles.catText, isActive && styles.catTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Empty state ── */}
      {filteredProperties.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="home-outline" size={38} color="#b8b8c8" />
          <Text style={styles.emptyTitle}>No properties found</Text>
          <Text style={styles.emptySub}>No properties under this category yet</Text>
          {(activeCategory !== 'All' || activeTab !== 'All') && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => { setActiveTab('All'); setActiveCategory('All'); }}
            >
              <Text style={styles.clearText}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* ── your existing PropertyGrid — completely untouched ── */
        <PropertyGrid
          properties={filteredProperties}
          onEndReached={handleLoadMore}
          loadingMore={loadingMore}
        />
      )}

      {/* ── View more button ── */}
      {filteredProperties.length >= 6 && (
        <TouchableOpacity
          style={styles.viewMore}
          onPress={() => router.push({ pathname: '/Home/Properties/AllPropertiesScreen' })}
        >
          <Text style={styles.viewMoreText}>View all properties</Text>
          <Ionicons name="arrow-forward" size={14} color="#c9a84c" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingBottom: 30,
  },

  /* Section header */
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0a0a0f',
    letterSpacing: -0.2,
  },
  sectionLink: {
    fontSize: 12,
    color: '#c9a84c',
    fontWeight: '500',
  },

  /* Listing type tabs */
  tabsRow: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8e4dd',
  },
  tabActive: {
    backgroundColor: '#0f2044',
    borderColor: '#0f2044',
  },
  tabText: {
    fontSize: 13,
    color: '#8a8a9a',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#ffffff',
  },

  /* Category underline tabs */
  catScroll: {
    marginTop: 2,
    marginBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8e4dd',
  },
  catContent: {
    paddingHorizontal: 16,
    gap: 2,
  },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -0.5,
  },
  catBtnActive: {
    borderBottomColor: '#0f2044',
  },
  catText: {
    fontSize: 13,
    color: '#8a8a9a',
    fontWeight: '500',
  },
  catTextActive: {
    color: '#0f2044',
    fontWeight: '600',
  },

  /* Empty state */
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
    gap: 8,
    marginBottom: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#8a8a9a',
    textAlign: 'center',
  },
  clearBtn: {
    marginTop: 10,
    paddingHorizontal: 22,
    paddingVertical: 9,
    backgroundColor: '#c9a84c',
    borderRadius: 20,
  },
  clearText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },

  /* View more */
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#c9a84c',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#c9a84c',
    fontWeight: '600',
  },
});
