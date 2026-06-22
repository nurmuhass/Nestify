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
import PremiumLoader from '@/components/PremiumLoader';
import { colorWithAlpha } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

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
  const { colors } = useTheme();
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
    status === 'available' ? colors.success
    : status === 'sold'    ? colors.error
    : colors.mutedText;

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
      <PremiumLoader />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colorWithAlpha(colors.cardBackground, 0.65), borderColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Saved Properties</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.inputBackground }]}>
          <Text style={[styles.countText, { color: colors.mutedText }]}>{saved.length} saved</Text>
        </View>
      </View>

      <FlatList
        data={saved}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="heart-outline" size={32} color={colors.mutedText} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved properties yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedText }]}>
              Tap the heart icon on any property to save it here
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            activeOpacity={0.92}

              onPress={() =>
                      router.push({
                        pathname: "/Home/Properties/Details",
                        params: { id: item.id },
                      })
                    }
          >
            {/* Image */}
            <View style={[styles.cardImg, { backgroundColor: colors.inputBackground }]}>
              {item.images?.[0] ? (
                <Image
                  source={{ uri: `https://insighthub.com.ng/${item.images[0]}` }} 
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.imgPlaceholder, { backgroundColor: colors.inputBackground }]}>
                  <MaterialIcons name="home" size={40} color={colors.mutedText} />
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
              <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
                {item.propertyName}
              </Text>

              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={12} color={colors.mutedText} />
                <Text style={[styles.locText, { color: colors.mutedText }]} numberOfLines={1}>
                  {[item.city, item.state].filter(Boolean).join(', ')}
                </Text>
              </View>

              <Text style={[styles.price, { color: colors.buttonBackground }]}>
                {priceDisplay(item)}{' '}
                <Text style={[styles.priceSub, { color: colors.mutedText }]}>{priceSub(item)}</Text>
              </Text>

              {/* Chips */}
              <View style={styles.chips}>
                {chips(item)
                  .slice(0, 4)
                  .map((chip, i) => (
                    <View key={i} style={[styles.chip, { backgroundColor: colors.inputBackground }]}>
                      <Text style={[styles.chipText, { color: colors.mutedText }]}>{chip}</Text>
                    </View>
                  ))}
              </View>

              {/* Footer */}
              <View style={[styles.cardFooter, { borderColor: colors.border }]}>
                <Text style={[styles.savedDate, { color: colors.mutedText }]}>
                  {item.created_at ? `Saved ${formatDate(item.created_at)}` : ''}
                </Text>
                <View style={[styles.viewBtn, { borderColor: colors.buttonBackground }]}>
                  <Text style={[styles.viewBtnText, { color: colors.buttonBackground }]}>View details</Text>
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
    backgroundColor: '#0f2044',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  countText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },

  list: { padding: 14, gap: 12 },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  imgPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
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
  cardName: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 3 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  locText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', flex: 1 },
  price: { fontSize: 15, fontWeight: 'bold', color: '#c9a84c', marginBottom: 8 },
  priceSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '400' },

  // Chips
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  chipText: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingTop: 10,
  },
  savedDate: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  viewBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#c9a84c',
  },
  viewBtnText: { fontSize: 12, fontWeight: '600', color: '#c9a84c' },

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
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  emptySub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
