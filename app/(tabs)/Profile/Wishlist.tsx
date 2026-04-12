import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import LikeButton from '../../../components/LikeButton';

const formatPrice = (val: any) =>
  Number(String(val).replace(/,/g, '')).toLocaleString('en-NG');

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function SavedProperties() {
  const router = useRouter();
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchSaved();
    }, [])
  );

  

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(
        'https://insighthub.com.ng/NestifyAPI/get_liked_properties.php',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token ?? ''}`,
          },
        }
      );
      const result = await res.json();
      if (result.status === 'success') setSaved(result.data ?? []);
      console.log(result.data ,' saved properties loaded');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) =>
    status === 'available' ? '#28a745'
    : status === 'sold'    ? '#dc3545'
    : '#6c757d';

  const statusLabel = (status: string) =>
    status === 'available' ? 'Available'
    : status === 'sold'    ? 'Sold'
    : 'Unavailable';

  const priceDisplay = (item: any) => {
    if (item.listingType === 'Sell')
      return `₦${formatPrice(item.sellPrice)}`;
    if (item.listingType === 'Rent')
      return `₦${formatPrice(item.rentPrice)}`;
    return `₦${formatPrice(item.sellPrice)} / ₦${formatPrice(item.rentPrice)}`;
  };

  const priceSub = (item: any) =>
    item.listingType === 'Rent'
      ? `Per ${item.rentPeriod ?? 'year'}`
      : 'Outright sale';

  const chips = (item: any) =>
    [
      item.bedrooms && item.bedrooms != 0   ? `${item.bedrooms} Beds`   : null,
      item.Toilet   && item.Toilet   != 0   ? `${item.Toilet} Baths`    : null,
      item.listingType === 'Rent' ? 'For Rent' : item.listingType === 'Sell' ? 'For Sale' : 'Rent/Sell',
      item.Furnishing ?? null,
      item.propertyCategoryName ?? item.category_name ?? null,
      item.size ? `${item.size} sqm` : null,
      item.documentType ?? null,
    ].filter(Boolean) as string[];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Properties</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{saved.length} saved</Text>
        </View>
      </View>

      <FlatList
        data={saved}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={32} color="#ccc" />
            </View>
            <Text style={styles.emptyTitle}>No saved properties yet</Text>
            <Text style={styles.emptySub}>
              Tap the heart icon on any property to save it here
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.92}

              onPress={() =>
                      router.push({
                        pathname: "/Home/Company/Details",
                        params: { id: item.id },
                      })
                    }
          >
            {/* Image */}
            <View style={styles.cardImg}>
              {item.images?.[0] ? (
                <Image
                  source={{ uri: `https://insighthub.com.ng/${item.images[0]}` }} 
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imgPlaceholder}>
                  <MaterialIcons name="home" size={40} color="#ccc" />
                </View>
              )}

              {/* Status badge */}
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: statusColor(item.status) },
                ]}
              >
                <Text style={styles.statusText}>{statusLabel(item.status)}</Text>
              </View>

              {/* Heart — always filled since it's the saved page */}
              <View style={styles.heartWrap}>
                <LikeButton
                  propertyId={Number(item.id)}
                  initialLiked={true}
                  variant="minimal"
                  size={18}
                  color="#e11d48"
                  onToggle={fetchSaved}
                />
              </View>
            </View>

            {/* Body */}
            <View style={styles.cardBody}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.propertyName}
              </Text>

              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={12} color="#888" />
                <Text style={styles.locText} numberOfLines={1}>
                  {[item.city, item.state].filter(Boolean).join(', ')}
                </Text>
              </View>

              <Text style={styles.price}>
                {priceDisplay(item)}{' '}
                <Text style={styles.priceSub}>{priceSub(item)}</Text>
              </Text>

              {/* Chips */}
              <View style={styles.chips}>
                {chips(item)
                  .slice(0, 4)
                  .map((chip, i) => (
                    <View key={i} style={styles.chip}>
                      <Text style={styles.chipText}>{chip}</Text>
                    </View>
                  ))}
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <Text style={styles.savedDate}>
                  {item.created_at ? `Saved ${formatDate(item.created_at)}` : ''}
                </Text>
                <View style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>View details</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    paddingTop: getStatusBarHeight(),
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  countBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  countText: { fontSize: 12, fontWeight: '600', color: '#555' },

  list: { padding: 14, gap: 12 },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: 140,
    backgroundColor: '#e5e7eb',
    position: 'relative',
  },
  imgPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  statusPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  heartWrap: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 12 },
  cardName: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 3 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  locText: { fontSize: 12, color: '#666', flex: 1 },
  price: { fontSize: 15, fontWeight: 'bold', color: '#007bff', marginBottom: 8 },
  priceSub: { fontSize: 11, color: '#999', fontWeight: '400' },

  // Chips
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  chipText: { fontSize: 11, color: '#555' },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderColor: '#e5e7eb',
    paddingTop: 10,
  },
  savedDate: { fontSize: 11, color: '#aaa' },
  viewBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#007bff',
  },
  viewBtnText: { fontSize: 12, fontWeight: '600', color: '#007bff' },

  // Empty state
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  emptySub: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
