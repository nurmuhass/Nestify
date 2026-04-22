// Topcompanies
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';


export default function TopCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchcompanies();
  }, []);

  const fetchcompanies = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch("https://insighthub.com.ng/NestifyAPI/get_companies.php", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token " + (token ?? ""),
        },
      });

      const result = await response.json();

      if (result.status === "success") {
      
        setCompanies(result.companies || []);
        console.log("Companies data:", result.companies || []);
      } else {
        Alert.alert("Error", result.msg || "Failed to load companies");
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
    <View style={{ marginTop: 20 ,marginBottom:20}}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Top Real Estate Companies</Text>

         <TouchableOpacity
                      onPress={() =>
                        router.push("Home/Company/AllCompanies")
                      }
                    >
  <Text style={{ color: '#007bff' }}>explore</Text>

                    </TouchableOpacity>
      
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, paddingLeft: 20 }}>
        {companies.map((company, index) => (
          <TouchableOpacity key={index} style={{ alignItems: 'center', marginRight: 15 }}
          
              onPress={() =>
                        router.push({ pathname: '/Home/CompanyScreen', params: { id: String(company.id) } })
                      }>
            <View style={{ backgroundColor: '#f0f0f0', borderRadius: 30, padding: 3 }}>
<Image source={{uri:company.profile_image}} style={{ width: 60, height: 60, borderRadius: 30,borderColor:'grey', }} />
            </View>
            
           <Text
    style={{
      width:90,
      flexShrink: 1,
      numberOfLines: 1,
      ellipsizeMode: 'tail',
    }}
    numberOfLines={1}
    ellipsizeMode="tail"
  >{company.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
