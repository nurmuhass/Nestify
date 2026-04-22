// FeaturedEstates
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function FeaturedEstates() {
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);
   const router = useRouter();

  useEffect(() => {
    fetchEstates();
  }, []);

  const fetchEstates = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch("https://insighthub.com.ng/NestifyAPI/get_Estates.php", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token " + (token ?? ""),
        },
      });

      const result = await response.json();

      if (result.status === "success") { 
        setEstates(result.Estates || result.estates || []);
      } else {
        Alert.alert("Error", result.msg || "Failed to load estates");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  
  if (loading) {
  return(
    ""
  )
  }

  return (
    <View style={{ marginTop: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Featured Estates</Text>
           <TouchableOpacity
                      onPress={() =>
                        router.push("Home/Estates/AllEstates")
                      }
                    >
        <Text  style={{ color: '#007bff' }}>view all</Text>
                    </TouchableOpacity>

      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, paddingLeft: 20 }}>
        {estates.map((estate) => (
              <TouchableOpacity
                      key={estate.id}
                      onPress={() =>
                        router.push({ pathname: '/Home/EstateCompanyDetails', params: { id: String(estate.id) } })
                      }
                    >
          <View key={estate.id} style={{ marginRight: 15, backgroundColor: '#f0f0f0', borderRadius: 10, overflow: 'hidden' }}>
            <Image source={{ uri: estate.image_path }} style={{ width: 180, height: 100 }} />
            <View style={{ padding: 10 }}>
              <Text style={{ fontWeight: 'bold' }}>{estate.name}</Text>
              <Text style={{ color: 'gray', marginTop: 5 }}>{estate.location}</Text>
            </View>
          </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
