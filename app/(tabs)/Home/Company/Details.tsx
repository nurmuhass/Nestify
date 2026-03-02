// app/Home/Details/[id].js

import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import NearbyProperties from '../../../../components/NearbyProperties';
export default function PropertyDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams() as { id: string };

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (id) {
      fetchPropertyById();
    }
  }, [id]);

  const fetchPropertyById = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/get_property_by_id.php?id=${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
       'Authorization': `Token ${token}`,
          },
        }
      );
      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setProperty(result.property);
      } else {
        const msg = result.msg || 'Failed to load property details';
        setError(msg);
        Alert.alert('Error', msg);
      }
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };


  // 2) Carousel logic
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const windowWidth = Dimensions.get('window').width;
  const carouselWidth = windowWidth * 0.92;
  const sideMargin = windowWidth * 0.04;
  let autoScrollInterval: any;

  useEffect(() => {
    if (property && property.images && property.images.length > 1) {
      // Auto‐scroll every 3 seconds
      autoScrollInterval = setInterval(() => {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= property.images.length) {
          nextIndex = 0;
        }
        setCurrentIndex(nextIndex);
        scrollRef.current?.scrollTo({
          x: nextIndex * carouselWidth,
          animated: true,
        });
      }, 3000);
    }
    return () => {
      clearInterval(autoScrollInterval);
    };
  }, [property, currentIndex]);



  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }
  if (!property) {
    return null;
  }

  // Build a thumbnail URL for the header image (first in array)
  const headerImageUrl =
    property.images && property.images.length > 0
      ? `https://insighthub.com.ng/${property.images[0]}`
      : undefined;

  return (
   <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Carousel in place of single header image */}
      <View style={styles.headerContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{
            width: carouselWidth,
            height: 450,
            marginLeft: sideMargin,
            marginRight: sideMargin,
            marginTop: 2,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          {property.images.map((imgPath: string, idx: number) => (
            <Image
              key={idx}
              source={{ uri: `https://insighthub.com.ng/${imgPath}` }}
              style={{
                width: carouselWidth,
                height: 450,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Overlay icons (back, share, heart) */}
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={{ padding: 10, backgroundColor: '#e9ecf2', borderRadius: 10 }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="black" />
          </TouchableOpacity>
          <View style={styles.rightIcons}>
            <TouchableOpacity style={styles.iconCircle}>
              <AntDesign name="upload" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}>
              <Ionicons name="heart" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Thumbnails (first two + “+N”) */}
        <View style={styles.thumbnailContainer}>
          {property.images.slice(0, 2).map((imgPath: string, idx: number) => (
            <Image
              key={idx}
              source={{ uri: `https://insighthub.com.ng/${imgPath}` }}
              style={styles.thumbnail}
            />
          ))}
          {property.images.length > 2 && (
            <View style={styles.moreThumbnails}>
              <Text style={styles.moreText}>
                +{property.images.length - 2}
              </Text>
            </View>
          )}
        </View>

        {/* Rating & Type tags */}
        <View style={styles.tagsRow}>
          <Text style={styles.ratingTag}>
            ⭐ {property.rentPrice ? property.rentPrice : property.sellPrice}
          </Text>
          <Text style={styles.typeTag}>{property.listingType}</Text>
        </View>
      </View>

      {/* Rest of your details content (unchanged) */}
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{property.propertyName}</Text>
          <Text style={styles.price}>
            {property.listingType === 'Rent'
              ? `$${property.rentPrice}`
              : property.listingType === 'Sell'
              ? `$${property.sellPrice}`
              : `$${property.sellPrice}`}
            <Text style={styles.perMonth}> /month</Text>
          </Text>
        </View>
        <Text style={styles.location}>
          📍 {property.city}, {property.state}
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.rentBtn}>
            <Text style={styles.btnText}>Rent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyBtn}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconOnly}>
            <Ionicons name="cube" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Agent Info (placeholder) */}
        <View style={styles.agentCard}>
          <Image
            source={require('@/assets/images/amanda.jpg')}
            style={styles.agentImage}
          />
          <View>
            <Text style={styles.agentName}>Agent Name</Text>
            <Text style={styles.agentRole}>Real Estate Agent</Text>
          </View>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color="#007bff"
            style={{ marginLeft: 'auto' }}
          />
        </View>

        {/* Specs */}
        <View style={styles.specsRow}>
          <Text style={styles.spec}>{property.bedrooms} Bedroom</Text>
          <Text style={styles.spec}>{property.Toilet} Bathroom</Text>
          <Text style={styles.spec}>{property.balconies} Balcony</Text>
        </View>

        {/* Location & Facilities */}
        <Text style={styles.sectionTitle}>Location & Public Facilities</Text>
        <Text style={styles.address}>{property.city}, {property.state}</Text>
        <Text style={styles.address}>{property.country}</Text>
        <Text style={styles.distance}>📍 2.5 km from your location</Text>
        <View style={styles.facilitiesRow}>
          <Text style={styles.facility}>2 Hospital</Text>
          <Text style={styles.facility}>4 Gas stations</Text>
          <Text style={styles.facility}>2 Schools</Text>
        </View>
        <Image source={require('@/assets/images/map.png')} style={styles.mapImage} />

        {/* Cost of Living */}
        <Text style={styles.sectionTitle}>Cost of Living</Text>
        <View style={styles.costBox}>
          <Text style={styles.costText}>$830/month*</Text>
          <Text style={styles.costSub}>Average spending in this area</Text>
        </View>
        <TouchableOpacity style={styles.buyNowBtn}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>

        {/* Reviews */}
        <Text style={styles.sectionTitle}>Reviews</Text>
        <View style={styles.reviewSummary}>
          <Text style={styles.reviewRating}>⭐ 4.9</Text>
          <Text style={styles.reviewTotal}>From 112 reviewers</Text>
        </View>
        <View style={styles.reviewCard}>
          <View style={styles.reviewUserRow}>
            <Image
              source={require('@/assets/images/samantha.jpg')}
              style={styles.reviewUserImage}
            />
            <View>
              <Text style={styles.reviewUser}>Kurt Mullins</Text>
              <View style={{ flexDirection: 'row' }}>
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <MaterialIcons
                    key={i}
                    name="star"
                    size={12}
                    color={i < 1 ? '#ffc107' : '#ccc'}
                  />
                ))}
              </View>
            </View>
          </View>
          <Text style={styles.reviewText}>Lorem ipsum dolor sit amet...</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => router.push('./Reviews')}
        >
          <Text style={styles.viewAllText}>View all reviews</Text>
        </TouchableOpacity>

        {/* Nearby Listings */}
        <Text style={styles.sectionTitle}>Nearby From this Location</Text>
        <NearbyProperties />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff',paddingTop:getStatusBarHeight() },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { position: 'relative' },
  headerImage: { 
    width: '92%', 
    height: 450, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20,
    marginLeft: '4%', 
    marginRight: '4%',
    marginTop: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  headerIcons: { 
    position: 'absolute', 
    top: 20, 
    left: 20, 
    right: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  rightIcons: { flexDirection: 'row', gap: 10 },
  iconCircle: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: 8, alignSelf: 'center' },
  thumbnailContainer: { flexDirection: 'column', position: 'absolute', bottom: 10, right: 20 },
  thumbnail: { width: 40, height: 40, borderRadius: 8, marginVertical: 4 },
  moreThumbnails: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#0006', justifyContent: 'center', alignItems: 'center' },
  moreText: { color: 'white', fontWeight: 'bold' },
  infoContainer: { padding: 16 },
  tagsRow: { flexDirection: 'row', gap: 10, position: 'absolute', bottom: 10, left: 20 },
  ratingTag: { backgroundColor: '#FF6584', padding: 8, borderRadius: 10, color: '#fff', fontWeight: 'bold' },
  typeTag: { backgroundColor: '#25B4F8', padding: 8, borderRadius: 10, color: '#fff' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  title: { fontSize: 20, fontWeight: 'bold' },
  price: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  perMonth: { fontSize: 14, color: '#999' },
  location: { color: '#666', marginVertical: 5 },
  buttonRow: { flexDirection: 'row', marginVertical: 10, gap: 10 },
  rentBtn: { flex: 1, padding: 10, borderWidth: 1, backgroundColor: '#e9ecf2', borderRadius: 8, alignItems: 'center' },
  buyBtn: { flex: 1, padding: 10, backgroundColor: '#007bff', borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#000', fontWeight: 'bold' },
  iconOnly: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  agentCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginVertical: 10 },
  agentImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  agentName: { fontWeight: 'bold' },
  agentRole: { color: '#777' },
  specsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  spec: { backgroundColor: '#eee', padding: 8, borderRadius: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 10 },
  address: { color: '#666' },
  distance: { backgroundColor: '#f0f0f0', padding: 8, borderRadius: 8, marginVertical: 8 },
  facilitiesRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  facility: { backgroundColor: '#eee', padding: 8, borderRadius: 8 },
  mapImage: { width: '100%', height: 150, borderRadius: 10, marginVertical: 10 },
  costBox: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 10 },
  costText: { fontSize: 18, fontWeight: 'bold' },
  costSub: { color: '#666', fontSize: 12 },
  buyNowBtn: { backgroundColor: '#007bff', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  buyNowText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  reviewSummary: { backgroundColor: '#FFB6C1', padding: 14, borderRadius: 10, marginBottom: 10 },
  reviewRating: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  reviewTotal: { color: 'white', fontSize: 12 },
  reviewCard: { backgroundColor: '#f8f8f8', padding: 12, borderRadius: 10, marginBottom: 10 },
  reviewUserRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  reviewUserImage: { width: 40, height: 40, borderRadius: 20 },
  reviewUser: { fontWeight: 'bold' },
  reviewText: { color: '#333' },
  viewAllBtn: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  viewAllText: { color: '#007bff', fontWeight: 'bold' },
});
