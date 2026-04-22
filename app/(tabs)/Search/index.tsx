import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

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
    bedrooms?: number;
    bathrooms?: number;
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
}) => (
    <TouchableOpacity style={styles.pill} onPress={onPress} activeOpacity={0.7}>
        <Ionicons name="time-outline" size={13} color="#94a3b8" style={{ marginRight: 5 }} />
        <Text style={styles.pillText} numberOfLines={1}>
            {label}
        </Text>
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={13} color="#94a3b8" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
    </TouchableOpacity>
);

/* ─── Property result card ───────────────────────────────────── */
const ResultCard = ({
    item,
    index,
}: {
    item: Property;
    index: number;
}) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 320,
            delay: index * 55,
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

    const tag = item.listingType === 'Both' ? 'Sell & Rent' : item.listingType;

    return (
        <Animated.View
            style={{
                opacity: anim,
                transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
            }}
        >
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.88}
                onPress={() =>
                    router.push({ pathname: '/Home/Company/Details', params: { id: String(item.id) } })
                }
            >
                {/* Thumbnail */}
                <View style={styles.cardThumb}>
                    {thumb ? (
                        <Image source={{ uri: thumb }} style={styles.cardImg} resizeMode="cover" />
                    ) : (
                        <View style={[styles.cardImg, styles.cardImgFallback]}>
                            <Ionicons name="home-outline" size={26} color="#cbd5e1" />
                        </View>
                    )}
                    <View style={styles.cardTagWrap}>
                        <Text style={styles.cardTag}>{tag}</Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.cardBody}>
                    <Text style={styles.cardName} numberOfLines={2}>
                        {item.propertyName}
                    </Text>

                    <View style={styles.cardRow}>
                        <Ionicons name="location-outline" size={13} color="#94a3b8" />
                        <Text style={styles.cardLoc} numberOfLines={1}>
                            {[item.city, item.state].filter(Boolean).join(', ') || 'Nigeria'}
                        </Text>
                    </View>

                    {(item.bedrooms || item.bathrooms) ? (
                        <View style={styles.cardFeatures}>
                            {item.bedrooms ? (
                                <View style={styles.featureChip}>
                                    <MaterialCommunityIcons name="bed-outline" size={12} color="#64748b" />
                                    <Text style={styles.featureText}>{item.bedrooms}</Text>
                                </View>
                            ) : null}
                            {item.bathrooms ? (
                                <View style={styles.featureChip}>
                                    <MaterialCommunityIcons name="shower" size={12} color="#64748b" />
                                    <Text style={styles.featureText}>{item.bathrooms}</Text>
                                </View>
                            ) : null}
                        </View>
                    ) : null}

                    <Text style={styles.cardPrice}>{price}</Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" style={styles.cardChevron} />
            </TouchableOpacity>
        </Animated.View>
    );
};

/* ─── Main Screen ────────────────────────────────────────────── */
export default function SearchScreen() {
    const inputRef = useRef<TextInput>(null);

    const [query, setQuery] = useState('');
    const [activeFilter, setFilter] = useState('All');
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [recent, setRecent] = useState<string[]>([]);

    /* Focus input on mount */
    useEffect(() => {
        const t = setTimeout(() => inputRef.current?.focus(), 180);
        loadRecent();
        loadProperties();
        return () => clearTimeout(t);
    }, []);

    /* ── Recent queries ── */
    const loadRecent = async () => {
        try {
            const raw = await AsyncStorage.getItem(RECENT_KEY);
            if (raw) setRecent(JSON.parse(raw));
        } catch { }
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

    /* ── Fetch all properties once ── */
    const loadProperties = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(
                `${BASE}NestifyAPI/get_properties.php?page=1&limit=100`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token ?? ''}`,
                    },
                }
            );
            const result = await response.json();
            if (result.status === 'success') {
                setProperties(result.data ?? result.properties ?? []);
            } else {
                Alert.alert('Error', result.msg || 'Failed to load properties');
            }
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
            setFetched(true);
        }
    };

    /* ── Filter logic ── */
    const results = useMemo(() => {
        const q = query.toLowerCase().trim();
        return properties.filter((p) => {
            if (activeFilter === 'Rent' && !['Rent', 'Both'].includes(p.listingType)) return false;
            if (activeFilter === 'Sell' && !['Sell', 'Both'].includes(p.listingType)) return false;
            if (!q) return true;
            return (
                p.propertyName?.toLowerCase().includes(q) ||
                p.city?.toLowerCase().includes(q) ||
                p.state?.toLowerCase().includes(q)
            );
        });
    }, [properties, query, activeFilter]);

    const isIdle = !query.trim() && fetched;
    const isEmpty = fetched && !loading && results.length === 0 && query.trim().length > 0;

    /* ── Search submit ── */
    const handleSubmit = useCallback(() => {
        if (query.trim()) {
            saveRecent(query.trim());
            Keyboard.dismiss();
        }
    }, [query, recent]);

    /* ── Search bar pulse anim ── */
    const borderAnim = useRef(new Animated.Value(0)).current;
    const handleFocus = () =>
        Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    const handleBlur = () =>
        Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#e2e8f0', '#3b82f6'],
    });

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* ── Top bar ── */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color="#0f172a" />
                </TouchableOpacity>

                <Animated.View style={[styles.searchBox, { borderColor }]}>
                    <Ionicons name="search" size={17} color={query ? '#3b82f6' : '#94a3b8'} />
                    <TextInput
                        ref={inputRef}
                        style={styles.searchInput}
                        placeholder="Search properties, cities…"
                        placeholderTextColor="#94a3b8"
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
                            <View style={styles.clearBtn}>
                                <Ionicons name="close" size={12} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </View>

            {/* ── Filter chips ── */}
            <View style={styles.filters}>
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                        onPress={() => setFilter(f)}
                        activeOpacity={0.75}
                    >
                        <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                            {f === 'All' ? 'All types' : `For ${f}`}
                        </Text>
                    </TouchableOpacity>
                ))}

                {/* Result count badge */}
                {query.trim().length > 0 && (
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>
                            {results.length} {results.length === 1 ? 'result' : 'results'}
                        </Text>
                    </View>
                )}
            </View>

            {/* ── Divider ── */}
            <View style={styles.divider} />

            {/* ── Body ── */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Finding properties…</Text>
                </View>

            ) : isIdle ? (
                /* Recent searches */
                <View style={styles.idleWrap}>
                    {recent.length > 0 ? (
                        <>
                            <View style={styles.idleHeader}>
                                <Text style={styles.idleTitle}>Recent searches</Text>
                                <TouchableOpacity
                                    onPress={async () => {
                                        setRecent([]);
                                        await AsyncStorage.removeItem(RECENT_KEY);
                                    }}
                                >
                                    <Text style={styles.clearAll}>Clear all</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.pillsWrap}>
                                {recent.map((r) => (
                                    <RecentPill
                                        key={r}
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
                        <View style={styles.promptIcon}>
                            <Ionicons name="search" size={32} color="#3b82f6" />
                        </View>
                        <Text style={styles.promptTitle}>Find your next home</Text>
                        <Text style={styles.promptSub}>
                            Search by property name, city, or state across thousands of listings.
                        </Text>
                    </View>
                </View>

            ) : isEmpty ? (
                /* No results */
                <View style={styles.center}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="home-outline" size={34} color="#94a3b8" />
                    </View>
                    <Text style={styles.emptyTitle}>No properties found</Text>
                    <Text style={styles.emptySub}>
                        No results for{' '}
                        <Text style={{ color: '#0f172a', fontWeight: '600' }}>"{query}"</Text>
                    </Text>
                    <TouchableOpacity style={styles.emptyReset} onPress={() => setQuery('')}>
                        <Text style={styles.emptyResetText}>Clear search</Text>
                    </TouchableOpacity>
                </View>

            ) : (
                /* Results */
                <FlatList
                    data={results}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item, index }) => <ResultCard item={item} index={index} />}
                    contentContainerStyle={styles.listContent}
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
        backgroundColor: '#f8fafc',
        paddingTop: getStatusBarHeight()

    },

    /* Top bar */
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
        backgroundColor: '#fff',
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        borderWidth: 1.5,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 10 : 4,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#0f172a',
        fontWeight: '400',
    },
    clearBtn: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#94a3b8',
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Filters */
    filters: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 8,
        backgroundColor: '#fff',
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    filterChipActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#3b82f6',
    },
    filterText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#3b82f6',
        fontWeight: '600',
    },
    countBadge: {
        marginLeft: 'auto',
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: '#eff6ff',
        borderRadius: 20,
    },
    countText: {
        fontSize: 12,
        color: '#3b82f6',
        fontWeight: '600',
    },

    divider: {
        height: 0.5,
        backgroundColor: '#e2e8f0',
    },

    /* Idle / recent */
    idleWrap: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    idleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    idleTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    clearAll: {
        fontSize: 13,
        color: '#3b82f6',
        fontWeight: '500',
    },
    pillsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 32,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 7,
        maxWidth: 180,
    },
    pillText: {
        fontSize: 13,
        color: '#475569',
        flexShrink: 1,
    },

    /* Prompt */
    promptWrap: {
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 30,
    },
    promptIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    promptTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 8,
    },
    promptSub: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 21,
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

    /* Empty state */
    emptyIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0f172a',
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
        backgroundColor: '#3b82f6',
        borderRadius: 22,
    },
    emptyResetText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },

    /* Results list */
    listContent: {
        padding: 14,
        paddingBottom: 40,
    },

    /* Result card */
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: '#e2e8f0',
    },
    cardThumb: {
        width: 100,
        height: 100,
        position: 'relative',
    },
    cardImg: {
        width: '100%',
        height: '100%',
    },
    cardImgFallback: {
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTagWrap: {
        position: 'absolute',
        bottom: 7,
        left: 7,
        backgroundColor: 'rgba(15,23,42,0.75)',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    cardTag: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    cardBody: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 4,
    },
    cardName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
        lineHeight: 19,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
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
        backgroundColor: '#f1f5f9',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    featureText: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '500',
    },
    cardPrice: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1d4ed8',
        marginTop: 4,
    },
    cardChevron: {
        marginRight: 12,
    },
});
