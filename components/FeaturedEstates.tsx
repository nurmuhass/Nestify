import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const fmt = (v?: string | number) =>
  v ? '₦' + Number(String(v).replace(/,/g, '')).toLocaleString('en-NG') : '—';

export default function FeaturedEstates() {
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEstates();
  }, []);

  // ── your original fetch, untouched ──────────────────────────
  const fetchEstates = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        'https://insighthub.com.ng/NestifyAPI/get_Estates.php',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Token ' + (token ?? ''),
          },
        }
      );
      const result = await response.json();
      if (result.status === 'success') {
        setEstates(result.Estates || result.estates || []);
      } else {
        Alert.alert('Error', result.msg || 'Failed to load estates');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* ── Section header ── */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Featured Estates</Text>
        <TouchableOpacity onPress={() => router.push('Home/Estates/AllEstates')}>
          <Text style={styles.sectionLink}>View all →</Text>
        </TouchableOpacity>
      </View>

      {/* ── Loading ── */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#c9a84c" />
        </View>
      ) : estates.length === 0 ? (
        <View style={styles.loader}>
          <Text style={styles.emptyText}>No estates available</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {estates.map((estate: any) => {
            const price = estate.sellPrice
              ? fmt(estate.sellPrice)
              : estate.rentPrice
              ? `${fmt(estate.rentPrice)}/yr`
              : null;

            const tag =
              estate.listingType === 'Both'
                ? 'Sell & Rent'
                : estate.listingType ?? 'Estate';

            return (
              <TouchableOpacity
                key={estate.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: '/Home/EstateCompanyDetails',
                    params: { id: String(estate.id) },
                  })
                }
              >
                {/* Photo */}
                <Image
                  source={{ uri: estate.image_path }}
                  style={styles.img}
                  resizeMode="cover"
                />

                {/* Cinematic gradient */}
                <LinearGradient
                  colors={[
                    'transparent',
                    'rgba(5,8,20,0.55)',
                    'rgba(5,8,20,0.93)',
                  ]}
                  locations={[0.3, 0.65, 1]}
                  style={StyleSheet.absoluteFillObject}
                />

                {/* Listing type badge */}
                {estate.listingType ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tag}</Text>
                  </View>
                ) : null}

                {/* Heart */}
                <TouchableOpacity style={styles.heart}>
                  <Ionicons
                    name="heart-outline"
                    size={14}
                    color="rgba(255,255,255,0.85)"
                  />
                </TouchableOpacity>

                {/* Bottom info */}
                <View style={styles.body}>
                  <Text style={styles.name} numberOfLines={1}>
                    {estate.name}
                  </Text>

                  <View style={styles.locRow}>
                    <Ionicons
                      name="location-outline"
                      size={11}
                      color="rgba(255,255,255,0.5)"
                    />
                    <Text style={styles.loc} numberOfLines={1}>
                      {estate.location || estate.city || 'Nigeria'}
                    </Text>
                  </View>

                  <View style={styles.bottom}>
                    {/* Price */}
                    {price ? (
                      <Text style={styles.price}>{price}</Text>
                    ) : (
                      <View />
                    )}

                    {/* Feature chips */}
                    <View style={styles.chips}>
                      {estate.bedrooms ? (
                        <View style={styles.chip}>
                          <MaterialCommunityIcons
                            name="bed-outline"
                            size={10}
                            color="rgba(255,255,255,0.7)"
                          />
                          <Text style={styles.chipText}>
                            {estate.bedrooms}bd
                          </Text>
                        </View>
                      ) : null}
                      {estate.total_properties ? (
                        <View style={styles.chip}>
                          <Ionicons
                            name="home-outline"
                            size={10}
                            color="rgba(255,255,255,0.7)"
                          />
                          <Text style={styles.chipText}>
                            {estate.total_properties}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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

  loader: {
    height: 238,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8a8a9a',
  },

  scroll: {
    paddingHorizontal: 16,
    gap: 13,
    paddingBottom: 4,
  },

  card: {
    width: 200,
    height: 238,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a2035',
  },
  img: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  badge: {
    position: 'absolute',
    top: 11,
    left: 11,
    backgroundColor: 'rgba(201,168,76,0.88)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  heart: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 13,
    paddingBottom: 15,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 19,
    marginBottom: 4,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 9,
  },
  loc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.48)',
    fontWeight: '300',
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f0d98a',
    lineHeight: 18,
  },
  chips: {
    flexDirection: 'row',
    gap: 5,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  chipText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
  },
});
