// ─────────────────────────────────────────────────────────────
// PromoSlider.tsx (UPDATED + SAFE + SMOOTH)
// ─────────────────────────────────────────────────────────────

import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

const ITEM_WIDTH = width * 0.90;
const ITEM_HEIGHT = 190;

type SliderItem = {
  id?: string | number;
  name?: string;
  image_path?: string;
};

type Props = {
  sliders?: SliderItem[];
};

function PromoSlider({ sliders = [] }: Props) {
  const router = useRouter();

  // Prevent crash if API returns invalid data
  const sliderData = Array.isArray(sliders) ? sliders : [];

  // Don't render empty carousel
  if (sliderData.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Carousel
        loop={sliderData.length > 1}
        autoPlay={sliderData.length > 1}
        autoPlayInterval={4000}
        width={width}
        height={ITEM_HEIGHT}
        data={sliderData}
        scrollAnimationDuration={1200}
        pagingEnabled
        snapEnabled
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.92,
          parallaxScrollingOffset: 45,
        }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{
                uri:
                  item?.image_path ||
                  'https://via.placeholder.com/600x300.png',
              }}
              style={styles.image}
              resizeMode="cover"
            />

            {/* Dark overlay */}
            <View style={styles.overlay} />

            {/* Bottom text */}
            <View style={styles.textWrap}>
              <Text numberOfLines={1} style={styles.title}>
                {item?.name || 'Featured Property'}
              </Text>

              <Text numberOfLines={1} style={styles.subtitle}>
                Discover premium real estate opportunities
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

export default memo(PromoSlider);

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 14,
  },

  card: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 22,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#112244',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },

  textWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  title: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },

  subtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '400',
  },
});