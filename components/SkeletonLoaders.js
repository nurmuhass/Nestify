// ─────────────────────────────────────────────────────────────
//  SkeletonLoaders.js
//  Updated to match your NEW premium dark UI components
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { colorWithAlpha } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

const { width: SCREEN_W } = Dimensions.get("window");

// ─────────────────────────────────────────────────────────────
//  COLORS
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
//  SHIMMER
// ─────────────────────────────────────────────────────────────

function useShimmer() {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const base = colors.inputBackground;
  const shine = colorWithAlpha(colors.buttonBackground, 0.32);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  return anim.interpolate({
    inputRange: [0, 1],
    outputRange: [base, shine],
  });
}

function SkeletonBlock({ width, height, borderRadius = 10, style }) {
  const backgroundColor = useShimmer();

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────
//  HOME HEADER
// ─────────────────────────────────────────────────────────────

export function HomeHeaderSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[styles.hero, { backgroundColor: colors.cardBackground }]}>
      {/* top row */}
      <View style={styles.headerTop}>
        <SkeletonBlock width={140} height={34} borderRadius={20} />

        <View style={styles.row}>
          <SkeletonBlock width={36} height={36} borderRadius={18} />

          <SkeletonBlock
            width={38}
            height={38}
            borderRadius={19}
            style={{ marginLeft: 10 }}
          />
        </View>
      </View>

      {/* greeting */}
      <SkeletonBlock width={120} height={12} style={{ marginTop: 16 }} />

      <SkeletonBlock width={210} height={30} style={{ marginTop: 12 }} />

      <SkeletonBlock width={160} height={12} style={{ marginTop: 12 }} />

      {/* stats */}
      <View style={[styles.row, { marginTop: 24, gap: 10 }]}>
        {[1, 2, 3].map((i) => (
          <SkeletonBlock
            key={i}
            width={(SCREEN_W - 72) / 3}
            height={70}
            borderRadius={16}
          />
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  SEARCH BAR
// ─────────────────────────────────────────────────────────────

export function SearchBarSkeleton() {
  return (
    <View style={styles.section}>
      <SkeletonBlock width={SCREEN_W - 32} height={54} borderRadius={18} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  PROMO SLIDER
// ─────────────────────────────────────────────────────────────

export function PromoSliderSkeleton() {
  return (
    <View style={styles.section}>
      <SkeletonBlock width={SCREEN_W - 32} height={190} borderRadius={22} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  TOP LOCATIONS
// ─────────────────────────────────────────────────────────────

export function TopLocationsSkeleton() {
  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <SkeletonBlock width={130} height={20} />
        <SkeletonBlock width={60} height={14} />
      </View>

      <View style={[styles.row, { gap: 12 }]}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.locationCard}>
            <SkeletonBlock width={70} height={70} borderRadius={20} />
            <SkeletonBlock width={70} height={14} style={{ marginTop: 10 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  FEATURED ESTATES
// ─────────────────────────────────────────────────────────────

export function FeaturedEstatesSkeleton() {
  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <SkeletonBlock width={170} height={20} />
        <SkeletonBlock width={70} height={14} />
      </View>

      <View style={[styles.row, { gap: 14 }]}>
        {[1, 2].map((i) => (
          <View key={i} style={styles.featuredCard}>
            <SkeletonBlock width={215} height={170} borderRadius={24} />

            <View style={styles.featuredCardBody}>
              <SkeletonBlock width={140} height={16} />
              <SkeletonBlock width={90} height={12} style={{ marginTop: 10 }} />

              <View style={[styles.row, { gap: 10, marginTop: 16 }]}>
                <SkeletonBlock width={60} height={22} borderRadius={12} />
                <SkeletonBlock width={60} height={22} borderRadius={12} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  TOP COMPANIES
// ─────────────────────────────────────────────────────────────

export function TopCompaniesSkeleton() {
  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <SkeletonBlock width={150} height={20} />
        <SkeletonBlock width={60} height={14} />
      </View>

      <View style={[styles.row, { gap: 14 }]}>
        {[1, 2].map((i) => (
          <View key={i} style={styles.companyCard}>
            <SkeletonBlock width={290} height={170} borderRadius={24} />

            <View style={styles.companyBody}>
              <SkeletonBlock width={140} height={16} />
              <SkeletonBlock width={90} height={12} style={{ marginTop: 10 }} />

              <View style={[styles.row, { gap: 10, marginTop: 16 }]}>
                <SkeletonBlock width={60} height={14} borderRadius={10} />
                <SkeletonBlock width={60} height={14} borderRadius={10} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  TRENDING PROPERTIES
// ─────────────────────────────────────────────────────────────

export function TrendingPropertiesSkeleton() {
  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <SkeletonBlock width={180} height={22} />
        <SkeletonBlock width={60} height={14} />
      </View>

      <SkeletonBlock width={SCREEN_W * 0.82} height={390} borderRadius={28} />

      <SkeletonBlock
        width={180}
        height={18}
        style={{ marginTop: -120, marginLeft: 18 }}
      />

      <SkeletonBlock
        width={120}
        height={12}
        style={{ marginTop: 12, marginLeft: 18 }}
      />

      <SkeletonBlock
        width={140}
        height={26}
        style={{ marginTop: 14, marginLeft: 18 }}
      />

      <View
        style={[
          styles.row,
          {
            gap: 10,
            marginTop: 18,
            marginLeft: 18,
          },
        ]}
      >
        <SkeletonBlock width={60} height={30} borderRadius={15} />
        <SkeletonBlock width={60} height={30} borderRadius={15} />
        <SkeletonBlock width={90} height={30} borderRadius={15} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  NEARBY PROPERTIES
// ─────────────────────────────────────────────────────────────

export function NearbyPropertiesSkeleton({ rows = 2 }) {
  const CARD_W = (SCREEN_W - 44) / 2;

  return (
    <View style={styles.section}>
      {/* title */}
      <View style={styles.titleRow}>
        <SkeletonBlock width={190} height={20} />
        <SkeletonBlock width={70} height={14} />
      </View>

      {/* listing tabs */}
      <View
        style={[
          styles.row,
          {
            gap: 10,
            marginBottom: 18,
          },
        ]}
      >
        {[70, 100, 100].map((w, i) => (
          <SkeletonBlock key={i} width={w} height={38} borderRadius={20} />
        ))}
      </View>

      {/* category chips */}
      <View
        style={[
          styles.row,
          {
            gap: 10,
            marginBottom: 22,
          },
        ]}
      >
        {[50, 120, 100, 90].map((w, i) => (
          <SkeletonBlock key={i} width={w} height={28} borderRadius={14} />
        ))}
      </View>

      {/* property grid */}
      {Array.from({ length: rows }).map((_, row) => (
        <View
          key={row}
          style={[
            styles.row,
            {
              gap: 12,
              marginBottom: 18,
            },
          ]}
        >
          {[1, 2].map((i) => (
            <View key={i}>
              <SkeletonBlock width={CARD_W} height={145} borderRadius={18} />

              <SkeletonBlock
                width={90}
                height={24}
                borderRadius={12}
                style={{
                  marginTop: -12,
                  marginLeft: 10,
                }}
              />

              <SkeletonBlock
                width={130}
                height={14}
                style={{
                  marginTop: 14,
                }}
              />

              <SkeletonBlock
                width={90}
                height={12}
                style={{
                  marginTop: 10,
                }}
              />

              <View
                style={[
                  styles.row,
                  {
                    gap: 8,
                    marginTop: 10,
                  },
                ]}
              >
                <SkeletonBlock width={55} height={22} borderRadius={11} />

                <SkeletonBlock width={55} height={22} borderRadius={11} />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  FULL HOME SCREEN
// ─────────────────────────────────────────────────────────────

export function HomeScreenSkeleton() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <HomeHeaderSkeleton />

      <SearchBarSkeleton />

      <PromoSliderSkeleton />

      <TopLocationsSkeleton />

      <FeaturedEstatesSkeleton />

      <TopCompaniesSkeleton />

      <TrendingPropertiesSkeleton />

      <NearbyPropertiesSkeleton rows={2} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: 16,
    marginTop: getStatusBarHeight() + 6,
    borderRadius: 26,
    padding: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 22,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  locationCard: {
    width: 96,
    alignItems: "center",
  },

  featuredCard: {
    width: 215,
  },

  featuredCardBody: {
    marginTop: 14,
    paddingHorizontal: 4,
  },

  companyCard: {
    width: 290,
  },

  companyBody: {
    marginTop: 14,
    paddingHorizontal: 8,
  },
});
