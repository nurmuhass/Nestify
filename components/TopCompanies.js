// Topcompanies
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useToast } from './Toast';


export default function TopCompanies() {
  const { show } = useToast();
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
        show({
          type: 'error',
          title: 'Error',
          message: result.msg || 'Failed to load companies',
        });
      }
    } catch (err) {
      show({
        type: 'error',
        title: 'Error',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      ""
    )
  }

  return (
    <View style={{ marginTop: 20, marginBottom: 20 }}>

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        alignItems: 'center'
      }}>
        <Text style={{
          fontWeight: '700',
          fontSize: 18,
          color: '#0f2044'
        }}>
          Top Real Estate Companies
        </Text>

        <TouchableOpacity
          onPress={() => router.push("Home/Company/AllCompanies")}
        >
          <Text style={{
            color: '#c9a84c',
            fontWeight: '600',
            fontSize: 13
          }}>
            Explore →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 14 }}
        contentContainerStyle={{ paddingLeft: 20 }}
      >
        {companies.map((company, index) => (
          <TouchableOpacity
            key={index}
            style={{
              alignItems: 'center',
              marginRight: 16
            }}
            onPress={() =>
              router.push({
                pathname: '/Home/CompanyScreen',
                params: { id: String(company.id) }
              })
            }
          >

            {/* Avatar Card */}
            <View style={{
              backgroundColor: '#f8f6f2',
              borderRadius: 40,
              padding: 4,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 3
            }}>
              <Image
                source={{ uri: company.profile_image }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                }}
              />
            </View>

            {/* Name */}
            <Text
              numberOfLines={1}
              style={{
                width: 90,
                marginTop: 6,
                fontSize: 12,
                color: '#444',
                textAlign: 'center'
              }}
            >
              {company.name}
            </Text>

          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
