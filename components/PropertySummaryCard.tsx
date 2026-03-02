import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PropertySummaryCard = () => {

    const router = useRouter(); // Initialize the router

  return (
    <View style={styles.container}>

       <TouchableOpacity  style={styles.card} onPress={() => {router.push("../Home/Company/Details")}}>
        <View style={styles.cardContent}>
          <View style={styles.imageContainer}>
                  <Image source={require('@/assets/images/nearby4.jpeg')} style={styles.image} />
            <TouchableOpacity style={styles.heartIcon}>
              <Entypo name="heart-outlined" size={18} color="#FF4D4D" />
            </TouchableOpacity>
            <View style={styles.tag}>
              <Text style={styles.tagText}>House</Text>
            </View>
          </View>
          <View style={styles.info}>
           <Text style={styles.name}>Sky Dandelions Apartment</Text>
            <View style={styles.row}>
              <MaterialIcons name="star" size={14} color="#fbbf24" />
                 <Text style={styles.rating}>4.9</Text>
            </View>
   <Text style={styles.location}>Jakarta, Indonesia</Text>
            <Text style={styles.price}>
              $350
              <Text style={styles.month}> /month</Text>
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    backgroundColor: '#ffffff',
    padding: 4,
    borderRadius: 20,
    elevation: 2,
  },
  tag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    color: '#ffffff',
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
    color: '#222222',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    marginLeft: 4,
    fontSize: 13,
    color: '#666666',
  },
  location: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
  },
  month: {
    fontSize: 13,
    fontWeight: '400',
    color: '#888888',
  },
});
