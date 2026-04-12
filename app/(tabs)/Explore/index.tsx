import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import CategoryTabs from '../../../components/CategoryTabs';
import SearchBar from '../../../components/SearchBar';
import LikeButton from '@/components/LikeButton';

export default function ExplorePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
const [seed] = useState(Math.floor(Math.random() * 99999));
  useEffect(() => {
    fetchProperties(1);
  }, []);

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
    if (!loadingMore && hasMore) {
      setPage(prev => {
        const nextPage = prev + 1;
        fetchProperties(nextPage);
        return nextPage;
      });
    }
  };

  if (loading && properties.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <FlatList
      data={properties}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 10, paddingTop: getStatusBarHeight() }}
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Ionicons
              name="arrow-back-circle-outline"
              size={29}
              color="black"
              onPress={() => router.back()}
            />
            <Text style={{ fontSize: 18, fontWeight: '500' }}>Explore</Text>
            <Ionicons name="filter-circle-outline" size={29} color="black" />
          </View>

          <SearchBar />
          <CategoryTabs />
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
                    {prop.rentPrice ? prop.rentPrice : prop.sellPrice}
                  </Text>
                </View>

                <Text style={styles.location}>
                  {prop.city}, {prop.state}
                </Text>

                <Text style={styles.price}>
                  {prop.listingType === 'Rent'
                    ? `${prop.rentPrice}`
                    : prop.listingType === 'Sell'
                    ? `${prop.sellPrice}`
                    : `${prop.sellPrice} • ${prop.rentPrice}`}
                  <Text style={styles.month}> /month</Text>
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color="#007bff" />
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
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    padding: 12,
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
    backgroundColor: '#ffffff',
    padding: 4,
    borderRadius: 20,
    elevation: 2,
  },
  tag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    color: '#222222',
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
    color: '#666666',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
  },
  month: {
    fontSize: 13,
    fontWeight: '400',
    color: '#888888',
  },
});
