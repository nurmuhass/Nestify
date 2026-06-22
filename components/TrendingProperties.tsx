// ─────────────────────────────────────────────────────────────
// TrendingProperties.tsx 
// ─────────────────────────────────────────────────────────────

import {
    Ionicons,
    MaterialCommunityIcons,
} from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

import { useRouter } from 'expo-router';

import React, { useMemo } from 'react';

import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colorWithAlpha } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.82;

const COLORS = {
    bg: '#091530',
    card: '#0f2044',
    gold: '#c9a84c',
    gold2: '#f0d98a',
    white: '#ffffff',
    muted: '#94a3b8',
    border: 'rgba(255,255,255,0.08)',
};

type Props = {
    properties?: any[];
};

export default function TrendingProperties({
    properties = [],
}: Props) {
    const router = useRouter();
    const { colors } = useTheme();

    /*
    ─────────────────────────────────────────
    PREMIUM COUNT
    ─────────────────────────────────────────
    */

    const premiumCount = useMemo(() => {
        return properties.filter(
            item =>
                Number(item.owner_is_premium) === 1
        ).length;
    }, [properties]);

    /*
    ─────────────────────────────────────────
    EMPTY
    ─────────────────────────────────────────
    */

    if (!properties.length) {
        return null;
    }

    /*
    ─────────────────────────────────────────
    FORMAT PRICE
    ─────────────────────────────────────────
    */

    const formatPrice = (value: any) => {
        return Number(
            String(value || 0).replace(/,/g, '')
        ).toLocaleString('en-NG');
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}

            <View style={styles.header}>
                <View>
                    <View style={styles.topRow}>
                        <MaterialCommunityIcons
                            name="fire"
                            size={24}
                            color={colors.warning}
                        />

                        <Text style={[styles.title, { color: colors.text }]}>
                            Trending Now
                        </Text>
                    </View>

                    <Text style={[styles.subtitle, { color: colors.mutedText }]}>
                        {premiumCount} premium listings
                        trending near you
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() =>
                        router.push(
                            '/Home/Properties/AllPropertiesScreen'
                        )
                    }
                >
                    <Text style={[styles.viewAll, { color: colors.buttonBackground }]}>
                        View all
                    </Text>
                </TouchableOpacity>
            </View>

            {/* LIST */}

            <FlatList
                horizontal
                data={properties}
                keyExtractor={(item) =>
                    item.id.toString()
                }
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingLeft: 16,
                    paddingRight: 10,
                }}
                renderItem={({ item, index }) => {
                    const image = item.thumbnail_image
                        ? `https://insighthub.com.ng/${item.thumbnail_image}`
                        : null;

                    const isPremium =
                        Number(item.owner_is_premium) === 1;

                    const isBoosted =
                        item.boosted_until;

                    const isFeatured =
                        item.featured_until;

                    return (
                        <TouchableOpacity
                            activeOpacity={0.92}
                            style={styles.cardWrap}
                            onPress={() =>
                                router.push({
                                    pathname:
                                        '/Home/Properties/Details',
                                    params: {
                                        id: String(item.id),
                                    },
                                })
                            }
                        >
                            <LinearGradient
                                colors={
                                    isPremium
                                        ? [colors.cardBackground, colors.background]
                                        : [colors.cardBackground, colors.background]
                                }
                                style={styles.card}
                            >
                                {/* IMAGE */}

                                <View style={styles.imageWrap}>
                                    {image ? (
                                        <Image
                                            source={{
                                                uri: image,
                                            }}
                                            style={styles.image}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View
                                            style={[
                                                styles.image,
                                                { backgroundColor: colors.inputBackground },
                                            ]}
                                        />
                                    )}

                                    {/* OVERLAY */}

                                    <LinearGradient
                                        colors={[
                                            'transparent',
                                            'rgba(0,0,0,0.85)',
                                        ]}
                                        style={styles.overlay}
                                    />

                                    {/* RANK */}

                                    <View style={styles.rankBadge}>
                                        <Text style={styles.rankText}>
                                            #{index + 1}
                                        </Text>
                                    </View>

                                    {/* PREMIUM */}

                                    {isPremium && (
                                        <View
                                            style={
                                                styles.premiumBadge
                                            }
                                        >
                                            <Ionicons
                                                name="diamond"
                                                size={13}
                                                color={colors.background}
                                            />

                                            <Text
                                                style={[styles.premiumText, { color: colors.background }]}
                                            >
                                                PREMIUM
                                            </Text>
                                        </View>
                                    )}

                                    {/* FEATURED */}

                                    {isFeatured && (
                                        <View
                                            style={
                                                styles.featuredBadge
                                            }
                                        >
                                            <Ionicons
                                                name="star"
                                                size={12}
                                                color={colors.background}
                                            />

                                            <Text
                                                style={[styles.featuredText, { color: colors.background }]}
                                            >
                                                FEATURED
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* CONTENT */}

                                <View style={styles.content}>
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.name, { color: colors.text }]}
                                    >
                                        {item.propertyName}
                                    </Text>

                                    <Text
                                        style={[styles.location, { color: colors.mutedText }]}
                                        numberOfLines={1}
                                    >
                                        {item.city}, {item.state}
                                    </Text>

                                    <Text style={[styles.price, { color: colors.warning }]}>
                                        ₦
                                        {item.sellPrice
                                            ? formatPrice(
                                                item.sellPrice
                                            )
                                            : formatPrice(
                                                item.rentPrice
                                            )}
                                    </Text>

                                    {/* STATS */}

                                    <View style={styles.statsRow}>
                                        <View style={[styles.stat, { backgroundColor: colorWithAlpha(colors.inputBackground, 0.7) }]}>
                                            <Ionicons
                                                name="eye-outline"
                                                size={14}
                                                color={colors.icon}
                                            />

                                            <Text
                                                style={
                                                    [styles.statText, { color: colors.text }]
                                                }
                                            >
                                                {item.views_count ||
                                                    0}
                                            </Text>
                                        </View>

                                        <View style={[styles.stat, { backgroundColor: colorWithAlpha(colors.inputBackground, 0.7) }]}>
                                            <Ionicons
                                                name="heart"
                                                size={13}
                                                color="#ff4d6d"
                                            />

                                            <Text
                                                style={
                                                    [styles.statText, { color: colors.text }]
                                                }
                                            >
                                                {item.likes_count ||
                                                    0}
                                            </Text>
                                        </View>

                                        {isBoosted && (
                                            <View
                                                style={[styles.boosted, { backgroundColor: colors.warning }]}
                                            >
                                                <MaterialCommunityIcons
                                                    name="rocket-launch"
                                                    size={12}
                                                    color={colors.background}
                                                />

                                                <Text
                                                    style={
                                                        [styles.boostedText, { color: colors.background }]
                                                    }
                                                >
                                                    Boosted
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 18,
        marginBottom: 18,
    },

    header: {
        paddingHorizontal: 16,
        marginBottom: 16,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    title: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: '800',
    },

    subtitle: {
        marginTop: 4,
        color: COLORS.muted,
        fontSize: 13,
    },

    viewAll: {
        color: COLORS.gold,
        fontWeight: '700',
    },

    cardWrap: {
        width: CARD_WIDTH,
        marginRight: 16,
    },

    card: {
        borderRadius: 28,
        overflow: 'hidden',

        borderWidth: 1,
        borderColor: COLORS.border,
    },

    imageWrap: {
        height: 240,
        position: 'relative',
    },

    image: {
        width: '100%',
        height: '100%',
    },

    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 110,
    },

    rankBadge: {
        position: 'absolute',
        top: 14,
        left: 14,

        backgroundColor:
            'rgba(0,0,0,0.55)',

        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    rankText: {
        color: '#fff',
        fontWeight: '800',
    },

    premiumBadge: {
        position: 'absolute',
        top: 14,
        right: 14,

        backgroundColor: '#c9a84c',

        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,

        paddingHorizontal: 12,
        paddingVertical: 7,

        borderRadius: 20,
    },

    premiumText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 11,
    },

    featuredBadge: {
        position: 'absolute',
        bottom: 14,
        left: 14,

        backgroundColor: '#7c3aed',

        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,

        paddingHorizontal: 12,
        paddingVertical: 7,

        borderRadius: 18,
    },

    featuredText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 11,
    },

    content: {
        padding: 18,
    },

    name: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '800',
    },

    location: {
        marginTop: 6,
        color: COLORS.muted,
        fontSize: 13,
    },

    price: {
        marginTop: 12,
        color: COLORS.gold2,
        fontSize: 24,
        fontWeight: '800',
    },

    statsRow: {
        marginTop: 16,

        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
    },

    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,

        backgroundColor:
            'rgba(255,255,255,0.06)',

        paddingHorizontal: 10,
        paddingVertical: 6,

        borderRadius: 20,
    },

    statText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },

    boosted: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,

        backgroundColor: '#f97316',

        paddingHorizontal: 12,
        paddingVertical: 7,

        borderRadius: 20,
    },

    boostedText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 11,
    },
});
