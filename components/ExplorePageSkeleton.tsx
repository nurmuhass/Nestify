
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const { width: SW } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────────────────────
const BG = '#091530';
const CARD = '#0f2044';
const BASE = '#162650';
const SHINE = '#29467f';
const BORDER = 'rgba(255,255,255,0.06)';

// ─────────────────────────────────────────────────────────────
// SHIMMER BLOCK
// ─────────────────────────────────────────────────────────────
function ShimmerBlock({
  width,
  height,
  borderRadius = 8,
  style,
  delay = 0,
}: any) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1100,
          delay,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: false,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, []);

  const bg = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [BASE, SHINE],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: bg,
        },
        style,
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <LinearGradient
      colors={['#0b1733', '#091530', '#091530']}
      style={styles.hero}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <ShimmerBlock width={42} height={42} borderRadius={21} />
        <ShimmerBlock width={42} height={42} borderRadius={21} delay={60} />
      </View>

      {/* Text */}
      <ShimmerBlock
        width={120}
        height={12}
        borderRadius={6}
        style={{ marginTop: 24 }}
      />

      <ShimmerBlock
        width={SW * 0.7}
        height={30}
        borderRadius={8}
        style={{ marginTop: 12 }}
        delay={40}
      />

      <ShimmerBlock
        width={SW - 32}
        height={12}
        borderRadius={6}
        style={{ marginTop: 14 }}
        delay={70}
      />

      <ShimmerBlock
        width={SW * 0.72}
        height={12}
        borderRadius={6}
        style={{ marginTop: 8 }}
        delay={100}
      />

      {/* Search */}
      <ShimmerBlock
        width={SW - 32}
        height={54}
        borderRadius={18}
        style={{ marginTop: 22 }}
        delay={120}
      />

      {/* Stats */}
      <View style={styles.statsRow}>
        {[0, 1, 2].map((i) => (
          <ShimmerBlock
            key={i}
            width={(SW - 32 - 20) / 3}
            height={72}
            borderRadius={18}
            delay={140 + i * 50}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────────────────────────
// FILTER CHIPS
// ─────────────────────────────────────────────────────────────
function FilterSkeleton() {
  const widths = [54, 90, 94, 92, 86];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
    >
      {widths.map((w, i) => (
        <ShimmerBlock
          key={i}
          width={w}
          height={40}
          borderRadius={22}
          delay={i * 30}
        />
      ))}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// CATEGORY CHIPS
// ─────────────────────────────────────────────────────────────
function CategorySkeleton() {
  const widths = [40, 70, 90, 100, 80, 110];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryRow}
    >
      {widths.map((w, i) => (
        <ShimmerBlock
          key={i}
          width={w}
          height={34}
          borderRadius={18}
          delay={i * 30}
        />
      ))}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// FEATURED SECTION
// ─────────────────────────────────────────────────────────────
function FeaturedSectionSkeleton() {
  return (
    <View>
      <View style={styles.sectionHead}>
        <View>
          <ShimmerBlock width={170} height={22} borderRadius={6} />
          <ShimmerBlock
            width={220}
            height={12}
            borderRadius={5}
            style={{ marginTop: 8 }}
            delay={50}
          />
        </View>

        <ShimmerBlock width={90} height={14} borderRadius={5} delay={70} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredRow}
      >
        {[0, 1, 2].map((i) => (
          <FeaturedCardSkeleton key={i} delay={i * 70} />
        ))}
      </ScrollView>
    </View>
  );
}

function FeaturedCardSkeleton({ delay = 0 }: any) {
  const cardW = SW * 0.74;

  return (
    <View style={[styles.featuredCard, { width: cardW }]}>
      <ShimmerBlock
        width={cardW}
        height={210}
        borderRadius={0}
        delay={delay}
      />

      <ShimmerBlock
        width={90}
        height={28}
        borderRadius={16}
        style={styles.featuredBadge}
        delay={delay + 40}
      />

      <View style={styles.featuredContent}>
        <ShimmerBlock
          width={cardW * 0.65}
          height={16}
          borderRadius={5}
          delay={delay + 60}
        />

        <ShimmerBlock
          width={cardW * 0.45}
          height={12}
          borderRadius={5}
          style={{ marginTop: 8 }}
          delay={delay + 80}
        />

        <ShimmerBlock
          width={120}
          height={18}
          borderRadius={5}
          style={{ marginTop: 10 }}
          delay={delay + 100}
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// FEED HEADER
// ─────────────────────────────────────────────────────────────
function FeedHeaderSkeleton() {
  return (
    <View style={styles.feedHead}>
      <ShimmerBlock width={200} height={22} borderRadius={7} />

      <ShimmerBlock
        width={SW * 0.6}
        height={13}
        borderRadius={5}
        style={{ marginTop: 10 }}
        delay={50}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// FEED CARD
// ─────────────────────────────────────────────────────────────
function FeedCardSkeleton({ delay = 0 }: any) {
  const cardW = SW - 32;

  return (
    <View style={styles.card}>
      {/* IMAGE */}
      <ShimmerBlock
        width={cardW}
        height={240}
        borderRadius={0}
        delay={delay}
      />

      {/* TOP BADGES */}
      <View style={styles.cardTopRow}>
        <ShimmerBlock
          width={90}
          height={30}
          borderRadius={15}
          delay={delay + 40}
        />

        <ShimmerBlock
          width={40}
          height={40}
          borderRadius={20}
          delay={delay + 60}
        />
      </View>

      {/* RANK PILL */}
      <ShimmerBlock
        width={78}
        height={28}
        borderRadius={14}
        style={styles.rankPill}
        delay={delay + 80}
      />

      {/* INFO */}
      <View style={styles.cardInfo}>
        <ShimmerBlock
          width={cardW * 0.65}
          height={18}
          borderRadius={6}
          delay={delay + 100}
        />

        <ShimmerBlock
          width={150}
          height={13}
          borderRadius={5}
          style={{ marginTop: 12 }}
          delay={delay + 120}
        />

        <ShimmerBlock
          width={170}
          height={28}
          borderRadius={7}
          style={{ marginTop: 16 }}
          delay={delay + 140}
        />

        <View style={styles.metaRow}>
          <ShimmerBlock
            width={64}
            height={32}
            borderRadius={16}
            delay={delay + 160}
          />

          <ShimmerBlock
            width={64}
            height={32}
            borderRadius={16}
            delay={delay + 180}
          />

          <ShimmerBlock
            width={90}
            height={32}
            borderRadius={16}
            delay={delay + 200}
          />
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────
export default function ExplorePageSkeleton() {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        <HeroSkeleton />

        <FilterSkeleton />

        <CategorySkeleton />

        <FeaturedSectionSkeleton />

        <FeedHeaderSkeleton />

        <FeedCardSkeleton delay={0} />
        <FeedCardSkeleton delay={120} />
        <FeedCardSkeleton delay={240} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  hero: {
    paddingTop: getStatusBarHeight() + 16,
    paddingHorizontal: 16,
    paddingBottom: 22,
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
    marginTop: 18,
  },

  filterRow: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
    gap: 10,
  },

  categoryRow: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    gap: 8,
  },

  sectionHead: {
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  featuredRow: {
    paddingLeft: 16,
    paddingRight: 8,
    gap: 14,
    paddingBottom: 20,
  },

  featuredCard: {
    height: 210,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
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

  feedHead: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
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
    top: 198,
  },

  cardInfo: {
    padding: 16,
  },

  metaRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
});