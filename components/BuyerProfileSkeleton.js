// ─────────────────────────────────────────────────────────────
//  BuyerProfileSkeleton.js
//
//  Drop-in skeleton for the BuyerProfile page.
//  Mirrors every section at pixel-accurate dimensions.
//
//  Usage in BuyerProfile (or its parent tab):
//
//    import BuyerProfileSkeleton from '@/components/BuyerProfileSkeleton';
//
//    if (loading) return <BuyerProfileSkeleton />;
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
import { colorWithAlpha } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const { width: SW } = Dimensions.get('window');

// ── Palette — matches BuyerProfile exactly ───────────────────
// ─────────────────────────────────────────────────────────────
//  useShimmer — pulsing backgroundColor
// ─────────────────────────────────────────────────────────────
function useShimmer(delay = 0) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, delay, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  return anim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      colorWithAlpha(colors.mutedText, 0.14),
      colorWithAlpha(colors.mutedText, 0.26),
    ],
  });
}

// ─────────────────────────────────────────────────────────────
//  Primitive shimmering block
// ─────────────────────────────────────────────────────────────
function Bone({ width, height, borderRadius = 8, style, delay = 0 }) {
  const bg = useShimmer(delay);
  return (
    <Animated.View style={[{ width, height, borderRadius, backgroundColor: bg }, style]} />
  );
}

// ─────────────────────────────────────────────────────────────
//  1. Header bar skeleton
//     message btn | "Profile" title | logout + settings btns
// ─────────────────────────────────────────────────────────────
function HeaderBarSkeleton() {
  return (
    <View style={sk.headerBar}>
      {/* Message button */}
      <Bone width={40} height={40} borderRadius={12} />

      {/* "Profile" title */}
      <Bone width={70} height={18} borderRadius={6} delay={40} />

      {/* Right: logout + settings */}
      <View style={sk.row}>
        <Bone width={40} height={40} borderRadius={12} delay={60} />
        <Bone width={40} height={40} borderRadius={12} delay={80} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  2. Avatar block skeleton
//     ring → name → member since → rating pill
// ─────────────────────────────────────────────────────────────
function AvatarBlockSkeleton() {
  return (
    <View style={sk.avatarBlock}>
      {/* Avatar ring */}
      <Bone width={88} height={88} borderRadius={44} delay={0} />

      {/* Name */}
      <Bone width={160} height={20} borderRadius={6} style={{ marginTop: 14 }} delay={40} />

      {/* Member since */}
      <Bone width={110} height={12} borderRadius={5} style={{ marginTop: 7 }} delay={60} />

      {/* Rating pill */}
      <Bone width={90} height={28} borderRadius={14} style={{ marginTop: 10 }} delay={80} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  3. Premium banner skeleton
//     Full-width card: icon + 2 text lines + button on right
// ─────────────────────────────────────────────────────────────
function PremiumBannerSkeleton() {
  return (
    <View style={[sk.ph, { marginBottom: 16 }]}>
      <View style={sk.premiumBanner}>
        {/* Left: icon + text stack */}
        <View style={sk.row}>
          <Bone width={30} height={30} borderRadius={8} delay={0} />
          <View style={{ marginLeft: 10, gap: 6 }}>
            <Bone width={120} height={13} borderRadius={5} delay={30} />
            <Bone width={180} height={11} borderRadius={5} delay={50} />
          </View>
        </View>
        {/* Right: button */}
        <Bone width={72} height={32} borderRadius={20} delay={70} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  4. Quick stats grid skeleton  (2 × 2)
//     Each card: icon square + num + label
// ─────────────────────────────────────────────────────────────
function StatsGridSkeleton() {
  const cardW = (SW - 32 - 10) / 2;   // matches "47.5%" + 16px padding each side + 10 gap

  return (
    <View style={sk.statsGrid}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[sk.statCard, { width: cardW }]}>
          {/* Icon box */}
          <Bone width={40} height={40} borderRadius={12} delay={i * 40} />
          <View style={{ gap: 5, marginLeft: 10 }}>
            {/* Number */}
            <Bone width={32} height={18} borderRadius={5} delay={i * 40 + 20} />
            {/* Label */}
            <Bone width={60} height={11} borderRadius={5} delay={i * 40 + 40} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  5. Saved properties section skeleton
//     Section header (title + "See all") + 3 wish cards
// ─────────────────────────────────────────────────────────────
function SavedSectionSkeleton() {
  return (
    <View style={[sk.ph, { marginBottom: 20 }]}>
      {/* Section header */}
      <View style={sk.sectionHeader}>
        <Bone width={140} height={15} borderRadius={5} />
        <Bone width={44} height={13} borderRadius={5} delay={30} />
      </View>

      {/* Wish cards */}
      {[0, 1, 2].map((i) => (
        <WishCardSkeleton key={i} delay={i * 80} />
      ))}
    </View>
  );
}

function WishCardSkeleton({ delay = 0 }) {
  return (
    <View style={sk.wishCard}>
      {/* Thumbnail */}
      <Bone width={60} height={60} borderRadius={10} delay={delay} />

      {/* Info: name, location, price */}
      <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
        <Bone width={'75%'} height={13} borderRadius={5} delay={delay + 20} />
        <Bone width={'50%'} height={11} borderRadius={5} delay={delay + 40} />
        <Bone width={90}    height={13} borderRadius={5} delay={delay + 60} />
      </View>

      {/* Heart icon */}
      <Bone width={20} height={20} borderRadius={10} delay={delay + 70} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  6. Become a seller card skeleton
//     Row: icon + 2 text lines | chevron
// ─────────────────────────────────────────────────────────────
function BecomeSellerSkeleton() {
  return (
    <View style={[sk.ph, { marginBottom: 40 }]}>
      <View style={sk.sellerCard}>
        {/* Left */}
        <View style={sk.row}>
          <Bone width={44} height={44} borderRadius={12} delay={0} />
          <View style={{ marginLeft: 12, gap: 7 }}>
            <Bone width={130} height={14} borderRadius={5} delay={30} />
            <Bone width={190} height={11} borderRadius={5} delay={50} />
          </View>
        </View>
        {/* Chevron */}
        <Bone width={20} height={20} borderRadius={5} delay={70} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  Root export — full BuyerProfile skeleton
// ─────────────────────────────────────────────────────────────
export default function BuyerProfileSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[sk.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <HeaderBarSkeleton />
        <AvatarBlockSkeleton />
        <PremiumBannerSkeleton />
        <StatsGridSkeleton />
        <SavedSectionSkeleton />
        <BecomeSellerSkeleton />
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
    backgroundColor: 'transparent',
    paddingTop: getStatusBarHeight(),
  },

  // shared
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ph: {
    paddingHorizontal: 16,
  },

  // ── Header bar ──────────────────────────────────────────────
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: 'transparent',
  },

  // ── Avatar block ─────────────────────────────────────────────
  avatarBlock: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
  },

  // ── Premium banner ───────────────────────────────────────────
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  // ── Stats grid ───────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'transparent',
  },

  // ── Saved section ────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  wishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: 'transparent',
  },

  // ── Become a seller ──────────────────────────────────────────
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
