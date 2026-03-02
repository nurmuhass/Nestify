import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const reviews = [
  {
    id: '1',
    name: 'Jin Martin',
    review: 'Lorem ipsum dolor sit amet...',
    rating: 5,
    location: 'Semarang, Indonesia',
    time: '10 mins ago',
    property: 'Fairview Apartment',
    image: require('@/assets/images/andrew.jpg'),
    propertyImage: require('@/assets/images/nearby1.jpg'),
  },
  {
    id: '2',
    name: 'Mindy Lane',
    review: 'Sed ut perspiciatis unde omnis iste...',
    rating: 5,
    location: 'Jakarta, Indonesia',
    time: '10 mins ago',
    property: 'Schoolview House',
    image: require('@/assets/images/anderson.jpg'),
    propertyImage: require('@/assets/images/nearby2.jpg'),
  },
  // Add more reviews
];

const AllReviews = () => {
  const [filter, setFilter] = useState('All');
const router = useRouter(); 
  const filteredReviews = filter === 'All' ? reviews : reviews.filter(r => r.rating === filter);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>All reviews</Text>

      <View style={styles.ownerSection}>
        <Image source={require('@/assets/images/anderson.jpg')} style={styles.ownerImage} />
        <View>
          <Text style={styles.ownerName}>Mandella</Text>
          <Text style={{ color: 'gray' }}>Owner</Text>
        </View>
        <Ionicons name="chatbubble-ellipses-outline" size={24} style={{ marginLeft: 'auto' }} />
      </View>

      <View style={styles.filterRow}>
        {['All', 1, 2, 3].map(star => (
          <TouchableOpacity key={star} onPress={() => setFilter(star)} style={[styles.filterBtn, filter === star && styles.filterActive]}>
            <Text style={styles.filterText}>{star === 'All' ? '★ All' : `★ ${star}`}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredReviews}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <Image source={item.propertyImage} style={styles.propertyImage} />
            <View style={{ padding: 10 }}>
              <Text style={styles.propertyTitle}>{item.property}</Text>
              <Text style={styles.location}>{item.location}</Text>
              <View style={styles.userRow}>
                <Image source={item.image} style={styles.userImage} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.reviewText}>{item.review}</Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.rating}>★★★★★</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20,paddingTop:getStatusBarHeight() },
  backButton: { marginBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  ownerSection: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef6ff',
    padding: 10, borderRadius: 12, marginBottom: 20
  },
  ownerImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  ownerName: { fontWeight: 'bold', fontSize: 16 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  filterBtn: {
    paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#f0f0f0',
  },
  filterActive: { backgroundColor: '#00bfff' },
  filterText: { fontWeight: 'bold', color: '#000' },
  reviewCard: {
    backgroundColor: '#f9f9f9', borderRadius: 15, marginBottom: 15
  },
  propertyImage: { width: '100%', height: 120, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  propertyTitle: { fontWeight: 'bold', fontSize: 16 },
  location: { color: '#777', fontSize: 13 },
  userRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  userImage: { width: 40, height: 40, borderRadius: 20 },
  userName: { fontWeight: 'bold', fontSize: 14 },
  reviewText: { fontSize: 13, color: '#555' },
  rating: { color: '#f1c40f', fontSize: 18 },
  time: { fontSize: 11, color: '#aaa' },
});

export default AllReviews;
