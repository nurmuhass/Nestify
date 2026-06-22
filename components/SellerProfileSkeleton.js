// ─────────────────────────────────────────────────────────────
//  SellerProfileSkeleton.js
//
//  Drop-in skeleton for the SellerProfile page.
//  Mirrors every section at pixel-accurate dimensions.
//
//  Usage:
//    import SellerProfileSkeleton from '@/components/SellerProfileSkeleton';
//
//    // At the top of SellerProfile render, before the main return:
//    if (loading) return <SellerProfileSkeleton />;
//
//    // Or gate it in the parent tab that mounts SellerProfile:
//    if (!user) return <SellerProfileSkeleton />;
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

// ── Palette — matches SellerProfile exactly ──────────────────
// ─────────────────────────────────────────────────────────────
//  useShimmer — pulsing backgroundColor with optional delay
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
//  1. Hero section skeleton  (height: 220)
//     Cover image bg + top bar (msg btn | premium pill + logout + settings)
//     + floating avatar (bottom: -19, left: 20)
// ─────────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <View style={sk.hero}>
      {/* Cover image placeholder — fills the hero */}
      <Bone width={SW} height={220} borderRadius={0} delay={0} />

      {/* Top bar overlay */}
      <View style={sk.heroTopBar}>
        {/* Message btn */}
        <Bone width={38} height={38} borderRadius={12} delay={30} />

        {/* Right: premium pill + logout icon + settings btn */}
        <View style={sk.row}>
          <Bone width={80} height={28} borderRadius={20} delay={50} />
          <Bone width={22} height={22} borderRadius={5} style={{ marginLeft: 8 }} delay={60} />
          <Bone width={38} height={38} borderRadius={12} style={{ marginLeft: 8 }} delay={70} />
        </View>
      </View>

      {/* Floating avatar (sits at bottom:-19 left:20 of hero) */}
      <View style={sk.heroAvatarWrap}>
        {/* Avatar square with gold border */}
        <Bone width={72} height={72} borderRadius={20} delay={80} />
        {/* Verified dot */}
        <View style={sk.verifiedDot}>
          <Bone width={20} height={20} borderRadius={10} delay={90} />
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  2. Identity section skeleton
//     paddingTop:44 to clear the floating avatar
//     name → location sub → stats row → CTA row → premium banner
// ─────────────────────────────────────────────────────────────
function IdentitySkeleton() {
  return (
    <View style={sk.identity}>
      {/* Company name */}
      <Bone width={200} height={22} borderRadius={7} delay={0} />

      {/* Location sub-row */}
      <View style={[sk.row, { marginTop: 7, gap: 4 }]}>
        <Bone width={12} height={12} borderRadius={6} delay={20} />
        <Bone width={180} height={12} borderRadius={5} delay={30} />
      </View>

      {/* Stats card */}
      <StatsSkeleton />

      {/* CTA row */}
      <CtaRowSkeleton />

      {/* Premium banner */}
      <PremiumBannerSkeleton />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  3. Stats row skeleton
//     4 stat items separated by dividers inside a dark card
// ─────────────────────────────────────────────────────────────
function StatsSkeleton() {
  return (
    <View style={sk.statsCard}>
      {[0, 1, 2, 3].map((i) => (
        <React.Fragment key={i}>
          <View style={sk.statItem}>
            <Bone width={32} height={18} borderRadius={5} delay={i * 30} />
            <Bone width={52} height={10} borderRadius={4} style={{ marginTop: 5 }} delay={i * 30 + 15} />
          </View>
          {i < 3 && <View style={sk.statDivider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  4. CTA row skeleton
//     [Add Property btn] [Edit Profile btn] [icon square]
// ─────────────────────────────────────────────────────────────
function CtaRowSkeleton() {
  return (
    <View style={sk.ctaRow}>
      {/* Primary button — flex:1 */}
      <Bone
        width={(SW - 40 - 8 - 8 - 46) / 2}
        height={46}
        borderRadius={14}
        delay={0}
      />
      {/* Secondary button — flex:1 */}
      <Bone
        width={(SW - 40 - 8 - 8 - 46) / 2}
        height={46}
        borderRadius={14}
        delay={30}
        style={{ marginLeft: 8 }}
      />
      {/* Icon square */}
      <Bone width={46} height={46} borderRadius={14} delay={50} style={{ marginLeft: 8 }} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  5. Premium banner skeleton
// ─────────────────────────────────────────────────────────────
function PremiumBannerSkeleton() {
  return (
    <View style={sk.premiumBanner}>
      {/* Left: icon + text stack */}
      <View style={sk.row}>
        <Bone width={28} height={28} borderRadius={7} delay={0} />
        <View style={{ marginLeft: 10, gap: 6 }}>
          <Bone width={110} height={13} borderRadius={5} delay={20} />
          <Bone width={175} height={11} borderRadius={5} delay={40} />
        </View>
      </View>
      {/* Right: upgrade button */}
      <Bone width={70} height={32} borderRadius={20} delay={60} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  6. Tabs skeleton
//     Horizontal row of 4 tab pills
// ─────────────────────────────────────────────────────────────
function TabsSkeleton() {
  const tabWidths = [90, 76, 72, 64];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={sk.tabRow}
      scrollEnabled={false}
    >
      {tabWidths.map((w, i) => (
        <Bone key={i} width={w} height={36} borderRadius={8} delay={i * 30} />
      ))}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
//  7. Property grid skeleton  (2-column, matches propGrid)
//     Each card: image (100px) + body (name + price + meta)
// ─────────────────────────────────────────────────────────────
function PropGridSkeleton() {
  const cardW = (SW - 32 - 10) / 2;   // 47.5% equivalent with 16px padding + 10 gap

  return (
    <View style={sk.propGrid}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[sk.propCard, { width: cardW }]}>
          {/* Image */}
          <Bone width={cardW} height={100} borderRadius={0} delay={i * 40} />

          {/* Status pill — top right overlay */}
          <View style={sk.propStatusWrap}>
            <Bone width={52} height={20} borderRadius={10} delay={i * 40 + 20} />
          </View>

          {/* Body */}
          <View style={sk.propBody}>
            <Bone width={cardW * 0.7}  height={12} borderRadius={5} delay={i * 40 + 30} />
            <Bone width={80}           height={12} borderRadius={5} style={{ marginTop: 5 }} delay={i * 40 + 45} />
            <View style={[sk.row, { justifyContent: 'space-between', marginTop: 6 }]}>
              <Bone width={55} height={10} borderRadius={4} delay={i * 40 + 55} />
              <Bone width={45} height={10} borderRadius={4} delay={i * 40 + 65} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  Root export — full SellerProfile skeleton
// ─────────────────────────────────────────────────────────────
export default function SellerProfileSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[sk.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 1. Hero with cover + floating avatar */}
        <HeroSkeleton />

        {/* 2. Identity: name, location, stats, CTAs, premium banner */}
        <IdentitySkeleton />

        {/* 3. Tabs */}
        <TabsSkeleton />

        {/* 4. Tab content — default is Properties grid */}
        <PropGridSkeleton />
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

  // ── Hero ──────────────────────────────────────────────────
  hero: {
    height: 220,
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'visible',           // avatar floats below hero boundary
  },
  heroTopBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroAvatarWrap: {
    position: 'absolute',
    bottom: -19,                   // matches sellerHero heroBottom
    left: 20,
    zIndex: 9000,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 1,
    zIndex: 2000,
  },

  // ── Identity ──────────────────────────────────────────────
  identity: {
    paddingTop: 44,                // clears the 72px avatar (bottom:-19 + padding)
    paddingHorizontal: 20,
    paddingBottom: 4,
  },

  // ── Stats card ────────────────────────────────────────────
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'transparent',
  },

  // ── CTA row ───────────────────────────────────────────────
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },

  // ── Premium banner ────────────────────────────────────────
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

  // ── Tabs ──────────────────────────────────────────────────
  tabRow: {
    paddingHorizontal: 20,
    gap: 4,
    marginTop: 20,
    paddingBottom: 2,
  },

  // ── Property grid ─────────────────────────────────────────
  propGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    paddingTop: 14,
  },
  propCard: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  propStatusWrap: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  propBody: {
    padding: 10,
  },
});
