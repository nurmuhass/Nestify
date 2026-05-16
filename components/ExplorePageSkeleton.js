// ─────────────────────────────────────────────────────────────
//  ExplorePageSkeleton.js
//
//  Drop-in skeleton that mirrors the ExplorePage layout exactly.

//
//  Usage in ExplorePage:

//
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SW } = Dimensions.get('window');

// ── Palette — matches ExplorePage exactly ────────────────────
const BG         = '#091530';
const CARD       = '#0f2044';
const BASE       = '#162650';   // shimmer base
const SHINE      = '#1f3570';   // shimmer highlight
const BORDER     = 'rgba(255,255,255,0.06)';

// ─────────────────────────────────────────────────────────────
//  useShimmer — returns an Animated backgroundColor that pulses
// ─────────────────────────────────────────────────────────────
function useShimmer(delay = 0) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 950,
          delay,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 950,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  return anim.interpolate({
    inputRange:  [0, 1],
    outputRange: [BASE, SHINE],
  });
}

// ─────────────────────────────────────────────────────────────
//  Primitive block — single shimmering rectangle
// ─────────────────────────────────────────────────────────────
function Bone({ width, height, borderRadius = 8, style, delay = 0 }) {
  const bg = useShimmer(delay);
  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: bg },
        style,
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────
//  1.  Hero section skeleton
//      Mirrors: back button + filter icon, kicker, title, subtitle,
//               search bar, 3 stat cards
// ─────────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <LinearGradient
      colors={['#0b1733', '#091530', '#091530']}
      style={sk.hero}
    >
      {/* Header row: back btn ←→ filter btn */}
      <View style={sk.headerRow}>
        <Bone width={42} height={42} borderRadius={21} />
        <Bone width={42} height={42} borderRadius={21} />
      </View>

      {/* Kicker */}
      <Bone width={110} height={12} borderRadius={6} style={{ marginTop: 24 }} delay={60} />

      {/* Title */}
      <Bone width={SW * 0.72} height={28} borderRadius={8} style={{ marginTop: 10 }} delay={80} />

      {/* Subtitle — 2 lines */}
      <Bone width={SW - 32} height={12} borderRadius={6} style={{ marginTop: 10 }} delay={100} />
      <Bone width={(SW - 32) * 0.7} height={12} borderRadius={6} style={{ marginTop: 6 }} delay={120} />

      {/* Search bar */}
      <Bone
        width={SW - 32}
        height={50}
        borderRadius={18}
        style={{ marginTop: 20 }}
        delay={140}
      />

      {/* Stat cards row */}
      <View style={sk.statsRow}>
        {[0, 1, 2].map((i) => (
          <Bone
            key={i}
            width={(SW - 32 - 20) / 3}
            height={68}
            borderRadius={18}
            delay={160 + i * 40}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────────────────────────
//  2.  Filter chips skeleton  (All / Premium / Featured / …)
// ─────────────────────────────────────────────────────────────
function FilterChipsSkeleton() {
  const widths = [44, 88, 90, 82, 80];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={sk.filterRow}
      scrollEnabled={false}
    >
      {widths.map((w, i) => (
        <Bone key={i} width={w} height={38} borderRadius={22} delay={i * 30} />
      ))}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
//  3.  Category chips skeleton
// ─────────────────────────────────────────────────────────────
function CategoryChipsSkeleton() {
  const widths = [36, 72, 100, 86, 96, 70];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={sk.categoryRow}
      scrollEnabled={false}
    >
      {widths.map((w, i) => (
        <Bone key={i} width={w} height={32} borderRadius={18} delay={i * 25} />
      ))}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
//  4.  "Featured for you" section skeleton
//      Mirrors: section header row + horizontal featured cards
// ─────────────────────────────────────────────────────────────
function FeaturedSectionSkeleton() {
  return (
    <View style={{ marginTop: 10 }}>
      {/* Section header */}
      <View style={sk.sectionHead}>
        <View>
          <Bone width={160} height={20} borderRadius={6} />
          <Bone width={220} height={13} borderRadius={5} style={{ marginTop: 6 }} delay={40} />
        </View>
        <Bone width={88} height={14} borderRadius={6} delay={60} />
      </View>

      {/* Horizontal featured cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={sk.featuredRow}
        scrollEnabled={false}
      >
        {[0, 1, 2].map((i) => (
          <FeaturedCardSkeleton key={i} delay={i * 80} />
        ))}
      </ScrollView>
    </View>
  );
}

function FeaturedCardSkeleton({ delay = 0 }) {
  const cardW = SW * 0.74;
  return (
    <View style={[sk.featuredCard, { width: cardW }]}>
      {/* Image area */}
      <Bone width={cardW} height={200} borderRadius={0} delay={delay} />

      {/* Badge overlay (top-left) */}
      <Bone
        width={88}
        height={26}
        borderRadius={13}
        style={sk.featuredBadge}
        delay={delay + 40}
      />

      {/* Content overlay (bottom) */}
      <View style={sk.featuredContent}>
        <Bone width={cardW * 0.65} height={16} borderRadius={5} delay={delay + 60} />
        <Bone width={cardW * 0.45} height={12} borderRadius={5} style={{ marginTop: 6 }} delay={delay + 80} />
        <Bone width={120} height={18} borderRadius={5} style={{ marginTop: 8 }} delay={delay + 100} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  5.  "Marketplace feed" header skeleton
// ─────────────────────────────────────────────────────────────
function FeedHeaderSkeleton() {
  return (
    <View style={sk.feedHead}>
      <Bone width={190} height={22} borderRadius={7} />
      <Bone width={SW * 0.65} height={13} borderRadius={5} style={{ marginTop: 8 }} delay={40} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  6.  Feed card skeleton
//      Mirrors: tall image (230px) + info block below
// ─────────────────────────────────────────────────────────────
function FeedCardSkeleton({ delay = 0 }) {
  const cardW = SW - 32;
  return (
    <View style={sk.card}>
      {/* Image */}
      <Bone width={cardW} height={230} borderRadius={0} delay={delay} />

      {/* Badges overlay top-left */}
      <View style={sk.cardTopRow}>
        <Bone width={88} height={28} borderRadius={14} delay={delay + 30} />
        {/* Heart button top-right */}
        <Bone width={36} height={36} borderRadius={18} delay={delay + 40} />
      </View>

      {/* Rank pill bottom-left */}
      <Bone
        width={74}
        height={26}
        borderRadius={13}
        style={sk.rankPill}
        delay={delay + 50}
      />

      {/* Card info */}
      <View style={sk.cardInfo}>
        {/* Property name */}
        <Bone width={cardW * 0.62} height={18} borderRadius={6} delay={delay + 60} />

        {/* Location */}
        <Bone width={140} height={13} borderRadius={5} style={{ marginTop: 10 }} delay={delay + 80} />

        {/* Price */}
        <Bone width={160} height={26} borderRadius={7} style={{ marginTop: 14 }} delay={delay + 100} />

        {/* Meta row: views pill, likes pill, (boost pill) */}
        <View style={sk.metaRow}>
          <Bone width={60} height={30} borderRadius={15} delay={delay + 110} />
          <Bone width={60} height={30} borderRadius={15} delay={delay + 130} />
          <Bone width={88} height={30} borderRadius={15} delay={delay + 150} />
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  Root export — full-page skeleton
// ─────────────────────────────────────────────────────────────
export default function ExplorePageSkeleton() {
  return (
    <View style={sk.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}          // purely visual — no interaction needed
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* 1. Hero */}
        <HeroSkeleton />

        {/* 2. Filter chips */}
        <FilterChipsSkeleton />

        {/* 3. Category chips */}
        <CategoryChipsSkeleton />

        {/* 4. Featured section */}
        <FeaturedSectionSkeleton />

        {/* 5. Feed header */}
        <FeedHeaderSkeleton />

        {/* 6. Feed cards — show 2 full + partial third */}
        <FeedCardSkeleton delay={0} />
        <FeedCardSkeleton delay={120} />
        <FeedCardSkeleton delay={240} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────────────────────
const sk = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // ── Hero ──────────────────────────────────────────────────
  hero: {
    paddingTop: getStatusBarHeight() + 10,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  // ── Chips ─────────────────────────────────────────────────
  filterRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  categoryRow: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },

  // ── Featured section ──────────────────────────────────────
  sectionHead: {
    paddingHorizontal: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  featuredRow: {
    paddingLeft: 16,
    paddingRight: 8,
    gap: 14,
    paddingBottom: 18,
  },
  featuredCard: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
  },
  featuredBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  featuredContent: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
  },

  // ── Feed header ───────────────────────────────────────────
  feedHead: {
    paddingHorizontal: 16,
    marginBottom: 14,
    marginTop: 6,
  },

  // ── Feed card ─────────────────────────────────────────────
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
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
  rankPill: {
    position: 'absolute',
    left: 14,
    top: 188,                  // 230px image height − 28px pill − 14px gap
  },
  cardInfo: {
    padding: 16,
  },
  metaRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
});