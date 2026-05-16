// ─────────────────────────────────────────────────────────────
//  HomeScreen.js  (updated)
//  Strategy: show the full-page skeleton until the FIRST critical
//  fetch resolves (properties count), then fade it out and reveal
//  the real content.  Per-section skeletons are shown inside each
//  component individually for subsequent loads/refreshes.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, View } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

// ── Components ───────────────────────────────────────────────
import FeaturedCompanies   from '../../../components/FeaturedCompanies';
import FeaturedEstates     from '../../../components/FeaturedEstates';
import HomeHeader          from '../../../components/HomeHeader';
import HomeSearchBar       from '../../../components/HomeSearchBar';
import NearbyProperties    from '../../../components/NearbyProperties';
import PromoSlider         from '../../../components/PromoSlider';
import TopLocations        from '../../../components/TopLocations';
import TrendingProperties  from '../../../components/TrendingProperties';

// ── Skeleton ─────────────────────────────────────────────────
import { HomeScreenSkeleton } from '../../../components/SkeletonLoaders';

export default function HomeScreen() {
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [companiesCount,  setCompaniesCount]  = useState(0);

  // ── Loading state ─────────────────────────────────────────
  // `isLoading` stays true until we receive the first data signal
  // from any child component.  Adjust the trigger to whatever your
  // fastest/most critical fetch is.
  const [isLoading, setIsLoading] = useState(true);

  // Animated opacity for cross-fade skeleton → real content
  const skeletonOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity  = useRef(new Animated.Value(0)).current;

  function handleDataReady() {
    if (!isLoading) return;          // already revealed
    setIsLoading(false);

    // Smooth cross-fade: skeleton fades out, content fades in
    Animated.parallel([
      Animated.timing(skeletonOpacity, {
        toValue:         0,
        duration:        350,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue:         1,
        duration:        350,
        useNativeDriver: true,
      }),
    ]).start();
  }

  // Safety net: if nothing calls handleDataReady within 4 s,
  // reveal content anyway so the user isn't stuck on skeletons.
  useEffect(() => {
    const timer = setTimeout(handleDataReady, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.root}>
      {/* ── Skeleton layer (sits on top until fade completes) ── */}
      {isLoading && (
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: skeletonOpacity, zIndex: 10 }]}
          pointerEvents={isLoading ? 'auto' : 'none'}
        >
          <FlatList
            data={[]}
            keyExtractor={(_, i) => i.toString()}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={<HomeScreenSkeleton />}
          />
        </Animated.View>
      )}

      {/* ── Real content layer ── */}
      <Animated.View style={[styles.fill, { opacity: contentOpacity }]}>
        <FlatList
          data={[]}
          keyExtractor={(_, i) => i.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <HomeHeader
                propertiesCount={propertiesCount}
                companiesCount={companiesCount}
              />

              <HomeSearchBar />

              <PromoSlider />

              <TopLocations />

              <FeaturedEstates />

              <FeaturedCompanies
                onCountChange={(n) => {
                  setCompaniesCount(n);
                  handleDataReady();   // ← first data signal
                }}
              />

              <TrendingProperties />

              <NearbyProperties
                onPropertiesCountChange={(n) => {
                  setPropertiesCount(n);
                  handleDataReady();   // ← also a valid first signal
                }}
              />

              <View style={{ height: 40 }} />
            </>
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f2044',
    paddingTop: getStatusBarHeight(),
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    top: getStatusBarHeight(), // match paddingTop of root
  },
});