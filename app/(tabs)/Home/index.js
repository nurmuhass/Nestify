import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

// ── Components ──────────────────────────────────────────────────
import FeaturedEstates  from '../../../components/FeaturedEstates';
import HomeHeader       from '../../../components/HomeHeader';
import HomeSearchBar    from '../../../components/HomeSearchBar';
import NearbyProperties from '../../../components/NearbyProperties';
import PromoSlider      from '../../../components/PromoSlider';
import TopCompanies     from '../../../components/TopCompanies';
import TopLocations from '../../../components/TopLocations';

export default function HomeScreen() {
  // Lifted state so HomeHeader can show live counts from child fetches
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [companiesCount,  setCompaniesCount]  = useState(0);

  return (
    <FlatList
      data={[]}
      keyExtractor={(_, i) => i.toString()}
      showsVerticalScrollIndicator={false}
      style={styles.root}
      // NearbyProperties manages its own FlatList internally (scrollEnabled=false),
      // so we keep ONE outer scroll container here and everything nests cleanly.
      ListHeaderComponent={
        <>
          {/* ── 1. Hero card (greeting + location + stats) ── */}
          <HomeHeader
            propertiesCount={propertiesCount}
            companiesCount={companiesCount}
          />

          {/* ── 2. Search bar → navigates to SearchScreen ── */}
          <HomeSearchBar />

          {/* ── 3. Promo / banner slider ── */}
          <PromoSlider />

          <TopLocations />

          {/* ── 4. Featured estates (horizontal scroll) ── */}
          <FeaturedEstates />

          {/* ── 5. Top companies (horizontal scroll) ── */}
          <TopCompanies
            onCountChange={(n) => setCompaniesCount(n)}
          />

          {/* ── 6. Nearby properties (tabs + category chips + 2-col grid) ── */}
          <NearbyProperties
            onPropertiesCountChange={(n) => setPropertiesCount(n)}
          />

          <View style={{ height: 40 }} />
        </>
      }
      ListFooterComponent={null}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#faf8f4',
    paddingTop: getStatusBarHeight(),
  },
});
