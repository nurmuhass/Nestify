import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import LikeButton from '@/components/LikeButton';
import PremiumLoader from '@/components/PremiumLoader';
import { useToast } from '@/components/Toast';

const { width } = Dimensions.get('window');

const COLORS = {
    bg: '#091530',
    card: '#0f2044',
    gold: '#c9a84c',
    goldLight: '#f0d98a',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    border: 'rgba(255,255,255,0.06)',
    premium: '#FFD700',
};

type Props = {
    propertyId: number;
};

export default function GetRelatedProperties({ propertyId }: Props) {
    const router = useRouter();
    const { show } = useToast();

    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchRelated(1);
    }, [propertyId]);

    const fetchRelated = async (pageToLoad = 1) => {
        try {
            if (pageToLoad === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            console.log('GetRelatedProperties: Fetching with propertyId:', propertyId);

            const token = await AsyncStorage.getItem('authToken');

            const response = await fetch(
                `https://insighthub.com.ng/NestifyAPI/get_related_properties.php?property_id=${propertyId}&page=${pageToLoad}&limit=10`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Token ' + (token ?? ''),
                    },
                }
            );

            const result = await response.json();
            console.log('GetRelatedProperties: API Response:', result);

            if (response.ok && result.status === 'success') {
                const data = result.data || [];

                setProperties((prev) => {
                    const combined =
                        pageToLoad === 1 ? data : [...prev, ...data];

                    return Array.from(
                        new Map(combined.map((p: any) => [p.id, p])).values()
                    );
                });

                if (result.meta) {
                    setHasMore(pageToLoad < result.meta.pages);
                }
            } else {
                show({
                    type: 'error',
                    title: 'Error',
                    message: result.msg || 'Failed to load related properties',
                });
            }
        } catch (err: any) {
            show({
                type: 'error',
                title: 'Error',
                message: err.message || 'Something went wrong',
            });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            const next = page + 1;
            setPage(next);
            fetchRelated(next);
        }
    };

    const formatPrice = (price: any) => {
        return Number(String(price || 0).replace(/,/g, '')).toLocaleString();
    };

    const renderProperty = ({ item }: any) => {
        const image =
            item.images && item.images.length > 0
                ? `https://insighthub.com.ng/${item.images[0]}`
                : null;

        const isPremium =
            item.owner_is_premium == 1 ||
            item.is_premium_listing == 1;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() =>
                    router.push({
                        pathname: '/Home/Properties/Details',
                        params: { id: String(item.id) },
                    })
                }
            >
                {/* IMAGE */}
                <View style={styles.imageWrap}>
                    {image ? (
                        <Image
                            source={{ uri: image }}
                            style={styles.image}
                        />
                    ) : (
                        <View style={[styles.image, styles.placeholder]} />
                    )}

                    {/* GRADIENT OVERLAY */}
                    <View style={styles.overlay} />

                    {/* PREMIUM BADGE */}
                    {isPremium && (
                        <View style={styles.premiumBadge}>
                            <Ionicons
                                name="diamond"
                                size={12}
                                color="#000"
                            />
                            <Text style={styles.premiumText}>
                                Premium
                            </Text>
                        </View>
                    )}

                    {/* LIKE */}
                    <View style={styles.likeBtn}>
                        <LikeButton
                            propertyId={Number(item.id)}
                            variant="icon"
                            size={18}
                            color="red"
                        />
                    </View>

                    {/* LISTING TYPE */}
                    <View style={styles.listingBadge}>
                        <Text style={styles.listingText}>
                            {item.listingType}
                        </Text>
                    </View>
                </View>

                {/* CONTENT */}
                <View style={styles.content}>
                    <Text numberOfLines={1} style={styles.name}>
                        {item.propertyName}
                    </Text>

                    <View style={styles.locationRow}>
                        <Ionicons
                            name="location-outline"
                            size={14}
                            color={COLORS.gold}
                        />

                        <Text style={styles.location}>
                            {item.city}, {item.state}
                        </Text>
                    </View>

                    <View style={styles.bottomRow}>
                        <View>
                            <Text style={styles.price}>
                                ₦
                                {formatPrice(
                                    item.listingType === 'Rent'
                                        ? item.rentPrice
                                        : item.sellPrice
                                )}
                            </Text>

                            <Text style={styles.subText}>
                                {item.listingType === 'Rent'
                                    ? 'per year'
                                    : 'sale price'}
                            </Text>
                        </View>

                        <View style={styles.stats}>
                            <MaterialIcons
                                name="favorite"
                                size={15}
                                color={COLORS.gold}
                            />

                            <Text style={styles.statText}>
                                {item.likes_count || 0}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && properties.length === 0) {
        return <PremiumLoader text="Loading Related Properties..." />;
    }

    if (!loading && properties.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>
                        Related Properties
                    </Text>

                    <Text style={styles.subtitle}>
                        Similar premium listings around you
                    </Text>
                </View>

                <View style={styles.iconCircle}>
                    <Ionicons
                        name="sparkles"
                        size={18}
                        color={COLORS.gold}
                    />
                </View>
            </View>

            {/* LIST */}
            <FlatList
                data={properties}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderProperty}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: 20,
                }}
                ItemSeparatorComponent={() => (
                    <View style={{ width: 16 }} />
                )}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loadingMore ? (
                        <View style={styles.loadingMore}>
                            <ActivityIndicator color={COLORS.gold} />
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 28,
        marginBottom: 15,
    },

    header: {
        paddingHorizontal: 16,
        marginBottom: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    title: {
        fontSize: 21,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },

    subtitle: {
        marginTop: 3,
        fontSize: 13,
        color: COLORS.textSecondary,
    },

    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(201,168,76,0.13)',
        borderWidth: 1,
        borderColor: 'rgba(201,168,76,0.25)',
    },

    card: {
        width: width * 0.74,
        backgroundColor: COLORS.card,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    imageWrap: {
        height: 230,
        position: 'relative',
    },

    image: {
        width: '100%',
        height: '100%',
    },

    placeholder: {
        backgroundColor: '#23375f',
    },

    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 90,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },

    premiumBadge: {
        position: 'absolute',
        top: 14,
        left: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.premium,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 30,
    },

    premiumText: {
        fontSize: 11,
        color: '#000',
        fontWeight: '700',
    },

    likeBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderRadius: 50,
        padding: 7,
    },

    listingBadge: {
        position: 'absolute',
        bottom: 14,
        left: 14,
        backgroundColor: COLORS.gold,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    listingText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.bg,
    },

    content: {
        padding: 16,
    },

    name: {
        fontSize: 17,
        color: COLORS.textPrimary,
        fontWeight: '700',
        marginBottom: 10,
    },

    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    location: {
        marginLeft: 5,
        color: COLORS.textSecondary,
        fontSize: 13,
    },

    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    price: {
        color: COLORS.gold,
        fontSize: 20,
        fontWeight: '800',
    },

    subText: {
        marginTop: 2,
        fontSize: 11,
        color: COLORS.textSecondary,
    },

    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(201,168,76,0.08)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },

    statText: {
        marginLeft: 4,
        color: COLORS.gold,
        fontSize: 12,
        fontWeight: '600',
    },

    loadingMore: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
});