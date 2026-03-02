import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function EstateDetails() {
  const { id } = useLocalSearchParams();
  const [estate, setEstate] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();




   useEffect(() => {
    if (id) {
      fetchEstateById();
    }
  }, [id]);

  const fetchEstateById = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/getEstateById.php?id=${id}`,
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
           setEstate(result.property);
        
      } else {
        const msg = result.msg || 'Failed to load property details';
        setError(msg);
        Alert.alert('Error', msg);
      }
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!estate) {
    return (
      <View style={styles.center}>
        <Text>No estate found.</Text>
        
      </View>
    );
  }

  return (
    <ScrollView style={{...styles.container,paddingTop:50}}>


        <View style={{...styles.headerIcons,}}>
          <TouchableOpacity
            style={{ padding: 10, backgroundColor: '#000', borderRadius: 10 }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#e9ecf2" />
          </TouchableOpacity>
          <View style={styles.rightIcons}>
         
          </View>
        </View>

      {/* Main Image */}
      <View style={{marginTop:55}}>
  <Image source={{ uri: estate.image_path }} style={styles.mainImage} />
      </View>
    

      {/* Name + Rating */}
      <View style={styles.header}>
        <Text style={styles.title}>{estate.name}</Text>
        {estate.rating && (
          <View style={styles.ratingBox}>
            {/* <Image
              source={require('../../assets/images/star.png')}
              style={{ width: 16, height: 16, marginRight: 4 }}
            /> */}
            <Text style={{ color: 'gray' }}>{estate.rating}</Text>
          </View>
        )}
      </View>

      {/* Location */}
      <Text style={styles.location}>{estate.location}</Text>

      {/* Description */}
      {estate.description && (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descText}>{estate.description}</Text>
        </View>
      )}

      {/* Facilities */}
      {estate.estate_facilities && estate.estate_facilities.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Facilities</Text>
          {estate.estate_facilities.map((facility, idx) => (
            <Text key={idx} style={styles.facilityItem}>• {facility}</Text>
          ))}
        </View>
      )}

      {/* Created At */}
      <Text style={styles.dateText}>Listed on: {estate.created_at}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  mainImage: { width: '100%', height: 220, borderRadius: 10,paddingTop:35 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  ratingBox: { flexDirection: 'row', alignItems: 'center' },
  location: { color: 'gray', marginTop: 5 },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginTop: 10 },
  descText: { fontSize: 14, color: '#333', marginTop: 5, lineHeight: 20 },
  facilityItem: { fontSize: 14, color: '#444', marginTop: 4 },
  dateText: { color: 'gray', fontSize: 12, marginTop: 20, textAlign: 'right' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
   headerIcons: { 
    position: 'absolute', 
    top: 5, 
    left: 3, 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
   rightIcons: { flexDirection: 'row', gap: 10 },
});
