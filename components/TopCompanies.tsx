import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const BASE_URL = 'https://insighthub.com.ng/';

export default function TopCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchcompanies();
  }, []);

  // ── your original fetch, untouched ──────────────────────────
  const fetchcompanies = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        'https://insighthub.com.ng/NestifyAPI/get_companies.php',
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
        console.log('Companies data:', result.companies || []);
      } else {
        Alert.alert('Error', result.msg || 'Failed to load companies');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* ── Section header ── */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Top Companies</Text>
        <TouchableOpacity onPress={() => router.push('Home/Company/AllCompanies')}>
          <Text style={styles.sectionLink}>Explore →</Text>
        </TouchableOpacity>
      </View>

      {/* ── Loading ── */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#c9a84c" />
        </View>
      ) : companies.length === 0 ? (
        <View style={styles.loader}>
          <Text style={styles.emptyText}>No companies yet</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {companies.map((company: any, index: number) => {
            const initial = (company.name ?? company.company_name ?? 'C')[0].toUpperCase();
            // profile_image may be a full URL or a relative path
            const imageUri = company.profile_image
              ? company.profile_image.startsWith('http')
                ? company.profile_image
                : `${BASE_URL}${company.profile_image}`
              : null;

            return (
              <TouchableOpacity
                key={company.id ?? index}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/Home/CompanyScreen',
                    params: { id: String(company.id) },
                  })
                }
              >
                {/* Logo */}
                <View style={styles.logoWrap}>
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.logo}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.logo, styles.logoFallback]}>
                      <Text style={styles.logoInitial}>{initial}</Text>
                    </View>
                  )}
                </View>

                {/* Name */}
                <Text style={styles.name} numberOfLines={2}>
                  {company.name ?? company.company_name ?? 'Company'}
                </Text>

                {/* Property count */}
                {company.property_count ? (
                  <Text style={styles.count}>{company.property_count} props</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0a0a0f',
    letterSpacing: -0.2,
  },
  sectionLink: {
    fontSize: 12,
    color: '#c9a84c',
    fontWeight: '500',
  },

  loader: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8a8a9a',
  },

  scroll: {
    paddingHorizontal: 16,
    gap: 11,
    paddingBottom: 4,
  },

  card: {
    width: 95,
    alignItems: 'center',
    gap: 7,
    paddingVertical: 12,
    paddingHorizontal: 9,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8e4dd',
    borderRadius: 16,
  },

  logoWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e8e4dd',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  logoFallback: {
    backgroundColor: '#dde8f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#185FA5',
  },

  name: {
    fontSize: 11,
    color: '#0a0a0f',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  count: {
    fontSize: 10,
    color: '#8a8a9a',
  },
});
