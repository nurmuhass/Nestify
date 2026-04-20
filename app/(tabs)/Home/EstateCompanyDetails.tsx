import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { initiateChat } from '@/hooks/useChat';

const estateCompany = {
  id: 1,
  name: "GreenVille Estate Developers",
  coverImage:
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",

  logo:
    "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg",

  location: "Lekki Phase 1, Lagos, Nigeria",
  rating: 4.8,
  totalProperties: 12,
  established: "2015",
  verified: true,

  about:
    "GreenVille Estate Developers is a trusted real estate development company specializing in luxury residential homes, serviced apartments, and eco-friendly estates. We focus on delivering modern, secure, and comfortable living environments.",

  amenities: [
    { id: 1, name: "24/7 Security", icon: "shield-check" },
    { id: 2, name: "Clean Water", icon: "droplet" },
    { id: 3, name: "Electricity", icon: "zap" },
    { id: 4, name: "Parking Space", icon: "car" },
    { id: 5, name: "CCTV", icon: "camera" },
  ],

  

  gallery: [
    "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg",
    "https://images.pexels.com/photos/32870/pexels-photo.jpg",
    "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg",
    "https://images.pexels.com/photos/259962/pexels-photo-259962.jpeg",
  ],

  contact: {
    phone: "+234 808 556 8922",
    email: "support@greenvilleestates.com",
    website: "https://greenvilleestates.com",
    address: "21 Freedom Way, Lekki Phase 1, Lagos",
    latitude: 6.4311,
    longitude: 3.4845,
  },

  brochure:
    "https://www.africahousingnews.com/wp-content/uploads/2023/01/sample-estate-brochure.pdf",
};


export default function EstateDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [company, setCompany] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
const [user, setUser] = useState<any>(null);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  
  
    const [estate, setEstate] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (id) {
      fetchEstateById();
    }
  }, [id]); 

useEffect(() => {
  if (estate?.id) {
    fetchPropertiesByEstate();
  }
}, [estate]);  // ✅ triggered when estate loads




  const fetchEstateById = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken');
          const userJson = await AsyncStorage.getItem('authUser');
    if (userJson) {
      setUser(JSON.parse(userJson));
    }
    
      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/get_estate_by_id.php?id=${id}`,
        
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
        setEstate(result.estate);
        console.log("estate........." ,result.estate)
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


  const fetchPropertiesByEstate = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken');
  const response = await fetch(
       `https://insighthub.com.ng/NestifyAPI/get_properties_by_estate.php?estateId=${estate.id}&companyId=${estate.company_id}&page=1&limit=10`, // ✅ use estate from state
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
        setProperties(result.properties);
        console.log("properties....." ,result.properties)
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

  // Load dummy data
  React.useEffect(() => {
    setCompany(estateCompany);
   
  }, []);

const handleChatAction = async (type: 'chat' | 'inspection') => {
  const userJson = await AsyncStorage.getItem('authUser');
  if (!userJson) return;
  const currentUser = JSON.parse(userJson);

  if (currentUser.planType !== 'premium') {
    Alert.alert(
      '⭐ Premium Feature',
      'Chat with agents is available for premium members only.',
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Upgrade', onPress: () => router.push('/Subscription') },
      ]
    );
    return;
  }

  // Guard — make sure we have a seller
  const sellerId = estate?.company_id;
  if (!sellerId) {
    Alert.alert('Error', 'Could not identify the company. Please try again.');
    return;
  }

  setChatLoading(true);

  const openingMessage = type === 'inspection'
    ? `Hi, I'd like to schedule an inspection. Are you available?`
    : `Hi, I'm interested in your properties. Can we talk?`;

  try {
    const result = await initiateChat(sellerId, null, openingMessage, 'general');

    if (result.success && result.conversationId) {
      router.push({
        pathname: '/Home/ChatRoom',
        params: {
          conversation_id: result.conversationId,
          property_name:   estate?.name ?? 'General Enquiry',
          property_id:     '',
        },
      });
    } else if (result.notPremium) {
      Alert.alert('Premium Required', result.msg ?? 'Upgrade to chat.');
    } else {
      Alert.alert('Error', result.msg ?? 'Could not start chat');
    }
  } catch (e: any) {
    Alert.alert('Error', e.message ?? 'Something went wrong');
  } finally {
    setChatLoading(false);  // ← always runs, stops the spinner
  }
};

  

  if (!estate) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
     <ScrollView style={styles.container}>
      {/* Header Image */}
      <View>
        <Image
          source={{ uri: estate.image_path }}
          style={styles.coverImage}
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={22} color="#ff4d4d" />
        </TouchableOpacity>
      </View>

      {/* Company Info */}
      <View style={styles.section}>
        <Text style={styles.title}>{estate.name}</Text>
        <Text style={styles.subtitle}>
          <Ionicons name="location-outline" size={16} /> {estate.location}
        </Text>

        {company.verified && (
          <View style={styles.row}>
            <Ionicons name="shield-checkmark" size={18} color="#0a84ff" />
            <Text style={styles.verified}>Verified Estate Company</Text>
          </View>
        )}
      </View>

      {/* CTA Buttons */}

      <ScrollView contentContainerStyle={{}} horizontal showsHorizontalScrollIndicator={false} scrollEnabled>
      <View style={styles.ctaRow}>
    <TouchableOpacity
  style={styles.ctaBtn}
  onPress={() => handleChatAction('inspection')}
  disabled={chatLoading}
>
  {chatLoading
    ? <ActivityIndicator size="small" color="#fff" />
    : <Ionicons name="calendar-outline" size={18} color="#fff" />
  }
  <Text style={styles.ctaText}>Book Inspection</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.ctaBtn}
  onPress={() => handleChatAction('chat')}
  disabled={chatLoading}
>
  {chatLoading
    ? <ActivityIndicator size="small" color="#fff" />
    : <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
  }
  <Text style={styles.ctaText}>Chat With Company</Text>
</TouchableOpacity>

        <TouchableOpacity style={styles.ctaBtn}>
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.ctaText}>Brochure (PDF)</Text>
        </TouchableOpacity>
      </View>

      </ScrollView>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About the Estate</Text>
        <Text style={styles.bodyText}>{estate.about}</Text>
      </View>

      {/* Amenities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>

  <View style={styles.amenitiesRow}>
  {estate.estate_facilities.map((name, idx) => (
    <View key={idx.toString()} style={styles.amenityBox}>
      <Ionicons name="business-outline" size={20} />
      <Text style={styles.amenityText}>{name}</Text>
    </View>
  ))}
</View>

      </View>

      {/* Properties */}
<View style={{...styles.section,marginBottom:5,}}>
  {properties.length === 0 ? (
    <Text style={styles.bodyText}>No properties available for this estate yet.</Text>
  ) : (
    <>
      <View style={styles.rowSpace}>
        <Text style={{...styles.sectionTitle,marginBottom:5}}>Properties</Text>
        <TouchableOpacity>
          <Text style={{ color: "#0a84ff" }}>See all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={properties}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.propertyCard}
            onPress={() =>
              router.push(`/Home/Company/Details?id=${item.id}`)
            }
          >
            <Image
              source={{ uri: item.images && item.images.length > 0 ? `https://insighthub.com.ng/${item.images[0]}` : estate.image_path }}
              style={styles.propertyImage}
            />

            <Text style={styles.propertyName} numberOfLines={1}>
              {item.propertyName}
            </Text>

            <Text style={styles.propertyPrice}>
              {item.listingType === "Rent"
                ? `₦${item.rentPrice}`
                : item.listingType === "Sell"
                ? `₦${item.sellPrice}`
                : `₦${item.sellPrice} / ₦${item.rentPrice}`}
            </Text>
          </TouchableOpacity>
        )}
      />
    </>
  )}
</View>

      {/* Gallery */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gallery</Text>

        <View style={styles.galleryGrid}>
          {company.gallery.map((img, index) => (
            <Image key={index} source={{ uri: img }} style={styles.galleryImg} />
          ))}
        </View>
      </View>

      {/* Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        <Text style={styles.contactText}>
          📍 Address: {user.address}
        </Text>
        <Text style={styles.contactText}>
          📞 Phone: {user.phone}
        </Text>
        <Text style={styles.contactText}>
          ✉ Email: {user.email}
        </Text>
        <Text style={styles.contactText}>
          🌐 Website: {user.website}
        </Text>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  coverImage: { width: "100%", height: 240 },
  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 30,
  },
  favoriteButton: {
    position: "absolute",
    top: 40,
    right: 15,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 30,
  },

  section: { padding: 16 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { marginTop: 6, color: "#666" },
  verified: { marginLeft: 6, fontSize: 14, color: "#0a84ff" },

  row: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  rowSpace: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bodyText: { lineHeight: 22, color: "#444", marginTop: 6 },

  ctaRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    marginTop: 10,
   
  },
  ctaBtn: {
    backgroundColor: "#0a84ff",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
     marginHorizontal:2
  },
  ctaText: { color: "#fff", fontWeight: "600", fontSize: 12 },

  // Amenities
  amenitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  amenityBox: {
    width: "45%",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f1f5ff",
    borderRadius: 10,
    margin: 5,
  },
  amenityText: { marginLeft: 8, fontSize: 13, fontWeight: "500",flexShrink: 1,  },

  // Properties
  propertyCard: {
    width: 150,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
  },
  propertyImage: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  propertyName: { marginTop: 5, marginLeft: 8, fontWeight: "600" },
  propertyPrice: {
    marginLeft: 38,
    marginBottom: 8,
    color: "#0a84ff",
    fontWeight: "700",
   
  },

  // Gallery
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  galleryImg: {
    width: "48%",
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },

  contactText: { marginTop: 6, fontSize: 14, color: "#333" },
  sectionTitle:{
    marginTop: 6, fontSize: 14, color: "#333"
  }
});
