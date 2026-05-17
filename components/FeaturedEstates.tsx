// ─────────────────────────────────────────────────────────────
// FeaturedEstates.tsx (UPDATED + PREMIUM + OPTIMIZED)
// ─────────────────────────────────────────────────────────────

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const fmt = (v?: string | number) =>
  v
    ? '₦' +
    Number(String(v).replace(/,/g, '')).toLocaleString('en-NG')
    : '—';

type Estate = {
  id?: string | number;
  name?: string;
  image_path?: string;

  sellPrice?: string | number;
  rentPrice?: string | number;

  listingType?: string;

  location?: string;
  city?: string;

  bedrooms?: string | number;
  total_properties?: string | number;
};

type Props = {
  estates?: Estate[];
};

function FeaturedEstates({
  estates = [],
}: Props) {
  const router = useRouter();

  const estateData = Array.isArray(estates)
    ? estates
    : [];

  return (
    <View style={styles.container}>
      {/* ── Header ───────────────────────── */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>
          Featured Estates
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.push(
              '/Home/Estates/AllEstates'
            )
          }
        >
          <Text style={styles.sectionLink}>
            View all →
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Empty State ─────────────────── */}
      {estateData.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons
            name="business-outline"
            size={42}
            color="rgba(255,255,255,0.18)"
          />

          <Text style={styles.emptyTitle}>
            No Estates Available
          </Text>

          <Text style={styles.emptySub}>
            Featured estates will appear here
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {estateData.map((estate, index) => {
            const price = estate.sellPrice
              ? fmt(estate.sellPrice)
              : estate.rentPrice
                ? `${fmt(
                  estate.rentPrice
                )}/yr`
                : null;

            const tag =
              estate.listingType === 'Both'
                ? 'Sell & Rent'
                : estate.listingType ||
                'Estate';

            return (
              <TouchableOpacity
                key={
                  estate.id?.toString() ||
                  index.toString()
                }
                activeOpacity={0.92}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname:
                      '/Home/EstateCompanyDetails',
                    params: {
                      id: String(estate.id),
                    },
                  })
                }
              >
                {/* ── Background Image ── */}
                <Image
                  source={{
                    uri:
                      estate.image_path ||
                      'https://via.placeholder.com/400x300.png',
                  }}
                  style={styles.image}
                  resizeMode="cover"
                />

                {/* ── Overlay ── */}
                <LinearGradient
                  colors={[
                    'rgba(0,0,0,0)',
                    'rgba(0,0,0,0.25)',
                    'rgba(5,10,25,0.96)',
                  ]}
                  locations={[0.25, 0.55, 1]}
                  style={StyleSheet.absoluteFill}
                />

                {/* ── Badge ── */}
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {tag}
                  </Text>
                </View>

                {/* ── Favorite Button ── */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.heart}
                >
                  <Ionicons
                    name="heart-outline"
                    size={15}
                    color="#fff"
                  />
                </TouchableOpacity>

                {/* ── Content ── */}
                <View style={styles.body}>
                  <Text
                    numberOfLines={1}
                    style={styles.name}
                  >
                    {estate.name ||
                      'Luxury Estate'}
                  </Text>

                  {/* Location */}
                  <View style={styles.locRow}>
                    <Ionicons
                      name="location-outline"
                      size={12}
                      color="rgba(255,255,255,0.60)"
                    />

                    <Text
                      numberOfLines={1}
                      style={styles.loc}
                    >
                      {estate.location ||
                        estate.city ||
                        'Nigeria'}
                    </Text>
                  </View>

                  {/* Bottom */}
                  <View style={styles.bottom}>
                    <View>
                      <Text style={styles.price}>
                        {price || 'Contact'}
                      </Text>
                    </View>

                    <View style={styles.chips}>
                      {estate.bedrooms ? (
                        <View style={styles.chip}>
                          <MaterialCommunityIcons
                            name="bed-outline"
                            size={10}
                            color="#fff"
                          />

                          <Text
                            style={
                              styles.chipText
                            }
                          >
                            {estate.bedrooms}bd
                          </Text>
                        </View>
                      ) : null}

                      {estate.total_properties ? (
                        <View style={styles.chip}>
                          <Ionicons
                            name="home-outline"
                            size={10}
                            color="#fff"
                          />

                          <Text
                            style={
                              styles.chipText
                            }
                          >
                            {
                              estate.total_properties
                            }
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

export default memo(FeaturedEstates);

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },

  sectionHead: {
    paddingHorizontal: 18,
    paddingBottom: 14,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.4,
    marginVertical: 10,
  },

  sectionLink: {
    fontSize: 13,
    color: '#c9a84c',
    fontWeight: '600',
  },

  scroll: {
    paddingLeft: 16,
    paddingRight: 6,
    paddingBottom: 4,
  },

  card: {
    width: 215,
    height: 255,

    marginRight: 14,

    borderRadius: 24,
    overflow: 'hidden',

    backgroundColor: '#192338',
  },

  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  badge: {
    position: 'absolute',
    top: 14,
    left: 14,

    backgroundColor: 'rgba(201,168,76,0.92)',

    paddingHorizontal: 10,
    paddingVertical: 5,

    borderRadius: 9,
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  heart: {
    position: 'absolute',
    top: 14,
    right: 14,

    width: 30,
    height: 30,
    borderRadius: 15,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      'rgba(255,255,255,0.18)',

    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.16)',
  },

  body: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,

    padding: 15,
  },

  name: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },

  locRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 12,
  },

  loc: {
    marginLeft: 4,

    color: 'rgba(255,255,255,0.70)',
    fontSize: 11,
    fontWeight: '400',

    flex: 1,
  },

  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  price: {
    color: '#f0d98a',
    fontSize: 18,
    fontWeight: '700',
  },

  chips: {
    flexDirection: 'row',
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor:
      'rgba(255,255,255,0.14)',

    borderRadius: 8,

    paddingHorizontal: 7,
    paddingVertical: 4,

    marginLeft: 5,
  },

  chipText: {
    marginLeft: 3,

    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },

  emptyWrap: {
    height: 240,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: 12,

    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  emptySub: {
    marginTop: 5,

    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
  },
});