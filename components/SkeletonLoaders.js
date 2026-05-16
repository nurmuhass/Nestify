// ─────────────────────────────────────────────────────────────
//  SkeletonLoaders.js
//  Drop-in skeleton placeholders for every HomeScreen section.
//  Usage: each component exposes an `isLoading` prop; pass true
//  while data is being fetched, false once ready.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Palette (matches your dark navy theme) ───────────────────
const BASE  = '#1a2e52';   // skeleton block base color
const SHINE = '#243d6b';   // shimmer highlight color
const BG    = '#0f2044';   // screen background

// ─────────────────────────────────────────────────────────────
//  Core shimmer hook
//  Returns an interpolated background color that pulses BASE→SHINE
// ─────────────────────────────────────────────────────────────
function useShimmer() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    ).start();
  }, [anim]);

  const backgroundColor = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: [BASE, SHINE],
  });

  return backgroundColor;
}

// ─────────────────────────────────────────────────────────────
//  Primitive: a single shimmer block
// ─────────────────────────────────────────────────────────────
function SkeletonBlock({ width, height, borderRadius = 8, style }) {
  const backgroundColor = useShimmer();
  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor }, style]}
    />
  );
}

// ─────────────────────────────────────────────────────────────
//  1. HomeHeader skeleton
//     Mirrors: location pill, greeting text, 3 stat cards, avatar
// ─────────────────────────────────────────────────────────────
export function HomeHeaderSkeleton() {
  return (
    <View style={s.headerContainer}>
      {/* Location pill + avatar row */}
      <View style={s.row}>
        <SkeletonBlock width={110} height={30} borderRadius={20} />
        <SkeletonBlock width={40}  height={40} borderRadius={20} />
      </View>

      {/* Greeting lines */}
      <SkeletonBlock width={140} height={14} style={{ marginTop: 20 }} />
      <SkeletonBlock width={200} height={28} style={{ marginTop: 8 }} />
      <SkeletonBlock width={160} height={14} style={{ marginTop: 8 }} />

      {/* Stat cards */}
      <View style={[s.row, { marginTop: 20, gap: 12 }]}>
        {[1, 2, 3].map(k => (
          <SkeletonBlock key={k} width={(SCREEN_W - 48 - 24) / 3} height={60} borderRadius={12} />
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  2. SearchBar skeleton
// ─────────────────────────────────────────────────────────────
export function SearchBarSkeleton() {
  return (
    <View style={s.searchContainer}>
      <SkeletonBlock width={SCREEN_W - 32} height={50} borderRadius={14} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  3. PromoSlider skeleton
//     Mirrors: one large banner card with partial second card peeking
// ─────────────────────────────────────────────────────────────
export function PromoSliderSkeleton() {
  return (
    <View style={s.promoContainer}>
      <View style={s.row}>
        <SkeletonBlock width={SCREEN_W - 56} height={160} borderRadius={16} />
        <SkeletonBlock width={40}            height={160} borderRadius={16} style={{ marginLeft: 12 }} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  4. TopLocations skeleton
//     Mirrors: section title + row of pill chips
// ─────────────────────────────────────────────────────────────
export function TopLocationsSkeleton() {
  return (
    <View style={s.sectionContainer}>
      <SkeletonBlock width={140} height={20} style={{ marginBottom: 14 }} />
      <View style={[s.row, { gap: 10 }]}>
        {[120, 100, 90, 110].map((w, i) => (
          <SkeletonBlock key={i} width={w} height={44} borderRadius={22} />
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  5. FeaturedEstates skeleton
//     Mirrors: section title + 2 horizontal cards
// ─────────────────────────────────────────────────────────────
export function FeaturedEstatesSkeleton() {
  return (
    <View style={s.sectionContainer}>
      <View style={[s.rowBetween, { marginBottom: 14 }]}>
        <SkeletonBlock width={160} height={20} />
        <SkeletonBlock width={60}  height={16} />
      </View>
      <View style={[s.row, { gap: 12 }]}>
        {[1, 2].map(k => (
          <View key={k}>
            <SkeletonBlock width={(SCREEN_W - 44) / 2} height={140} borderRadius={14} />
            <SkeletonBlock width={120} height={14} style={{ marginTop: 8 }} />
            <SkeletonBlock width={80}  height={12} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  6. FeaturedCompanies / TopCompanies skeleton
//     Mirrors: section title + horizontal partner cards
// ─────────────────────────────────────────────────────────────
export function FeaturedCompaniesSkeleton() {
  return (
    <View style={s.sectionContainer}>
      <View style={[s.rowBetween, { marginBottom: 14 }]}>
        <SkeletonBlock width={180} height={20} />
        <SkeletonBlock width={60}  height={16} />
      </View>
      <View style={[s.row, { gap: 12 }]}>
        {[1, 2].map(k => (
          <View key={k} style={{ width: SCREEN_W - 56 }}>
            <SkeletonBlock width={SCREEN_W - 56} height={150} borderRadius={14} />
            {/* Avatar overlap */}
            <SkeletonBlock width={50} height={50} borderRadius={10} style={{ marginTop: -20, marginLeft: 12 }} />
            <SkeletonBlock width={160} height={16} style={{ marginTop: 10 }} />
            <SkeletonBlock width={100} height={13} style={{ marginTop: 6 }} />
            <View style={[s.row, { marginTop: 12, gap: 24 }]}>
              {['Listings', 'Rating', 'Reviews'].map(label => (
                <View key={label}>
                  <SkeletonBlock width={30} height={16} />
                  <SkeletonBlock width={50} height={12} style={{ marginTop: 4 }} />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  7. TrendingProperties skeleton
//     Mirrors: section title + one large featured card
// ─────────────────────────────────────────────────────────────
export function TrendingPropertiesSkeleton() {
  return (
    <View style={s.sectionContainer}>
      <View style={[s.rowBetween, { marginBottom: 14 }]}>
        <SkeletonBlock width={170} height={20} />
        <SkeletonBlock width={60}  height={16} />
      </View>
      {/* Large card */}
      <SkeletonBlock width={SCREEN_W - 32} height={240} borderRadius={16} />
      <SkeletonBlock width={100} height={16} style={{ marginTop: 14 }} />
      <SkeletonBlock width={200} height={13} style={{ marginTop: 8 }} />
      <SkeletonBlock width={120} height={22} style={{ marginTop: 8 }} />
      {/* Views / likes / boost row */}
      <View style={[s.row, { marginTop: 12, gap: 12 }]}>
        <SkeletonBlock width={60}  height={32} borderRadius={16} />
        <SkeletonBlock width={60}  height={32} borderRadius={16} />
        <SkeletonBlock width={100} height={32} borderRadius={16} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  8. NearbyProperties skeleton
//     Mirrors: section title + filter pills + 2-column card grid
// ─────────────────────────────────────────────────────────────
export function NearbyPropertiesSkeleton({ rows = 2 }) {
  return (
    <View style={s.sectionContainer}>
      {/* Title row */}
      <View style={[s.rowBetween, { marginBottom: 14 }]}>
        <SkeletonBlock width={170} height={20} />
        <SkeletonBlock width={60}  height={16} />
      </View>

      {/* Filter pills (All / For Rent / For Sell) */}
      <View style={[s.row, { gap: 10, marginBottom: 14 }]}>
        {[55, 90, 90].map((w, i) => (
          <SkeletonBlock key={i} width={w} height={36} borderRadius={18} />
        ))}
      </View>

      {/* Category chips (All / Apartment Flat / Bungalow / …) */}
      <View style={[s.row, { gap: 10, marginBottom: 18 }]}>
        {[40, 130, 90, 110].map((w, i) => (
          <SkeletonBlock key={i} width={w} height={28} borderRadius={14} />
        ))}
      </View>

      {/* 2-column grid */}
      {Array.from({ length: rows }).map((_, row) => (
        <View key={row} style={[s.row, { gap: 12, marginBottom: 16 }]}>
          {[0, 1].map(col => {
            const cardW = (SCREEN_W - 44) / 2;
            return (
              <View key={col}>
                <SkeletonBlock width={cardW} height={140} borderRadius={14} />
                {/* Price badge */}
                <SkeletonBlock width={110} height={26} borderRadius={13} style={{ marginTop: -13, marginLeft: 8 }} />
                <SkeletonBlock width={130} height={15} style={{ marginTop: 14 }} />
                <View style={[s.row, { marginTop: 8, gap: 8 }]}>
                  <SkeletonBlock width={70}  height={22} borderRadius={11} />
                  <SkeletonBlock width={60}  height={14} />
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  9. Full-page HomeScreen skeleton
//     Compose all of the above in the right order.
//     Use this in HomeScreen when NONE of the data has loaded yet.
// ─────────────────────────────────────────────────────────────
export function HomeScreenSkeleton() {
  return (
    <View style={{ backgroundColor: BG, flex: 1 }}>
      <HomeHeaderSkeleton />
      <SearchBarSkeleton />
      <PromoSliderSkeleton />
      <TopLocationsSkeleton />
      <FeaturedEstatesSkeleton />
      <FeaturedCompaniesSkeleton />
      <TrendingPropertiesSkeleton />
      <NearbyPropertiesSkeleton rows={2} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  Shared styles
// ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  promoContainer: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
});