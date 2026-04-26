import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Text, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;

export default function PromoSlider() {
  const router = useRouter();
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken"); // await token
      const response = await fetch(
        'https://insighthub.com.ng/NestifyAPI/get-sliders.php',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + (token ?? ''),
          },
        }
      );

      const result = await response.json();
      console.log('get-sliders raw result:', result);

      // IMPORTANT: API returns { sliders: [...], status: 'success' }
      if (response.ok && result.status === 'success') {
setSliders(result.sliders);
        
      } else {
        const msg = result.msg || 'Failed to load sliders';
        Alert.alert('Error', msg);
      }
    } catch (err) {
      console.error('fetchSliders error:', err);
      Alert.alert('Error', err.message || String(err));
    } finally {
      setLoading(false);
    }
  }; 

  if (loading) {
    return    <View style={{ height: 238,
    alignItems: 'center',
    justifyContent: 'center'}}>
          <ActivityIndicator color="#c9a84c" />
        </View>;
  }

  if (!sliders || sliders.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ textAlign: 'center', color: '#666' }}>No promotional sliders available.</Text>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: 10 }}>
      <Carousel
        loop
        width={width / 1.05}
        height={180}
        autoPlay={true}
        data={sliders}
        scrollAnimationDuration={1000}
        style={{ width }}
        pagingEnabled={false}
        mode="parallax"
        modeConfig={{ parallaxScrollingScale: 0.9, parallaxScrollingOffset: 50 }}
        renderItem={({ item }) => (
          <View
            style={{
              width: ITEM_WIDTH,
              height: 180,
              borderRadius: 12,
              overflow: 'hidden',
              marginHorizontal: 1,
            }}
          >
            <Image
              source={{ uri: item.image_path }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              onError={(e) => console.warn('Image load error:', e.nativeEvent)}
            />
            <View style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.35)',
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 6
            }}>
              <Text
                numberOfLines={1}
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600'
                }}
              >
                {item.name}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
