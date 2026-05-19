// CompanyScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { initiateChat } from '@/hooks/useChat';
import PremiumLoader from "@/components/PremiumLoader";
import { useToast } from "@/components/Toast";
import FeaturedCompanies from "@/components/FeaturedCompanies";
import RelatedCompanies from "@/components/RelatedCompany";

const COLORS = {
  bg: '#091530',
  card: '#0f2044',
  gold: '#c9a84c',
  goldLight: '#f0d98a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  border: 'rgba(255,255,255,0.06)',
  danger: '#ef4444'
};
/**
 * Dummy data (ready to use)
 */
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
    { id: 1, name: "24/7 Security", icon: "shield-checkmark" },
    { id: 2, name: "Clean Water", icon: "water-outline" },
    { id: 3, name: "Electricity", icon: "flash-outline" },
    { id: 4, name: "Parking Space", icon: "car-outline" },
    { id: 5, name: "CCTV", icon: "videocam-outline" },
  ],
  estates: [
    { id: "e1", name: "Greenwood Estate", city: "Lekki", properties: 17, image: "https://images.pexels.com/photos/259962/pexels-photo-259962.jpeg" },
    { id: "e2", name: "Sunset Villas", city: "Ajah", properties: 9, image: "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg" },
    { id: "e3", name: "Harbor Heights", city: "VI", properties: 12, image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg" },
  ],
  properties: [
    {
      id: 101,
      title: "4 Bed Luxury Duplex",
      price: "₦250,000,000",
      city: "Lekki",
      image: "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg",
      beds: 4,
      baths: 4,
      area: "420 sqm",
      listingType: "Sell",
    },
    {
      id: 102,
      title: "3 Bed Serviced Apartment",
      price: "₦180,000,000",
      city: "Victoria Island",
      image: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
      beds: 3,
      baths: 3,
      area: "300 sqm",
      listingType: "Sell",
    },
    {
      id: 103,
      title: "2 Bed Smart Home",
      price: "₦120,000,000",
      city: "Ajah",
      image: "https://images.pexels.com/photos/703140/pexels-photo-703140.jpeg",
      beds: 2,
      baths: 2,
      area: "200 sqm",
      listingType: "Sell",
    },
    {
      id: 104,
      title: "1 Bed Studio Apartment (Rent)",
      price: "₦280,000 /month",
      city: "Lekki",
      image: "https://images.pexels.com/photos/259962/pexels-photo-259962.jpeg",
      beds: 1,
      baths: 1,
      area: "55 sqm",
      listingType: "Rent",
    },
    // add more items to test grid behaviour...
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
  },
  brochure:
    "https://www.africahousingnews.com/wp-content/uploads/2023/01/sample-estate-brochure.pdf",
};

/* ----------------------------- Screen ----------------------------- */

export default function EstateCompanyScreen() {
  const { show } = useToast();
  const router = useRouter();
  const [company] = useState(estateCompany); // using dummy directly for now

  const { id } = useLocalSearchParams();
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [Estates, setEstates] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);



  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);




  const formatPrice = (price: any) => {
    const n = Number(String(price ?? 0).replace(/,/g, ''));
    return Number.isFinite(n) ? n.toLocaleString() : '0';
  };


  useEffect(() => {
    if (id) {
      fetchCompanyById();
    }
  }, [id]);


  useEffect(() => {
    if (companyDetails?.id) {
      fetchPropertiesByCompany();
      fetchEstatesByCompany();
    }
  }, [companyDetails]);



  const fetchCompanyById = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/get_CompanyById.php?id=${id}`,
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
        setCompanyDetails(result.user);
        setLoading(false)

      } else {
        const msg = result.msg || 'Failed to load property details';
        setError(msg);
        show({ type: 'error', title: 'Error', message: msg });
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message);
      show({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };


  const fetchPropertiesByCompany = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/get_Company_properties.php?companyId=${companyDetails.id}&approval_status=approved`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setProperties(result.properties ?? []);

        console.log(
          "approved properties.....",
          result.properties
        );
      } else {
        const msg =
          result.msg || "Failed to load property details";

        setError(msg);

        show({
          type: "error",
          title: "Error",
          message: msg,
        });
      }
    } catch (err: any) {
      setError(err.message);

      show({
        type: "error",
        title: "Error",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    trackView();
  }, []);

  const trackView = async () => {

    try {

      const token = await AsyncStorage.getItem('authToken');

      await fetch(
        'https://insighthub.com.ng/NestifyAPI/track_company_view.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Token ' + (token ?? ''),
          },
          body: JSON.stringify({
            company_id: id,
          }),
        }
      );

    } catch (e) {
      console.log(e);
    }
  };

  const fetchEstatesByCompany = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/get_Company_Estate.php?companyId=${companyDetails.id}`,
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
        setEstates(result.Estates);
        console.log(Estates)
      } else {
        const msg = result.msg || 'Failed to load property details';
        setError(msg);
        show({ type: 'error', title: 'Error', message: msg });
      }
    } catch (err: any) {
      setError(err.message);
      show({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChatAction = async (type: 'chat' | 'inspection') => {
    const userJson = await AsyncStorage.getItem('authUser');
    if (!userJson) return;
    const currentUser = JSON.parse(userJson);

    if (currentUser.plan_type !== 'premium') {
      show({
        type: 'warning',
        title: '⭐ Premium Feature',
        message: 'Chat with agents is available for premium members only.',
        action: {
          label: 'Upgrade',
          onPress: () => router.push('/Subscription'),
        },
      });
      return;
    }

    setChatLoading(true);

    // ── General enquiry — no property needed ─────────────────────────────────
    const sellerId = companyDetails?.id;
    const openingMessage = type === 'inspection'
      ? `Hi, I'd like to schedule an inspection. Are you available?`
      : `Hi, I'm interested in your properties. Can we talk?`;

    const result = await initiateChat(
      sellerId,
      null,           // ← null = general enquiry, no specific property
      openingMessage,
      'general'
    );

    setChatLoading(false);

    if (result.success && result.conversationId) {
      router.push({
        pathname: '/Home/ChatRoom',
        params: {
          conversation_id: result.conversationId,
          property_name: companyDetails?.company_name ?? 'General Enquiry',
          property_id: '',   // empty string — no property to tap through to
          company_id: companyDetails?.id ?? '',
        },
      });
    } else if (result.notPremium) {
      show({ type: 'error', title: 'Premium Required', message: result.msg ?? 'Upgrade to chat.' });
    } else {
      show({ type: 'error', title: 'Error', message: result.msg ?? 'Could not start chat' });
    }
  };

  // CTA handlers (replace with real flows)
  const onBookInspection = useCallback(() => {
    show({
      type: 'info',
      title: 'Book Inspection',
      message: 'Booking flow not implemented yet. Open contact options?',
      action: {
        label: 'Call',
        onPress: () => {
          Linking.openURL(`tel:${companyDetails.phone}`).catch(() =>
            show({ type: 'error', title: 'Error', message: 'Could not open dialer' })
          );
        },
      },
    });
  }, [company]);

  const onChatWithAgent = useCallback(() => {
    handleChatAction('chat');
  }, [properties, companyDetails]);

  const onDownloadBrochure = useCallback(() => {
    const url = company.brochure;
    Linking.openURL(url).catch(() =>
      show({ type: 'error', title: 'Error', message: 'Could not open brochure URL' })
    );
  }, [company]);

  const onOpenWebsite = useCallback(() => {
    Linking.openURL(companyDetails?.website).catch(() =>
      show({ type: 'error', title: 'Error', message: 'Could not open website' })
    );
  }, [company]);

  const renderProperty = useCallback(


    ({ item }: ListRenderItemInfo<any>) => {
      return (
        <>


          <TouchableOpacity
            style={styles.propertyCard}
            onPress={() =>
              router.push({ pathname: "/Home/Properties/Details", params: { id: String(item.id) } })
            }
          >
            <Image
              source={{ uri: `https://insighthub.com.ng/${item.images[0]}` }}
              style={styles.propertyImage}
            />

            <View style={styles.propertyBody}>
              <Text numberOfLines={1} style={styles.propertyTitle}>
                {item.propertyName}
              </Text>


              <Text style={styles.propertyPrice}>
                {item.listingType === "Rent"
                  ? `₦${formatPrice(item.rentPrice)}`
                  : item.listingType === "Sell"
                    ? `₦${formatPrice(item.sellPrice)}`
                    : `₦${formatPrice(item.sellPrice)} / ₦${formatPrice(item.rentPrice)}`}
              </Text>

              <Text style={styles.propertyMeta}>


                {item.listingType === "Rent"
                  ? `Rent`
                  : item.listingType === "Sell"
                    ? `Sell`
                    : `Sell / Rent`}
              </Text>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.propertyLocation}>{item.city}</Text>
                <Text style={styles.propertyLocation}>{item.status}</Text>
              </View>

            </View>
          </TouchableOpacity></>
      );
    },
    [router]
  );


  // Header component (ListHeaderComponent)
  const ListHeader = useMemo(() => {
    return (
      <View>
        {/* Cover image & badges */}
        <View>
          <Image source={{ uri: companyDetails?.cover_image }} style={styles.coverImage} />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={20} color={COLORS.danger} />
          </TouchableOpacity>

          {/* Floating logo */}
          <View style={styles.logoWrap}>
            <Image source={{ uri: companyDetails?.profile_image }} style={styles.logo} />
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.section}>

          <Text style={styles.title}> {companyDetails?.company_name || companyDetails?.name}</Text>
          <Text style={styles.subtitle}>
            <Ionicons name="location-outline" size={14} />
            {companyDetails?.city}, {companyDetails?.state}
          </Text>



          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{companyDetails?.average_rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {new Date(companyDetails?.date_established).getFullYear()}
              </Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{properties.length}</Text>
              <Text style={styles.statLabel}>Properties</Text>
            </View>
          </View>

          {/* CTA Row */}
          <View style={styles.ctaRow}>

            <TouchableOpacity
              style={styles.ctaBtnOutline}
              onPress={onChatWithAgent}
              disabled={chatLoading}
            >
              {chatLoading
                ? <ActivityIndicator size="small" color={COLORS.gold} />
                : <Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.gold} />
              }
              <Text style={styles.ctaTextOutline}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaBtnOutline} onPress={onDownloadBrochure}>
              <Ionicons name="download-outline" size={16} color={COLORS.gold} />
              <Text style={styles.ctaTextOutline}>Brochure</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={[styles.section, styles.sectionNoPadTop]}>
          <Text style={styles.sectionTitle}>About</Text>
          {companyDetails?.about ? (
            <Text style={styles.bodyText}>{companyDetails.about}</Text>
          ) : (
            <Text style={styles.bodyText}>No description available.</Text>
          )}

        </View>

        {/* Amenities */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesRow}>
            {company.amenities.map((a) => (
              <View key={a.id} style={styles.amenityBox}>
                <Ionicons name={a.icon as any} size={18} color="#091530" />
                <Text style={styles.amenityText}>{a.name}</Text>
              </View>
            ))}
          </View>
        </View> */}

        {/* Estates (horizontal) */}
        <View style={{ ...styles.section, paddingBottom: 10 }}>

          {Estates.length === 0 ? (
            <Text style={styles.bodyText}> </Text>
          ) : (
            <>


              <View style={{ ...styles.rowSpace, marginBottom: 8 }}>
                <Text style={styles.sectionTitle}>Estates</Text>
                <TouchableOpacity onPress={() => router.push({ pathname: '/Home/Estates/AllEstates', params: { companyId: String(companyDetails?.id) } })}>
                  <Text style={styles.linkText}>See all</Text>
                </TouchableOpacity>
              </View>

            </>
          )}

          <FlatList
            data={Estates}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(it) => it.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.estateCard} onPress={() =>
                router.push({ pathname: '/Home/EstateCompanyDetails', params: { id: String(item.id) } })
              }>
                <Image source={{ uri: item.image_path }} style={styles.estateImage} />
                <Text style={styles.estateName}>{item.name}</Text>
                <Text style={styles.estateMeta}>
                  {item.num_properties} properties
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>




        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.contactText}>📍 {companyDetails?.address}</Text>
          <Text style={styles.contactText}>📞 {companyDetails?.phone}</Text>
          <Text style={styles.contactText}>✉ {companyDetails?.email}</Text>
          <TouchableOpacity onPress={onOpenWebsite}>
            <Text style={[styles.contactText, styles.linkText]}>{companyDetails?.website}</Text>
          </TouchableOpacity>
        </View>



        <View style={{ height: 12 }} />

        {
          properties.length !== 0 ? (
            <View style={{ ...styles.rowSpace, marginBottom: 8 }}>
              <Text style={{ ...styles.sectionTitle, width: "40%" }}>Properties by {companyDetails?.company_name || companyDetails?.name}</Text>


              <TouchableOpacity onPress={() => router.push({ pathname: '/Home/Company/CompanyProperties', params: { id: String(companyDetails?.id), company_name: companyDetails?.company_name || companyDetails?.name } })}>
                <Text style={styles.linkText}>See all</Text>
              </TouchableOpacity>

            </View>
          ) : (
            <View style={{ paddingHorizontal: 4, marginBottom: 16 }}>
              <Text style={{ ...styles.sectionTitle, marginBottom: 12 }}>Properties</Text>
              <View style={{ backgroundColor: COLORS.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
                <Ionicons name="home-outline" size={40} color={COLORS.gold} />
                <Text style={{ marginTop: 12, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' }}>
                  This company has no properties yet
                </Text>
                <Text style={{ marginTop: 6, fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' }}>
                  Check back soon for new listings
                </Text>
              </View>
            </View>
          )
        }

      </View>
    );
  }, [company, companyDetails, Estates, onBookInspection, onChatWithAgent, onDownloadBrochure, onOpenWebsite, router]);



  if (loading) {
    return <PremiumLoader />;
  }

  if (!companyDetails) {
    return (
      <View style={styles.center}>
        <Text>Company not found.</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={properties}
      numColumns={2} // grid
      keyExtractor={(item) => String(item.id)}
      renderItem={renderProperty}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={() => (
        <View style={{ marginTop: 20 }}>
          <RelatedCompanies companyId={companyDetails?.id} />
        </View>
      )}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={() => (
        <View style={styles.center}>
          <Text> </Text>
        </View>
      )}
    />
  );
}



/* ----------------------------- Styles ----------------------------- */

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 40,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 12,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: COLORS.bg },

  /* Cover */
  coverImage: { width: "100%", height: 220, borderRadius: 6, marginBottom: 12 },
  backButton: {
    position: "absolute",
    top: 18,
    left: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  favoriteButton: {
    position: "absolute",
    top: 18,
    right: 14,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },
  logoWrap: {
    position: "absolute",
    bottom: -28,
    left: 18,
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: COLORS.card,
    elevation: 3,
    backgroundColor: COLORS.card,
  },
  logo: { width: "100%", height: "100%" },

  /* Sections */
  section: { paddingVertical: 8, paddingHorizontal: 4 },
  sectionNoPadTop: { paddingTop: 0 },
  title: { fontSize: 20, fontWeight: "700", color: COLORS.textPrimary, marginTop: 18 },
  subtitle: { marginTop: 6, color: COLORS.textSecondary, fontSize: 13 },
  statsRow: { flexDirection: "row", marginTop: 12 },
  statItem: { marginRight: 18 },
  statValue: { fontSize: 16, fontWeight: "700", color: COLORS.gold },
  statLabel: { color: COLORS.textSecondary, fontSize: 12 },

  ctaRow: { flexDirection: "row", marginTop: 12, justifyContent: "space-between" },
  ctaBtnPrimary: {
    flex: 1,
    marginRight: 8,
    backgroundColor: COLORS.gold,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  ctaBtnOutline: {
    flex: 1,
    marginLeft: 4,
    marginRight: 4,
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  ctaTextPrimary: { color: COLORS.bg, fontWeight: "700", marginLeft: 6 },
  ctaTextOutline: { color: COLORS.gold, fontWeight: "700" },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, color: COLORS.gold },
  bodyText: { color: COLORS.textSecondary, lineHeight: 20 },

  /* Amenities */
  amenitiesRow: { flexDirection: "row", flexWrap: "wrap" },
  amenityBox: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    marginBottom: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amenityText: { marginLeft: 8, fontSize: 13, color: COLORS.textSecondary },

  /* Estates (horizontal) */
  estateCard: {
    width: 180,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  estateImage: { width: "100%", height: 100 },
  estateName: { fontWeight: "700", padding: 8, fontSize: 14, color: COLORS.textPrimary },
  estateMeta: { color: COLORS.textSecondary, paddingHorizontal: 8, paddingBottom: 10, fontSize: 12 },

  /* Gallery */
  galleryGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  galleryImg: { width: "48%", height: 110, borderRadius: 10, marginBottom: 8 },

  /* Contact */
  contactText: { marginTop: 6, fontSize: 14, color: COLORS.textSecondary },
  linkText: { color: COLORS.gold, fontWeight: "700" },

  /* Properties (grid) */
  propertyCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  propertyImage: { width: "100%", height: 110 },
  propertyBody: { padding: 8 },
  propertyTitle: { fontWeight: "700", fontSize: 13, color: COLORS.textPrimary },
  propertyPrice: { color: COLORS.gold, fontWeight: "500", marginTop: 6 },
  propertyMeta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 6 },
  propertyLocation: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },

  /* small helpers */
  rowSpace: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
