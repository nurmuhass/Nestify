
import { useRouter } from 'expo-router';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const BASE_URL = 'https://insighthub.com.ng/';

type Props = {
  companies?: any[];
  onCountChange?: (count: number) => void;
};

export default function FeaturedCompanies({
  companies = [],
  onCountChange,
}: Props) {
  const router = useRouter();

  // notify parent count
  if (companies.length > 0 && onCountChange) {
    onCountChange(companies.length);
  }

  return (
    <View>
      {/* ── Header ───────────────────── */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>
          Featured Companies
        </Text>

        <TouchableOpacity
          onPress={() =>
            router.push('/Home/Company/AllCompanies')
          }
        >
          <Text style={styles.sectionLink}>
            Explore →
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Empty State ───────────────── */}
      {companies.length === 0 ? (
        <View style={styles.loader}>
          <Text style={styles.emptyText}>
            No companies available
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {companies.map((company: any, index: number) => {
            const initial = (
              company.name ??
              company.company_name ??
              'C'
            )[0].toUpperCase();

            const imageUri = company.profile_image
              ? company.profile_image.startsWith('http')
                ? company.profile_image
                : `${BASE_URL}${company.profile_image}`
              : null;

            return (
              <TouchableOpacity
                key={company.id ?? index}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname:
                      '/Home/Company/CompanyScreen',
                    params: {
                      id: String(company.id),
                    },
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
                    <View
                      style={[
                        styles.logo,
                        styles.logoFallback,
                      ]}
                    >
                      <Text style={styles.logoInitial}>
                        {initial}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Name */}
                <Text
                  style={styles.name}
                  numberOfLines={2}
                >
                  {company.name ??
                    company.company_name ??
                    'Company'}
                </Text>

                {/* Count */}
                {company.property_count ? (
                  <Text style={styles.count}>
                    {company.property_count} props
                  </Text>
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
    color: '#fff',
    letterSpacing: -0.2,
  },

  sectionLink: {
    fontSize: 12,
    color: '#c9a84c',
    fontWeight: '500',
  },

  loader: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    color: '#8a8a9a',
    fontSize: 14,
  },

  scroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },

  card: {
    width: 105,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 18,

    backgroundColor: 'rgba(255,255,255,0.06)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 10,

    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  logoFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c315d',
  },

  logoInitial: {
    color: '#f0d98a',
    fontSize: 20,
    fontWeight: '700',
  },

  name: {
    fontSize: 11,
    textAlign: 'center',
    color: '#fff',
    lineHeight: 15,
    fontWeight: '600',
    marginBottom: 4,
  },

  count: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
  },
});