import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useToast } from './Toast';

export default function TopCompanies() {

  const { show } = useToast();
  const router = useRouter();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {

    try {

      const token = await AsyncStorage.getItem('authToken');

      const response = await fetch(
        'https://insighthub.com.ng/NestifyAPI/get_featured_companies.php',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Token ' + (token ?? ''),
          },
        }
      );

      const result = await response.json();

      if (result.status === 'success') {

        setCompanies(result.companies || []);

      } else {

        show({
          type: 'error',
          title: 'Error',
          message: result.msg || 'Failed to load companies',
        });
      }

    } catch (err: any) {

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
      <View
        style={{
          height: 220,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#c9a84c" />
      </View>
    );
  }

  if (companies.length === 0) return null;

  return (
    <View style={{ marginTop: 24 }}>

      {/* HEADER */}
      <View
        style={{
          paddingHorizontal: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >

        <View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: '#fff',
            }}
          >
            Featured Partners
          </Text>

          <Text
            style={{
              marginTop: 4,
              color: '#64748b',
              fontSize: 13,
            }}
          >
            Trusted premium real estate partners
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/Home/Company/AllCompanies')}
          activeOpacity={0.8}
        >
          <Text
            style={{
              color: '#c9a84c',
              fontWeight: '700',
            }}
          >
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {/* CARDS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 20,
          paddingRight: 10,
        }}
      >

        {companies.map((company: any) => {

          const logo =
            company.profile_image ||
            'https://via.placeholder.com/100';

          const cover =
            company.company_cover_image ||
            company.profile_image;

          return (

            <TouchableOpacity
              key={company.id}
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: '/Home/Company/CompanyScreen',
                  params: {
                    id: String(company.id),
                  },
                })
              }
              style={{
                width: 290,
                marginRight: 18,
                borderRadius: 24,
                overflow: 'hidden',
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 12,
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                elevation: 6,
              }}
            >

              {/* COVER IMAGE */}
              <View style={{ height: 170 }}>

                <Image
                  source={{ uri: cover }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />

                {/* DARK OVERLAY */}
                <LinearGradient
                  colors={[
                    'transparent',
                    'rgba(0,0,0,0.75)',
                  ]}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    top: 0,
                  }}
                />

                {/* PREMIUM BADGE */}
                <View
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    backgroundColor: '#c9a84c',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: '700',
                    }}
                  >
                    PREMIUM
                  </Text>
                </View>

                {/* ONLINE STATUS */}
                {company.is_online == 1 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      backgroundColor: '#22c55e',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#fff',
                        marginRight: 6,
                      }}
                    />

                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: '700',
                      }}
                    >
                      ACTIVE
                    </Text>
                  </View>
                )}

                {/* LOGO */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: -28,
                    left: 18,
                    backgroundColor: '#fff',
                    borderRadius: 18,
                    padding: 4,
                  }}
                >
                  <Image
                    source={{ uri: logo }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                    }}
                  />
                </View>
              </View>

              {/* CONTENT */}
              <View
                style={{
                  paddingTop: 38,
                  paddingHorizontal: 18,
                  paddingBottom: 18,
                }}
              >

                {/* COMPANY NAME */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      flex: 1,
                      fontSize: 18,
                      fontWeight: '800',
                      color: '#0f172a',
                    }}
                  >
                    {company.company_name || company.name}
                  </Text>

                  {company.seller_verified == 1 && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#22c55e"
                    />
                  )}
                </View>

                {/* LOCATION */}
                <Text
                  numberOfLines={1}
                  style={{
                    marginTop: 5,
                    color: '#64748b',
                    fontSize: 13,
                  }}
                >
                  {company.city}, {company.state}
                </Text>

                {/* STATS */}
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 18,
                    justifyContent: 'space-between',
                  }}
                >

                  <View>
                    <Text
                      style={{
                        fontWeight: '800',
                        fontSize: 16,
                        color: '#0f172a',
                      }}
                    >
                      {company.properties_count || 0}
                    </Text>

                    <Text
                      style={{
                        fontSize: 12,
                        color: '#64748b',
                      }}
                    >
                      Listings
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={{
                        fontWeight: '800',
                        fontSize: 16,
                        color: '#0f172a',
                      }}
                    >
                      {company.average_rating || '0.0'}
                    </Text>

                    <Text
                      style={{
                        fontSize: 12,
                        color: '#64748b',
                      }}
                    >
                      Rating
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={{
                        fontWeight: '800',
                        fontSize: 16,
                        color: '#0f172a',
                      }}
                    >
                      {company.review_count || 0}
                    </Text>

                    <Text
                      style={{
                        fontSize: 12,
                        color: '#64748b',
                      }}
                    >
                      Reviews
                    </Text>
                  </View>

                </View>

              </View>

            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}