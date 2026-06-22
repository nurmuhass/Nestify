import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,

} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useToast } from '../../../components/Toast';
import { colorWithAlpha } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

/* ─── Types ─────────────────────────────────────────────────── */
type Property = {
    id: number | string;
    propertyName: string;
    images?: string[];
    listingType: 'Rent' | 'Sell' | 'Both';

    rentPrice?: string | number;
    sellPrice?: string | number;

    city?: string;
    state?: string;

    propertyCategory?: string | number;
    propertySubCategory?: string | number;

    bedrooms?: number;
    bathrooms?: number;

    owner_is_premium?: number;
    likes_count?: number;
    views_count?: number;

    company_name?: string;
    company_id?: string | number;

    search_type?: 'property' | 'company';

    status?: string;
};

/* ─── Helpers ────────────────────────────────────────────────── */
const BASE = 'https://insighthub.com.ng/';

const fmt = (v?: string | number) =>
    v ? Number(String(v).replace(/,/g, '')).toLocaleString('en-NG') : '—';

const FILTERS = ['All', 'Rent', 'Sell'];

const RECENT_KEY = 'search_recent_queries';

/* ─── Recent query pill ──────────────────────────────────────── */
const RecentPill = ({
    label,
    onPress,
    onRemove,
}: {
    label: string;
    onPress: () => void;
    onRemove: () => void;
}) => {
    const { colors } = useTheme();
    return (
    <TouchableOpacity style={[styles.pill, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.7}>
        <Ionicons name="time-outline" size={13} color={colors.mutedText} style={{ marginRight: 5 }} />
        <Text style={[styles.pillText, { color: colors.text }]} numberOfLines={1}>
            {label}
        </Text>
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={13} color={colors.mutedText} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
    </TouchableOpacity>
    );
};

/* ─── Property result card ───────────────────────────────────── */
const PropertyCard = ({
    item,
    index,
}: {
    item: Property;
    index: number;
}) => {
    const { colors } = useTheme();

    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 320,
            delay: index * 60,
            useNativeDriver: true,
        }).start();
    }, []);

    const thumb =
        item.images && item.images.length > 0
            ? `${BASE}${item.images[0]}`
            : null;

    const price =
        item.listingType === 'Sell'
            ? `₦${fmt(item.sellPrice)}`
            : item.listingType === 'Rent'
                ? `₦${fmt(item.rentPrice)}/mo`
                : `₦${fmt(item.sellPrice)}`;

    const tag =
        item.listingType === 'Both'
            ? 'Sell & Rent'
            : item.listingType;

    return (
        <Animated.View
            style={{
                opacity: anim,
                transform: [
                    {
                        translateY: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                        }),
                    },
                ],
            }}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.newCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={() =>
                    router.push({
                        pathname: '/Home/Properties/Details',
                        params: { id: String(item.id) },
                    })
                }
            >

                {/* IMAGE */}
                <View style={[styles.newImageWrap, { backgroundColor: colors.inputBackground }]}>

                    {thumb ? (
                        <Image
                            source={{ uri: thumb }}
                            style={styles.newImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.newFallback, { backgroundColor: colors.inputBackground }]}>
                            <Ionicons
                                name="home-outline"
                                size={34}
                                color={colors.mutedText}
                            />
                        </View>
                    )}

                    {/* TYPE BADGE */}
                    <View style={[styles.typeBadge, { backgroundColor: colors.buttonBackground }]}>
                        <Text style={[styles.typeBadgeText, { color: colors.background }]}>
                            {tag}
                        </Text>
                    </View>

                    {/* PREMIUM */}
                    {Number(item.owner_is_premium) === 1 && (
                        <View style={styles.premiumPill}>
                            <Ionicons
                                name="diamond"
                                size={11}
                                color={colors.background}
                            />
                            <Text style={[styles.premiumPillText, { color: colors.background }]}>
                                Premium
                            </Text>
                        </View>
                    )}

                </View>

                {/* BODY */}
                <View style={styles.newBody}>

                    {/* TITLE */}
                    <Text
                        numberOfLines={2}
                        style={[styles.newTitle, { color: colors.text }]}
                    >
                        {item.propertyName}
                    </Text>

                    {/* COMPANY */}
                    {item.company_name ? (
                        <Text style={[styles.newCompany, { color: colors.mutedText }]}>
                            {item.company_name}
                        </Text>
                    ) : null}

                    {/* LOCATION */}
                    <View style={styles.locationRow}>
                        <Ionicons
                            name="location-outline"
                            size={14}
                            color={colors.mutedText}
                        />

                        <Text
                            numberOfLines={1}
                            style={[styles.locationText, { color: colors.mutedText }]}
                        >
                            {[item.city, item.state]
                                .filter(Boolean)
                                .join(', ')}
                        </Text>
                    </View>

                    {/* FEATURES */}
                    <View style={styles.featuresRow}>

                        {item.bedrooms ? (
                            <View style={[styles.featureBox, { backgroundColor: colors.inputBackground }]}>
                                <MaterialCommunityIcons
                                    name="bed-outline"
                                    size={14}
                                    color={colors.icon}
                                />
                                <Text style={[styles.featureValue, { color: colors.text }]}>
                                    {item.bedrooms} Beds
                                </Text>
                            </View>
                        ) : null}

                        {item.bathrooms ? (
                            <View style={[styles.featureBox, { backgroundColor: colors.inputBackground }]}>
                                <MaterialCommunityIcons
                                    name="shower"
                                    size={14}
                                    color={colors.icon}
                                />
                                <Text style={[styles.featureValue, { color: colors.text }]}>
                                    {item.bathrooms} Baths
                                </Text>
                            </View>
                        ) : null}

                    </View>

                    {/* FOOTER */}
                    <View style={styles.cardFooter}>

                        <View>
                            <Text style={[styles.priceLabel, { color: colors.mutedText }]}>
                                Price
                            </Text>

                            <Text style={[styles.newPrice, { color: colors.buttonBackground }]}>
                                {price}
                            </Text>
                        </View>

                        <View style={styles.statsWrap}>

                            <View style={styles.statItem}>
                                <Ionicons
                                    name="eye-outline"
                                    size={14}
                                    color={colors.mutedText}
                                />
                                <Text style={[styles.statText, { color: colors.mutedText }]}>
                                    {item.views_count || 0}
                                </Text>
                            </View>

                            <View style={styles.statItem}>
                                <Ionicons
                                    name="heart-outline"
                                    size={14}
                                    color={colors.mutedText}
                                />
                                <Text style={[styles.statText, { color: colors.mutedText }]}>
                                    {item.likes_count || 0}
                                </Text>
                            </View>

                        </View>

                    </View>

                </View>

            </TouchableOpacity>
        </Animated.View>
    );
};


const CompanyCard = ({
    item,
    index,
}: {
    item: Property;
    index: number;
}) => {
    const { colors } = useTheme();

    const anim = useRef(
        new Animated.Value(0)
    ).current;

    useEffect(() => {

        Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            delay: index * 40,
            useNativeDriver: true,
        }).start();

    }, []);

    return (

        <Animated.View
            style={{
                opacity: anim,
                transform: [
                    {
                        translateY: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [12, 0],
                        }),
                    },
                ],
            }}
        >

            <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.companyCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={() => {

                    router.push({
                        pathname: '/Home/Company/CompanyScreen',
                        params: {
                            id: String(item.company_id),
                        },
                    });

                }}
            >

                {/* AVATAR */}

                <View style={[styles.companyAvatar, { backgroundColor: colorWithAlpha(colors.buttonBackground, 0.14) }]}>

                    <Ionicons
                        name="business-outline"
                        size={28}
                        color={colors.buttonBackground}
                    />

                </View>

                {/* BODY */}

                <View style={styles.companyBody}>

                    <View style={styles.companyTopRow}>

                        <Text
                            numberOfLines={1}
                            style={[styles.companyCardName, { color: colors.text }]}
                        >
                            {item.company_name}
                        </Text>

                        {Number(item.owner_is_premium) === 1 && (
                            <View style={styles.companyPremium}>
                                <Ionicons
                                    name="diamond"
                                    size={10}
                                    color={colors.background}
                                />
                            </View>
                        )}

                    </View>

                    <Text
                        numberOfLines={2}
                        style={[styles.companySub, { color: colors.mutedText }]}
                    >
                        Real estate company
                    </Text>

                    <View style={styles.companyStats}>

                        <View style={styles.companyStat}>
                            <Ionicons
                                name="home-outline"
                                size={13}
                                color={colors.mutedText}
                            />
                            <Text style={[styles.companyStatText, { color: colors.mutedText }]}>
                                Listings Available
                            </Text>
                        </View>

                    </View>

                </View>

                <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.mutedText}
                />

            </TouchableOpacity>

        </Animated.View>
    );
};
/* ─── Main Screen ────────────────────────────────────────────── */
export default function SearchScreen() {
    const { colors } = useTheme();
    const { show } = useToast();
    const inputRef = useRef<TextInput>(null);

    const [query, setQuery] = useState('');
    const [activeFilter, setFilter] = useState('All');
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [recent, setRecent] = useState<string[]>([]);

    const [searchType, setSearchType] = useState<'all' | 'property' | 'company'>('all');

    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const [premiumOnly, setPremiumOnly] = useState(false);

    const [bedroomFilter, setBedroomFilter] = useState<string>('Any');

    const [searching, setSearching] = useState(false);

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => inputRef.current?.focus(), 180);

        loadRecent();

        return () => clearTimeout(t);
    }, []);

    useEffect(() => {

        if (!query.trim()) {
            setProperties([]);
            return;
        }

        const delay = setTimeout(() => {
            searchProperties();
        }, 500);

        return () => clearTimeout(delay);

    }, [
        query,
        searchType,
        activeFilter,
        minPrice,
        maxPrice,
        premiumOnly,
        bedroomFilter
    ]);

    /* ── Recent queries ── */
    const loadRecent = async () => {
        try {
            const raw = await AsyncStorage.getItem(RECENT_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                const unique = Array.isArray(parsed) ? Array.from(new Set(parsed)) : [];
                setRecent(unique);
            }
        } catch { }
    };
    const searchProperties = async () => {

        try {

            setSearching(true);

            const token = await AsyncStorage.getItem('authToken');

            const params = new URLSearchParams();

            params.append('query', query);

            params.append('type', searchType);

            params.append('listingType', activeFilter);

            if (minPrice) {
                params.append('minPrice', minPrice);
            }

            if (maxPrice) {
                params.append('maxPrice', maxPrice);
            }

            if (premiumOnly) {
                params.append('premiumOnly', '1');
            }

            if (bedroomFilter !== 'Any') {

                const bedroomValue =
                    bedroomFilter === '5+'
                        ? '5'
                        : bedroomFilter;

                params.append('bedrooms', bedroomValue);
            }
            const response = await fetch(
                `${BASE}NestifyAPI/get_smart_search.php?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token ?? ''}`,
                    },
                }
            );

            const result = await response.json();

            console.log('SEARCH RESULT:', result);

            if (result.status === 'success') {

                setProperties(result.properties || []);

            } else {

                show({
                    type: 'error',
                    title: 'Search Error',
                    message: result.msg || 'Search failed',
                });
            }

        } catch (err: any) {

            show({
                type: 'error',
                title: 'Error',
                message: err.message,
            });

        } finally {

            setSearching(false);
            setFetched(true);
        }
    };
    const saveRecent = async (q: string) => {
        const trimmed = q.trim();
        if (!trimmed) return;
        const next = [trimmed, ...recent.filter((r) => r !== trimmed)].slice(0, 8);
        setRecent(next);
        await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
    };

    const removeRecent = async (q: string) => {
        const next = recent.filter((r) => r !== q);
        setRecent(next);
        await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
    };



    const results = properties;

    const isIdle = !query.trim() && fetched;
    const isEmpty = fetched && !searching && results.length === 0 && query.trim().length > 0;

    /* ── Search submit ── */
    const handleSubmit = useCallback(async () => {

        if (!query.trim()) return;

        await saveRecent(query.trim());

        Keyboard.dismiss();

        searchProperties();

    }, [
        query,
        searchType,
        activeFilter,
        minPrice,
        maxPrice,
        premiumOnly,
        bedroomFilter
    ]);

    /* ── Search bar pulse anim ── */
    const borderAnim = useRef(new Animated.Value(0)).current;
    const handleFocus = () =>
        Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    const handleBlur = () =>
        Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.border, colors.buttonBackground],
    });

    return (
        <KeyboardAvoidingView
            style={[styles.root, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* ── Top bar ── */}
            <View style={[styles.topBar, { backgroundColor: colors.background }]}>
                <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.cardBackground }]} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color={colors.icon} />
                </TouchableOpacity>

                <Animated.View style={[styles.searchBox, { borderColor, backgroundColor: colors.cardBackground }]}>
                    <Ionicons name="search" size={17} color={query ? colors.buttonBackground : colors.mutedText} />
                    <TextInput
                        ref={inputRef}
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search properties, cities…"
                        placeholderTextColor={colors.mutedText}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSubmit}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        returnKeyType="search"
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <View style={[styles.clearBtn, { backgroundColor: colors.buttonBackground }]}>
                                <Ionicons name="close" size={12} color={colors.background} />
                            </View>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </View>

            <View style={[styles.searchTypeWrap, { backgroundColor: colors.background }]}>

                {[
                    { key: 'all', label: 'All' },
                    { key: 'property', label: 'Properties' },
                    { key: 'company', label: 'Companies' },
                ].map((item) => {

                    const active = searchType === item.key;

                    return (
                        <TouchableOpacity
                            key={item.key}
                            style={[
                                styles.searchTypeBtn,
                                { backgroundColor: colors.cardBackground, borderColor: colors.border },
                                active && { backgroundColor: colors.buttonBackground, borderColor: colors.buttonBackground }
                            ]}
                            onPress={() => setSearchType(item.key as any)}
                        >
                            <Text
                                style={[
                                    styles.searchTypeText,
                                    { color: active ? colors.background : colors.mutedText }
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ── Filter chips ── */}
            <View style={[styles.filters, { backgroundColor: colors.background }]}>
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[
                            styles.filterChip,
                            { backgroundColor: colors.cardBackground, borderColor: colors.border },
                            activeFilter === f && { backgroundColor: colors.buttonBackground, borderColor: colors.buttonBackground },
                        ]}
                        onPress={() => setFilter(f)}
                        activeOpacity={0.75}
                    >
                        <Text style={[styles.filterText, { color: activeFilter === f ? colors.background : colors.mutedText }]}>
                            {f === 'All' ? 'All types' : `For ${f}`}
                        </Text>
                    </TouchableOpacity>
                ))}

                {/* Result count badge */}
                {query.trim().length > 0 && (
                    <View style={[styles.countBadge, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                        <Text style={[styles.countText, { color: colors.mutedText }]}>
                            {results.length} {results.length === 1 ? 'result' : 'results'}
                        </Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[styles.advancedBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={() =>
                    setShowAdvancedFilters(!showAdvancedFilters)
                }
            >

                <Ionicons
                    name="options-outline"
                    size={18}
                    color={colors.buttonBackground}
                />

                <Text style={[styles.advancedBtnText, { color: colors.buttonBackground }]}>
                    Advanced Filters
                </Text>

            </TouchableOpacity>

            {showAdvancedFilters && (

                <View style={[styles.advancedPanel, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>

                    {/* PRICE */}

                    <View style={styles.priceRow}>

                        <TextInput
                            placeholder="Min Price"
                            placeholderTextColor={colors.mutedText}
                            value={minPrice}
                            onChangeText={setMinPrice}
                            keyboardType="numeric"
                            style={[styles.priceInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                        />

                        <TextInput
                            placeholder="Max Price"
                            placeholderTextColor={colors.mutedText}
                            value={maxPrice}
                            onChangeText={setMaxPrice}
                            keyboardType="numeric"
                            style={[styles.priceInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                        />

                    </View>

                    {/* BEDROOMS */}

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginTop: 14 }}
                    >

                        {['Any', '1', '2', '3', '4', '5+'].map((b) => {

                            const active =
                                bedroomFilter === b;

                            return (
                                <TouchableOpacity
                                    key={b}
                                    style={[
                                        styles.bedroomChip,
                                        { backgroundColor: colors.inputBackground, borderColor: colors.border },
                                        active && { backgroundColor: colors.buttonBackground, borderColor: colors.buttonBackground }
                                    ]}
                                    onPress={() =>
                                        setBedroomFilter(b)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.bedroomText,
                                            { color: active ? colors.background : colors.mutedText }
                                        ]}
                                    >
                                        {b} Beds
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}

                    </ScrollView>

                    {/* PREMIUM */}

                    <TouchableOpacity
                        style={styles.premiumRow}
                        onPress={() =>
                            setPremiumOnly(!premiumOnly)
                        }
                    >

                        <Ionicons
                            name={
                                premiumOnly
                                    ? 'checkbox'
                                    : 'square-outline'
                            }
                            size={20}
                            color={colors.buttonBackground}
                        />

                        <Text style={[styles.premiumFilterText, { color: colors.text }]}>
                            Premium listings only
                        </Text>

                    </TouchableOpacity>

                </View>
            )}

            {/* ── Divider ── */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* ── Body ── */}
            {loading || searching ? (
                <View style={[styles.center, { backgroundColor: colors.background }]}>
                    <ActivityIndicator size="large" color={colors.buttonBackground} />
                    <Text style={[styles.loadingText, { color: colors.mutedText }]}>Finding properties…</Text>
                </View>

            ) : isIdle ? (
                /* Recent searches */
                <View style={[styles.idleWrap, { backgroundColor: colors.background }]}>
                    {recent.length > 0 ? (
                        <>
                            <View style={styles.idleHeader}>
                                <Text style={[styles.idleTitle, { color: colors.text }]}>Recent searches</Text>
                                <TouchableOpacity
                                    onPress={async () => {
                                        setRecent([]);
                                        await AsyncStorage.removeItem(RECENT_KEY);
                                    }}
                                >
                                    <Text style={[styles.clearAll, { color: colors.buttonBackground }]}>Clear all</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.pillsWrap}>
                                {recent.map((r, index) => (
                                    <RecentPill
                                        key={`${r}-${index}`}
                                        label={r}
                                        onPress={() => setQuery(r)}
                                        onRemove={() => removeRecent(r)}
                                    />
                                ))}
                            </View>
                        </>
                    ) : null}

                    {/* Prompt illustration */}
                    <View style={styles.promptWrap}>
                        <View style={[styles.promptIcon, { backgroundColor: colorWithAlpha(colors.buttonBackground, 0.12) }]}>
                            <Ionicons name="search" size={32} color={colors.buttonBackground} />
                        </View>
                        <Text style={[styles.promptTitle, { color: colors.text }]}>Find your next home</Text>
                        <Text style={[styles.promptSub, { color: colors.mutedText }]}>
                            Search by property name, city, or state across thousands of listings.
                        </Text>
                    </View>
                </View>

            ) : isEmpty ? (
                /* No results */
                <View style={[styles.center, { backgroundColor: colors.background }]}>
                    <View style={[styles.emptyIcon, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                        <Ionicons name="home-outline" size={34} color={colors.mutedText} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No search results</Text>
                    <Text style={[styles.emptySub, { color: colors.mutedText }]}>
                        No results for{' '}
                        <Text style={{ color: colors.text, fontWeight: '600' }}>"{query}"</Text>
                    </Text>
                    <TouchableOpacity style={[styles.emptyReset, { backgroundColor: colors.buttonBackground }]} onPress={() => setQuery('')}>
                        <Text style={[styles.emptyResetText, { color: colors.background }]}>Clear search</Text>
                    </TouchableOpacity>
                </View>

            ) : (
                /* Results */
                <FlatList
                    data={results}
                    keyExtractor={(item, index) =>
                        item.id !== undefined && item.id !== null
                            ? String(item.id)
                            : String(index)
                    }
                    renderItem={({ item, index }) => {
                        if (item.search_type === 'company') {
                            return (
                                <CompanyCard
                                    item={item}
                                    index={index}
                                />
                            );
                        }

                        return (
                            <PropertyCard
                                item={item}
                                index={index}
                            />
                        );
                    }}
                    contentContainerStyle={[styles.listContent, { backgroundColor: colors.background }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                />
            )}
        </KeyboardAvoidingView>
    );
}

/* ─── Styles ─────────────────────────────────────────────────── */


const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#091530',
        paddingTop: getStatusBarHeight(),
    },

    /* Top bar */
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
        backgroundColor: '#091530',
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#0f2044',
        alignItems: 'center',
        justifyContent: 'center',
    },

    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f2044',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1e2f5a',
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 12 : 6,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#fff',
    },
    clearBtn: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#c9a84c',
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Filters */
    filters: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
        backgroundColor: '#091530',
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#0f2044',
        borderWidth: 1,
        borderColor: '#1e2f5a',
    },
    filterChipActive: {
        backgroundColor: '#c9a84c',
        borderColor: '#c9a84c',
    },
    filterText: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#091530',
        fontWeight: '700',
    },

    countBadge: {
        marginLeft: 'auto',
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: '#0f2044',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#c9a84c',
    },
    countText: {
        fontSize: 12,
        color: '#f0d98a',
        fontWeight: '600',
    },

    divider: {
        height: 0.5,
        backgroundColor: '#1e2f5a',
    },

    /* Idle / recent */
    idleWrap: {
        flex: 1,
        paddingHorizontal: 18,
        paddingTop: 20,
    },
    idleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    idleTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
        letterSpacing: 1,
    },
    clearAll: {
        fontSize: 13,
        color: '#c9a84c',
        fontWeight: '600',
    },

    pillsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 30,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f2044',
        borderWidth: 1,
        borderColor: '#1e2f5a',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    pillText: {
        fontSize: 13,
        color: '#e5e7eb',
    },

    /* Prompt */
    promptWrap: {
        alignItems: 'center',
        marginTop: 30,
        paddingHorizontal: 30,
    },
    promptIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#0f2044',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#c9a84c',
    },
    promptTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    promptSub: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 20,
    },

    /* Center states */
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#94a3b8',
    },

    /* Empty */
    emptyIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#0f2044',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 6,
    },
    emptySub: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 20,
    },
    emptyReset: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: '#c9a84c',
        borderRadius: 22,
    },
    emptyResetText: {
        color: '#091530',
        fontSize: 14,
        fontWeight: '700',
    },

    /* Results list */
    listContent: {
        padding: 14,
        paddingBottom: 40,
    },

    /* Cards */
    card: {
        flexDirection: 'row',
        backgroundColor: '#0f2044',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#1e2f5a',
        overflow: 'hidden',
        minHeight: 105,
    },

    cardThumb: {
        width: 105,
        height: 105,
    },

    cardImg: {
        width: '100%',
        height: '100%',
    },

    cardImgFallback: {
        backgroundColor: '#091530',
        alignItems: 'center',
        justifyContent: 'center',
    },

    cardTagWrap: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: 'rgba(201,168,76,0.9)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    cardTag: {
        fontSize: 10,
        color: '#091530',
        fontWeight: '700',
    },

    cardBody: {
        flex: 1,
        paddingHorizontal: 12,

        gap: 5,
        paddingVertical: 10,
    },

    cardName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },

    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    cardLoc: {
        fontSize: 12,
        color: '#94a3b8',
        flex: 1,
    },

    cardFeatures: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 2,
    },

    featureChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#091530',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },

    featureText: {
        fontSize: 11,
        color: '#cbd5f5',
    },

    cardPrice: {
        fontSize: 15,
        fontWeight: '800',
        color: '#f0d98a',
        marginTop: 4,
    },

    cardChevron: {
        marginRight: 12,
        color: '#c9a84c',
    },
    searchTypeWrap: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 10,
        gap: 10,
    },

    searchTypeBtn: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 30,
        backgroundColor: '#0f2044',
        borderWidth: 1,
        borderColor: '#1e2f5a',
    },

    searchTypeBtnActive: {
        backgroundColor: '#c9a84c',
        borderColor: '#c9a84c',
    },

    searchTypeText: {
        color: '#94a3b8',
        fontWeight: '600',
        fontSize: 13,
    },

    searchTypeTextActive: {
        color: '#091530',
    },

    advancedBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 12,
    },

    advancedBtnText: {
        color: '#f0d98a',
        fontWeight: '600',
    },

    advancedPanel: {
        marginHorizontal: 16,
        marginTop: 14,
        backgroundColor: '#0f2044',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1e2f5a',
    },

    priceRow: {
        flexDirection: 'row',
        gap: 10,
    },

    priceInput: {
        flex: 1,
        backgroundColor: '#091530',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#1e2f5a',
    },

    bedroomChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#091530',
        borderRadius: 20,
        marginRight: 8,
    },

    bedroomChipActive: {
        backgroundColor: '#c9a84c',
    },

    bedroomText: {
        color: '#94a3b8',
        fontSize: 12,
    },

    bedroomTextActive: {
        color: '#091530',
        fontWeight: '700',
    },

    premiumRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        gap: 10,
    },

    premiumFilterText: {
        color: '#fff',
        fontWeight: '600',
    },

    premiumBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#c9a84c',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    premiumBadgeText: {
        color: '#091530',
        fontWeight: '800',
        fontSize: 9,
    },

    companyName: {
        color: '#c9a84c',
        fontSize: 12,
        marginTop: 2,
    },

    metricsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 6,
    },

    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    metricText: {
        color: '#94a3b8',
        fontSize: 11,
    },

    newCard: {
        backgroundColor: '#0f2044',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#1e2f5a',
        marginBottom: 6,
    },

    newImageWrap: {
        width: '100%',
        height: 220,
        position: 'relative',
    },

    newImage: {
        width: '100%',
        height: '100%',
    },

    newFallback: {
        flex: 1,
        backgroundColor: '#091530',
        alignItems: 'center',
        justifyContent: 'center',
    },

    typeBadge: {
        position: 'absolute',
        bottom: 14,
        left: 14,
        backgroundColor: 'rgba(15,23,42,0.82)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    typeBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },

    premiumPill: {
        position: 'absolute',
        top: 14,
        right: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f0d98a',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },

    premiumPillText: {
        color: '#091530',
        fontWeight: '800',
        fontSize: 10,
    },

    newBody: {
        padding: 16,
    },

    newTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        lineHeight: 24,
    },

    newCompany: {
        color: '#c9a84c',
        marginTop: 6,
        fontSize: 13,
        fontWeight: '600',
    },

    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },

    locationText: {
        color: '#94a3b8',
        marginLeft: 6,
        fontSize: 13,
        flex: 1,
    },

    featuresRow: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 10,
    },

    featureBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#091530',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
    },

    featureValue: {
        color: '#cbd5e1',
        marginLeft: 6,
        fontSize: 12,
        fontWeight: '600',
    },

    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 20,
    },

    priceLabel: {
        color: '#64748b',
        fontSize: 11,
        marginBottom: 4,
    },

    newPrice: {
        color: '#f0d98a',
        fontSize: 22,
        fontWeight: '800',
    },

    statsWrap: {
        flexDirection: 'row',
        gap: 12,
    },

    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    statText: {
        color: '#94a3b8',
        fontSize: 12,
    },

    companyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f2044',
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: '#1e2f5a',
    },

    companyAvatar: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#091530',
        alignItems: 'center',
        justifyContent: 'center',
    },

    companyBody: {
        flex: 1,
        marginLeft: 14,
    },

    companyTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    companyCardName: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    companyPremium: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#f0d98a',
        alignItems: 'center',
        justifyContent: 'center',
    },

    companySub: {
        color: '#94a3b8',
        marginTop: 4,
        fontSize: 13,
    },

    companyStats: {
        flexDirection: 'row',
        marginTop: 10,
    },

    companyStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },

    companyStatText: {
        color: '#cbd5e1',
        fontSize: 12,
    },
});
