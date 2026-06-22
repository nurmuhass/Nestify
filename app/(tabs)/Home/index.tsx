import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useFocusEffect } from 'expo-router';

// COMPONENTS
import FeaturedEstates from '../../../components/FeaturedEstates';
import HomeHeader from '../../../components/HomeHeader';
import HomeSearchBar from '../../../components/HomeSearchBar';
import NearbyProperties from '../../../components/NearbyProperties';
import PromoSlider from '../../../components/PromoSlider';
import TopLocations from '../../../components/TopLocations';
import TrendingProperties from '../../../components/TrendingProperties';
import TopCompanies from '../../../components/TopCompanies';

// SKELETON 
import { HomeScreenSkeleton } from '../../../components/SkeletonLoaders';

// NETWORK
import { useNetwork } from '@/NetworkContext';
import { useTheme } from '@/context/ThemeContext';

export default function HomeScreen() {
  const { isOnline } = useNetwork();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);

  const [homeData, setHomeData] = useState({
    user: null,
    unreadCount: 0,

    sliders: [],
    estates: [],
    companies: [],
    trendingProperties: [],
    nearbyProperties: [],
    categories: [],

    propertiesCount: 0,
    companiesCount: 0,
  });

  const loadHomeData = useCallback(async () => {
    /**
     * Extra protection.
     * OfflineGate already blocks this page,
     * but this prevents requests if this function is called manually.
     */
    if (!isOnline) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('authToken');
      const userJson = await AsyncStorage.getItem('authUser');

      const user = userJson
        ? JSON.parse(userJson)
        : null;

      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + (token ?? ''),
      };

      const [
        slidersRes,
        estatesRes,
        companiesRes,
        trendingRes,
        nearbyRes,
        categoriesRes,
        notificationsRes,
      ] = await Promise.all([
        fetch(
          'https://insighthub.com.ng/NestifyAPI/get-sliders.php',
          { headers }
        ),

        fetch(
          'https://insighthub.com.ng/NestifyAPI/get_Estates.php',
          { headers }
        ),

        fetch(
          'https://insighthub.com.ng/NestifyAPI/get_featured_companies.php',
          { headers }
        ),

        fetch(
          'https://insighthub.com.ng/NestifyAPI/get_trending_properties.php?limit=10',
          { headers }
        ),

        fetch(
          'https://insighthub.com.ng/NestifyAPI/get_nearby_properties.php?page=1&limit=10&listing_type=All&category=All',
          { headers }
        ),

        fetch(
          'https://insighthub.com.ng/NestifyAPI/get_categories.php',
          { headers }
        ),

        fetch(
          'https://insighthub.com.ng/NestifyAPI/get_notifications.php',
          { headers }
        ),
      ]);

      const [
        sliders,
        estates,
        companies,
        trending,
        nearby,
        categories,
        notifications,
      ] = await Promise.all([
        slidersRes.json(),
        estatesRes.json(),
        companiesRes.json(),
        trendingRes.json(),
        nearbyRes.json(),
        categoriesRes.json(),
        notificationsRes.json(),
      ]);

      const notificationData = notifications.data ?? [];

      const unreadCount = notificationData.filter(
        (n: any) =>
          n.is_read == 0 ||
          n.is_read === false ||
          n.is_read === '0'
      ).length;

      const nearbyProperties =
        nearby.data || nearby.properties || [];

      const companiesData =
        companies.companies || [];

      setHomeData({
        user,
        unreadCount,

        sliders: sliders.sliders || [],

        estates:
          estates.Estates ||
          estates.estates ||
          [],

        companies: companiesData,

        trendingProperties:
          trending.data || [],

        nearbyProperties,

        categories:
          categories.categories || [],

        propertiesCount:
          nearbyProperties.length,

        companiesCount:
          companiesData.length,
      });
    } catch (error) {
      console.log('HOME LOAD ERROR:', error);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useFocusEffect(
    useCallback(() => {
      if (isOnline) {
        loadHomeData();
      }
    }, [isOnline, loadHomeData])
  );

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <HomeScreenSkeleton />
          }
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={[]}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <HomeHeader
              user={homeData.user}
              unreadCount={homeData.unreadCount}
              propertiesCount={homeData.propertiesCount}
              companiesCount={homeData.companiesCount}
            />

            <HomeSearchBar />

            <PromoSlider
              sliders={homeData.sliders}
            />

            <TopLocations />

            <FeaturedEstates
              estates={homeData.estates}
            />

            <TopCompanies
              companies={homeData.companies}
            />

            <TrendingProperties
              properties={homeData.trendingProperties}
            />

            <NearbyProperties
              properties={homeData.nearbyProperties}
              categories={homeData.categories}
            />

            <View style={{ height: 0 }} />
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: getStatusBarHeight(),
  },
});
