import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

const PropertySummaryCard = () => {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
        onPress={() => {
          router.push('../Home/Properties/Details');
        }}
      >
        <View style={styles.cardContent}>
          <View style={styles.imageContainer}>
            <Image
              source={require('@/assets/images/nearby4.jpeg')}
              style={styles.image}
            />
            <TouchableOpacity
              style={[
                styles.heartIcon,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Entypo name="heart-outlined" size={18} color={colors.error} />
            </TouchableOpacity>
            <View style={[styles.tag, { backgroundColor: colors.tint }]}>
              <Text style={[styles.tagText, { color: colors.background }]}>
                House
              </Text>
            </View>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]}>
              Sky Dandelions Apartment
            </Text>
            <View style={styles.row}>
              <MaterialIcons
                name="star"
                size={14}
                color={colors.warning}
              />
              <Text style={[styles.rating, { color: colors.mutedText }]}>
                4.9
              </Text>
            </View>
            <Text style={[styles.location, { color: colors.mutedText }]}>
              Jakarta, Indonesia
            </Text>
            <Text style={[styles.price, { color: colors.buttonBackground }]}>
              $350
              <Text style={[styles.month, { color: colors.mutedText }]}>
                {' '}
                /month
              </Text>
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default PropertySummaryCard;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  card: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    padding: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: 170,
    height: 140,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  heartIcon: {
    position: 'absolute',
    top: 6,
    left: 6,
    padding: 4,
    borderRadius: 20,
    elevation: 2,
  },
  tag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    marginLeft: 4,
    fontSize: 13,
  },
  location: {
    fontSize: 13,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  month: {
    fontSize: 13,
    fontWeight: '400',
  },
});
