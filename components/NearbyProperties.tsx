import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropertyGrid from './PropertyGrid';
import { useFocusEffect } from 'expo-router';

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
  propertyCategory?: string | number;
};

type Category = {
  id: number | string;
  name: string;
};

/* =========================
   LISTING TYPE TABS
========================= */
const LISTING_TABS = ['All', 'For Rent', 'For Sell'];

export default function NearbyEstates() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [activeTab, setActiveTab] = useState('All');
  const [activeCategory, setActiveCategory] = useState<string>('All');
 const [user, setUser] = useState(null);
  const [seed] = useState(Math.floor(Math.random() * 99999));

  /* =========================
     FETCH CATEGORIES
  ========================= */
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
      const message = err?.message || 'Something went wrong';
      Alert.alert('Error', message);
    }
  };

  /* =========================
     FETCH PROPERTIES
  ========================= */
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
            new Map(
              combined.map((p) => [String(p.id), p]) // ✅ safe unique key
            ).values()
          );
        });

        if (result.meta) {
          setHasMore(pageToLoad < result.meta.pages);
        }
      } else {
        Alert.alert('Error', result.msg || 'Failed to fetch properties');
      }
    } catch (err: any) {
      const message = err?.message || 'Something went wrong';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };



    useEffect(() => {
      const checkAuth = async () => {
        const token = await AsyncStorage.getItem("authToken");
        const userJson = await AsyncStorage.getItem("authUser");
        if (!token || !userJson) {
          console.log("Error", "Not authenticated");
          setLoading(false);
          return;
        }
        const userObj = JSON.parse(userJson);
        setUser(userObj);
        setLoading(false);
      };
      checkAuth();
    }, []);

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    fetchCategories();
      fetchNearby(1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
       fetchNearby(1);
      }
    }, [user])
  );

  /* =========================
     LOAD MORE
  ========================= */
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const next = page + 1;
      setPage(next);
      fetchNearby(next);
    }
  };

  /* =========================
     FILTER LOGIC
  ========================= */
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      if (activeTab === 'For Rent') {
        if (!['Rent', 'Both'].includes(item.listingType)) return false;
      }

      if (activeTab === 'For Sell') {
        if (!['Sell', 'Both'].includes(item.listingType)) return false;
      }

      if (activeCategory !== 'All') {
        if (String(item.propertyCategory) !== activeCategory) return false;
      }

      return true;
    });
  }, [properties, activeTab, activeCategory]);

  if (loading) return null;

  return (
    <View style={{ marginTop: 20, paddingBottom: 30 }}>
      {/* ===== LISTING TYPE TABS ===== */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 10 }}>
        {LISTING_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              marginRight: 10,
              paddingVertical: 6,
              paddingHorizontal: 16,
              backgroundColor: activeTab === tab ? '#007bff' : '#eee',
              borderRadius: 20,
            }}
          >
            <Text style={{ color: activeTab === tab ? '#fff' : '#000' }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ===== CATEGORY TABS ===== */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 10, marginTop: 15, marginBottom: 20 }}>
        <TouchableOpacity
          onPress={() => setActiveCategory('All')}
          style={{
            marginRight: 8,
            paddingVertical: 6,
            paddingHorizontal: 14,
            backgroundColor: activeCategory === 'All' ? '#000' : '#eee',
            borderRadius: 20,
          }}
        >
          <Text style={{ color: activeCategory === 'All' ? '#fff' : '#000' }}>
            All
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={String(cat.id)}
            onPress={() => setActiveCategory(String(cat.id))}
            style={{
              marginRight: 8,
              paddingVertical: 6,
              paddingHorizontal: 14,
              backgroundColor: activeCategory === String(cat.id) ? '#000' : '#eee',
              borderRadius: 20,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: activeCategory === String(cat.id) ? '#fff' : '#000',
              }}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* HEADER */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5, marginTop: 10, marginBottom: 10 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
          Explore Nearby properties
        </Text>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/Home/Properties/AllPropertiesScreen",
            })
          }
        >
          <Text style={{ color: '#007bff' }}>view all</Text>
        </TouchableOpacity>
      </View>

      {/* EMPTY STATE */}
      {filteredProperties.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center', marginBottom: 150 }}>
          <Text style={{ fontSize: 16, color: '#666' }}>
            No Properties under this category yet
          </Text>
        </View>
      ) : (
        <PropertyGrid
          properties={filteredProperties}
          onEndReached={handleLoadMore}
          loadingMore={loadingMore}
        />
      )}
    </View>
  );
}