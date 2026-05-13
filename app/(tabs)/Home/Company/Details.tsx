// app/Home/Details/[id].js

import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import NearbyProperties from '../../../../components/NearbyProperties';
import LikeButton from '@/components/LikeButton';
import { useCompanyReviews } from '@/hooks/useCompanyReviews';
import { initiateChat } from '@/hooks/useChat';
import PricingModal from '@/components/PricingModal';
import PremiumLoader from '@/components/PremiumLoader';
import { useToast } from '@/components/Toast';
import GetRelatedProperties from '@/components/GetRelatedProperties';
import { Video } from 'expo-av';

const COLORS = {
  bg: '#091530',
  card: '#0f2044',
  gold: '#c9a84c',
  goldLight: '#f0d98a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(201,168,76,0.25)',
  mutedCard: '#0b1a33',
  success: '#22c55e',
  danger: '#ef4444',
};



interface CompanyData {
  company_name?: string;
  [key: string]: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDE_MARGIN = SCREEN_WIDTH * 0.04;
const CAROUSEL_WIDTH = SCREEN_WIDTH - SIDE_MARGIN * 2;

const formatPrice = (price: any) => {
  return Number(String(price).replace(/,/g, '')).toLocaleString();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


export default function PropertyDetails() {
  const { show } = useToast();
  const router = useRouter();
  const { id } = useLocalSearchParams() as { id: string };
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [pricingVisible, setPricingVisible] = useState(false);

  const { reviews, summary, loading: reviewsLoading } = useCompanyReviews(
    Number(property?.user_id)
  );

  // Truncate text to a specific length
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleChatAction = async (type: 'chat' | 'inspection') => {
    const userJson = await AsyncStorage.getItem('authUser');
    if (!userJson) return;
    const user = JSON.parse(userJson);

    // Premium check — freemium users see upgrade prompt
    if (user.plan_type !== 'premium') {
      show({
        type: 'warning',
        title: '⭐ Premium Feature',
        message: 'Chat with sellers is available for premium members only. Upgrade to unlock unlimited messaging.',
        action: {
          label: 'Upgrade',
          onPress: () => setPricingVisible(true),
        },
      });
      return;
    }

    setChatLoading(true);
    const openingMessage = type === 'inspection'
      ? `Hi, I'd like to book an inspection for "${property.propertyName}". Are you available?`
      : `Hi, I'm interested in "${property.propertyName}". Is it still available?`;

    const result = await initiateChat(
      property.user_id,   // seller
      property.id,        // property
      openingMessage
    );
    setChatLoading(false);

    if (result.success && result.conversationId) {
      router.push({
        pathname: '../ChatRoom',
        params: {
          conversation_id: result.conversationId,
          property_name: property.propertyName,
          property_id: property.id,
        },
      });
    } else if (result.notPremium) {
      // Server-side premium check failed too
      show({ type: 'error', title: 'Premium Required', message: result.msg ?? 'Upgrade to chat with sellers.' });
    } else {
      show({ type: 'error', title: 'Error', message: result.msg ?? 'Could not start chat' });
    }
  };

  useEffect(() => {
    if (id) {
      fetchPropertyById();
    }
  }, [id]);

  useEffect(() => {
    if (property) {
      fetchCompanyProfile();
    }
  }, [property]);


  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const userJson = await AsyncStorage.getItem("authUser");
      if (!token || !userJson) {
        console.log("Error", "Not authenticated");
        setLoading(false);
        return;
      }
      const userObj = JSON.parse(userJson);
      setUser(userObj);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const fetchPropertyById = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/get_property_by_id.php?id=${id}`,
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
        setProperty(result.property);
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


  const fetchCompanyProfile = async () => {
    try {
      if (!property || !property.user_id) {
        show({ type: 'error', title: 'Error', message: 'Property data not available' });
        return;
      }

      const token = await AsyncStorage.getItem('authToken');
      const user = property.user_id;

      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/get_user_by_id.php?id=${user}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log('Company Profile Response:', result);

      if (result.status === 'success') {
        setCompanyData(result.data);

        // Fetch review summary
        const summaryResponse = await fetch(
          `https://insighthub.com.ng/NestifyAPI/company_reviews.php?action=list&company_id=${user}&page=1&limit=0`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${token}`,
            },
          }
        );
        const summaryResult = await summaryResponse.json();
        if (summaryResult.status === 'success') {
          setCompanyData(prev => ({ ...prev, review_count: summaryResult.summary.total, average_rating: summaryResult.summary.average }));
        }
      } else {
        show({ type: 'error', title: 'Error', message: result.msg });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      show({ type: 'error', title: 'Error', message: errorMessage });
    }
  };


  const trackedRef = useRef(false);

  useEffect(() => {
    const trackView = async () => {
      if (trackedRef.current || !id) return;
      trackedRef.current = true;

      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return;

        await fetch('https://insighthub.com.ng/NestifyAPI/track_property_view.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            property_id: Number(id),
          }),
        });
      } catch (error) {
        console.log('Track view error:', error);
      }
    };

    trackView();
  }, [id]);

  // 2) Carousel logic
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const windowWidth = Dimensions.get('window').width;
  const carouselWidth = windowWidth * 0.92;
  const sideMargin = windowWidth * 0.04;
  let autoScrollInterval: any;

  useEffect(() => {
    if (property && property.images && property.images.length > 1) {
      // Auto‐scroll every 3 seconds
      autoScrollInterval = setInterval(() => {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= property.images.length) {
          nextIndex = 0;
        }
        setCurrentIndex(nextIndex);
        scrollRef.current?.scrollTo({
          x: nextIndex * carouselWidth,
          animated: true,
        });
      }, 3000);
    }
    return () => {
      clearInterval(autoScrollInterval);
    };
  }, [property, currentIndex]);





  if (loading) {
    return <PremiumLoader />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }
  if (!property) {
    return <PremiumLoader />;

  }



  const images: string[] = property.images ?? [];

  const statusColor =
    property.status === "available"
      ? "#28a745"
      : property.status === "sold"
        ? "#dc3545"
        : "#6c757d";

  const statusLabel =
    property.status === "available"
      ? "Available"
      : property.status === "sold"
        ? "Sold"
        : "Unavailable";

  const listingLabel =
    property.listingType === "Rent"
      ? "Rent"
      : property.listingType === "Sell"
        ? "For Sale"
        : "Rent / Sell";

  const priceDisplay =
    property.listingType === "Sell"
      ? `₦${formatPrice(property.sellPrice)}`
      : property.listingType === "Rent"
        ? `₦${formatPrice(property.rentPrice)}`
        : `₦${formatPrice(property.sellPrice)} / ₦${formatPrice(property.rentPrice)}`;

  const priceSub =
    property.listingType === "Rent"
      ? `Per ${property.rentPeriod ?? "year"}`
      : "Outright sale";

  const specs = [
    { icon: "bed", val: property.bedrooms, label: "Bedrooms" },
    { icon: "bathtub", val: property.Toilet, label: "Bathrooms" },
    { icon: "meeting-room", val: property.totalRooms, label: "Total rooms" },
    { icon: "home", val: property.BQ, label: "BQ" },
    { icon: "balcony", val: property.balconies, label: "Balconies" },
    { icon: "local-parking", val: property.parkingspace, label: "Parking" },
  ].filter((s) => s.val && Number(s.val) !== 0);

  const details = [
    { label: "Category", val: property.propertyCategoryName ?? property.category_name },
    { label: "Subcategory", val: property.propertySubCategoryName ?? property.subcategory_name },
    { label: "Condition", val: property.condition },
    { label: "Furnishing", val: property.Furnishing },
    { label: "Document", val: property.documentType },
    { label: "Size", val: property.size ? `${property.size} sqm` : null },
    { label: "Sales type", val: property.salesType },
    { label: "Listed", val: property.created_at ? formatDate(property.created_at) : null },
  ].filter((d) => d.val);


  return (
    <FlatList
      data={[]}
      renderItem={() => null}
      keyExtractor={(_, i) => i.toString()}
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      ListHeaderComponent={
        <>
          {/* ── Hero Carousel ── */}
          <View style={styles.heroContainer}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / CAROUSEL_WIDTH
                );
                setActiveIndex(idx);
              }}
              style={{
                width: CAROUSEL_WIDTH,
                height: 450,
                marginHorizontal: SIDE_MARGIN,
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              {images.length > 0 ? (
                images.map((imgPath, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: `https://insighthub.com.ng/${imgPath}` }}
                    style={{ width: CAROUSEL_WIDTH, height: 450 }}
                    resizeMode="cover"
                  />
                ))
              ) : (
                <View
                  style={{
                    width: CAROUSEL_WIDTH,
                    height: 450,
                    backgroundColor: "#d0e8f0",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons name="home" size={60} color="#aaa" />
                </View>
              )}
            </ScrollView>

            {/* Top icons */}
            <View style={styles.heroTop}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={styles.heroActions}>
                <TouchableOpacity style={styles.actBtn}>
                  <AntDesign name="upload" size={17} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actBtn}
                  onPress={() => { }} // handled internally by LikeButton
                >
                  <LikeButton
                    propertyId={Number(id)}
                    variant="minimal"
                    size={17}
                    color="red"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom: badges + thumbnails */}
            <View style={styles.heroBottom}>
              <View style={styles.badges}>
                <Text style={[styles.badge, { backgroundColor: statusColor }]}>
                  {statusLabel}
                </Text>
                <Text style={[styles.badge, { backgroundColor: "#25B4F8" }]}>
                  {listingLabel}
                </Text>
              </View>
              <View style={styles.thumbsCol}>
                {images.slice(0, 2).map((imgPath, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: `https://insighthub.com.ng/${imgPath}` }}
                    style={styles.thumb}
                  />
                ))}
                {images.length > 2 && (
                  <View style={styles.moreThumb}>
                    <Text style={styles.moreText}>+{images.length - 2}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Dots */}
            {images.length > 1 && (
              <View style={styles.dots}>
                {images.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === activeIndex && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* ── Body ── */}
          <View style={styles.body}>

            {/* Title + Price */}
            <View style={styles.titleRow}>
              <Text style={styles.propTitle} numberOfLines={2}>
                {property.propertyName}
              </Text>
              <View style={styles.priceCol}>
                <Text style={styles.price}>{priceDisplay}</Text>
                <Text style={styles.priceSub}>{priceSub}</Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={14} color="#888" />
              <Text style={styles.locText}>
                📍 {[property.city, property.state, property.country]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </View>

            {/* CTA Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnChat}
                onPress={() => handleChatAction('chat')}
                disabled={chatLoading}
              >
                {chatLoading
                  ? <ActivityIndicator size="small" color="#C9A84C" />
                  : <Text style={styles.btnChatText}>💬 Chat With Seller</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnBook}
                onPress={() => handleChatAction('inspection')}
                disabled={chatLoading}
              >

                {chatLoading
                  ? <ActivityIndicator size="small" color="#C9A84C" />
                  : <Text style={styles.btnBookText}>📅 Book Inspection</Text>
                }
              </TouchableOpacity>
            </View>

            {/* Agent Card */}
            <View style={styles.agentCard}>
              {companyData?.profile_image ? (
                <Image
                  source={{ uri: companyData.profile_image }}
                  style={styles.agentImg}
                />
              ) : (
                <View style={styles.agentAvatar}>
                  <Text style={styles.agentInitials}>
                    {(companyData?.company_name ?? "?")[0].toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.agentName} numberOfLines={1}>
                  {companyData?.company_name ?? "Company Name"}
                </Text>
                <Text style={styles.agentLoc} numberOfLines={1}>
                  {[companyData?.city, companyData?.state]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </View>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#007bff" />
            </View>


            {property?.video && (
              <Video
                source={{ uri: `https://insighthub.com.ng/${property.video}` }}
                useNativeControls
                style={{ width: "100%", height: 250, marginTop: 10, borderRadius: 20 }}
              />
            )}
            <View style={styles.divider} />

            {/* Specs */}
            {specs.length > 0 && (
              <>
                <Text style={styles.secTitle}>Property specs</Text>
                <View style={styles.specsWrap}>
                  {specs.map((s, i) => (
                    <View key={i} style={styles.specChip}>
                      <MaterialIcons
                        name={s.icon as any}
                        size={15}
                        color="#888"
                      />
                      <Text style={styles.specVal}>{s.val}</Text>
                      <Text style={styles.specLbl}>{s.label}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.divider} />
              </>
            )}

            {/* Details grid */}
            {details.length > 0 && (
              <>
                <Text style={styles.secTitle}>Property details</Text>
                <View style={styles.infoGrid}>
                  {details.map((d, i) => (
                    <View key={i} style={styles.infoItem}>
                      <Text style={styles.infoLbl}>{d.label}</Text>
                      <Text style={styles.infoVal} numberOfLines={1}>
                        {d.val}
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={styles.divider} />
              </>
            )}

            {/* Description */}
            {property.description ? (
              <>
                <Text style={styles.secTitle}>Description</Text>
                <Text style={styles.desc}>{property.description}</Text>
                <View style={styles.divider} />
              </>
            ) : null}

            {/* Location detail */}
            <Text style={styles.secTitle}>Location</Text>
            {property.location ? (
              <View style={styles.locBox}>
                <Ionicons name="location-outline" size={14} color="#888" />
                <Text style={styles.locBoxText}>{property.location}</Text>
              </View>
            ) : null}
            <View style={styles.locBox}>
              <Ionicons name="map-outline" size={14} color="#888" />
              <Text style={styles.locBoxText}>
                {[property.city, property.state, property.country]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>

            <View style={styles.divider} />






            {/* ── Reviews ── */}
            <Text style={styles.secTitle}>Agent Reviews</Text>

            {/* Summary row */}
            {summary && summary.total > 0 && (
              <View style={styles.reviewSummary}>
                <Text style={styles.reviewRating}>⭐ {summary.average.toFixed(1)}</Text>
                <Text style={styles.reviewSub}>From {summary.total} reviewer{summary.total !== 1 ? 's' : ''}</Text>
              </View>
            )}

            {/* Preview cards — max 2 */}
            {reviewsLoading ? (
              <ActivityIndicator style={{ marginVertical: 10 }} color="#C9A84C" />
            ) : reviews.length === 0 ? (
              <View style={styles.reviewCard}>
                <Text style={{ color: '#aaa', fontSize: 13, textAlign: 'center', paddingVertical: 10 }}>
                  No reviews yet for this agent
                </Text>
              </View>
            ) : (
              reviews.slice(0, 2).map(item => (
                <View key={item.id} style={styles.reviewCard}>
                  <View style={styles.rvUserRow}>
                    {item.reviewer_avatar ? (
                      <Image
                        source={{ uri: item.reviewer_avatar }}
                        style={styles.rvAvatar}
                      />
                    ) : (
                      <View style={[styles.rvAvatar, {
                        backgroundColor: '#B5D4F4',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }]}>
                        <Text style={[styles.rvInitials, { color: '#0C447C' }]}>
                          {(item.reviewer_name ?? '?')[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text style={styles.rvName}>{item.reviewer_name}</Text>
                      <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <MaterialIcons
                            key={i}
                            name="star"
                            size={12}
                            color={i < item.rating ? '#ffc107' : '#ddd'}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.rvText} numberOfLines={2}>
                    {item.comment}
                  </Text>
                </View>
              ))
            )}

            {/* View all button */}
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() =>
                router.push({
                  pathname: './CompanyReviews',
                  params: {
                    company_id: property?.user_id,
                    company_name: companyData?.company_name,
                    company_image: companyData?.profile_image,
                  },
                })
              }
            >
              <Text style={styles.viewAllText}>
                {summary && summary.total > 2
                  ? `View all ${summary.total} reviews`
                  : 'View all reviews'}
              </Text>
            </TouchableOpacity>




            {/* similar Listings */}


            <GetRelatedProperties propertyId={property?.id} />


            <PricingModal
              visible={pricingVisible}
              onSelectPlan={(planKey) => {
                setPricingVisible(false);

                switch (planKey) {
                  case "freemium":
                    setPricingVisible(false);
                    break;
                  case "single":
                    router.push("/upgrade/single");
                    break;
                  case "monthly":
                    router.push("/upgrade/monthly");
                    break;
                  case "semi":
                    router.push("/upgrade/semiannual");
                    break;
                  case "annual":
                    router.push("/upgrade/annual");
                    break;
                  default:
                    router.push("/upgrade");
                }
              }}
              onClose={() => setPricingVisible(false)}
            />

          </View>

        </>
      }
    />
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: getStatusBarHeight(),
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },

  // ── Hero ──
  heroContainer: {
    position: 'relative',
    marginBottom: 4,
    backgroundColor: COLORS.bg,
  },
  heroTop: {
    position: 'absolute',
    top: 16,
    left: SIDE_MARGIN + 12,
    right: SIDE_MARGIN + 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroActions: { flexDirection: 'row', gap: 8 },
  actBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(15,32,68,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroBottom: {
    position: 'absolute',
    bottom: 14,
    left: SIDE_MARGIN + 12,
    right: SIDE_MARGIN + 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 20,
  },
  badges: { flexDirection: 'row', gap: 8 },
  badge: {
    color: COLORS.bg,
    fontSize: 11,
    fontWeight: '700',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.gold,
  },
  thumbsCol: { flexDirection: 'column', gap: 5 },
  thumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  moreThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: 'rgba(9,21,48,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moreText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 13 },
  dots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    zIndex: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    width: 18,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 10,
    color: COLORS.textPrimary,
  },

  // ── Body ──
  body: {
    padding: 16,
    backgroundColor: COLORS.bg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  propTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginRight: 10,
    lineHeight: 25,
  },
  priceCol: { alignItems: 'flex-end' },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.gold,
  },
  priceSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 14,
  },
  locText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // CTA
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  btnChat: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnChatText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
  },
  btnBook: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  btnBookText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.bg,
    textTransform: 'uppercase',
  },

  // Agent
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    marginBottom: 16,
  },
  agentImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  agentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bg,
  },
  agentName: {
    fontWeight: '700',
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  agentLoc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  divider: {
    height: 0.5,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  secTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },

  // Specs
  specsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  specVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  specLbl: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  // Details grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  infoItem: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoLbl: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  desc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },

  // Location boxes
  locBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locBoxText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // Reviews
  reviewSummary: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  reviewRating: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.goldLight,
  },
  reviewSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rvUserRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
    alignItems: 'center',
  },
  rvAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rvInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.bg,
  },
  rvName: {
    fontWeight: '700',
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  rvText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  viewAllBtn: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    padding: 11,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  viewAllText: {
    color: COLORS.gold,
    fontWeight: '700',
    fontSize: 13,
  },
});

