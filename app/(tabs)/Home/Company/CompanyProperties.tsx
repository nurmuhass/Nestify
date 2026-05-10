
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useToast } from '../../../../components/Toast';

export default function CompanyProperties() {

    const { show } = useToast();
    const router = useRouter();

    const { id, company_name } = useLocalSearchParams<{
        id: string;
        company_name?: string;
    }>();

    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        fetchProperties();
    }, [id]);

    const fetchProperties = async () => {

        try {

            const token = await AsyncStorage.getItem('authToken');

            const response = await fetch(
                `https://insighthub.com.ng/NestifyAPI/get_company_properties.php?company_id=${id}`,
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

                setProperties(result.properties || result.data || []);

            } else {

                show({
                    type: 'error',
                    title: 'Error',
                    message: result.msg || 'Failed to load properties',
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
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchProperties();
    };

    const filteredProperties = useMemo(() => {

        return properties.filter((item) => {

            const propertyTitle =
                item.propertyTitle ||
                item.title ||
                item.property_name ||
                '';

            const matchesSearch =
                propertyTitle
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                item.city
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                item.state
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            if (search && !matchesSearch) {
                return false;
            }

            if (activeTab === 'Rent') {
                return item.listingType === 'Rent';
            }

            if (activeTab === 'Sell') {
                return item.listingType === 'Sell';
            }

            return true;
        });

    }, [properties, search, activeTab]);

    const renderProperty = ({ item }: any) => {

        const image =
            item.thumbnail_image ||
            item.thumbnail ||
            item.images?.[0] ||
            'https://via.placeholder.com/400';

        return (
            <TouchableOpacity
                activeOpacity={0.92}
                onPress={() =>
                    router.push({
                        pathname: '/Home/ProductDetail',
                        params: {
                            id: String(item.id),
                        },
                    })
                }
                style={{
                    backgroundColor: '#fff',
                    borderRadius: 24,
                    overflow: 'hidden',
                    marginBottom: 24,
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    elevation: 5,
                }}
            >

                {/* IMAGE */}
                <View style={{ height: 240 }}>

                    <Image
                        source={{ uri: image }}
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                    />

                    {/* OVERLAY */}
                    <LinearGradient
                        colors={[
                            'transparent',
                            'rgba(0,0,0,0.82)',
                        ]}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                        }}
                    />

                    {/* LISTING TYPE */}
                    <View
                        style={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            backgroundColor:
                                item.listingType === 'Rent'
                                    ? '#0f766e'
                                    : '#c9a84c',
                            borderRadius: 20,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                        }}
                    >
                        <Text
                            style={{
                                color: '#fff',
                                fontWeight: '700',
                                fontSize: 11,
                            }}
                        >
                            FOR {item.listingType?.toUpperCase()}
                        </Text>
                    </View>

                    {/* FEATURED */}
                    {item.is_premium_listing == 1 && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                backgroundColor: '#111827',
                                borderRadius: 20,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <Ionicons
                                name='sparkles'
                                size={12}
                                color='#fff'
                            />

                            <Text
                                style={{
                                    color: '#fff',
                                    fontWeight: '700',
                                    fontSize: 11,
                                    marginLeft: 5,
                                }}
                            >
                                PREMIUM
                            </Text>
                        </View>
                    )}

                    {/* PRICE */}
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 16,
                            left: 16,
                        }}
                    >
                        <Text
                            style={{
                                color: '#fff',
                                fontSize: 24,
                                fontWeight: '800',
                            }}
                        >
                            ₦{Number(item.price || 0).toLocaleString()}
                        </Text>

                        {item.listingType === 'Rent' && (
                            <Text
                                style={{
                                    color: '#e2e8f0',
                                    marginTop: 2,
                                }}
                            >
                                per year
                            </Text>
                        )}
                    </View>

                </View>

                {/* CONTENT */}
                <View
                    style={{
                        padding: 18,
                    }}
                >

                    {/* TITLE */}
                    <Text
                        numberOfLines={2}
                        style={{
                            fontSize: 20,
                            fontWeight: '800',
                            color: '#0f172a',
                            lineHeight: 28,
                        }}
                    >
                        {item.propertyTitle ||
                            item.title ||
                            item.property_name}
                    </Text>

                    {/* LOCATION */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 10,
                        }}
                    >

                        <Ionicons
                            name='location-outline'
                            size={16}
                            color='#64748b'
                        />

                        <Text
                            style={{
                                marginLeft: 5,
                                color: '#64748b',
                                fontSize: 14,
                            }}
                        >
                            {item.city}, {item.state}
                        </Text>

                    </View>

                    {/* FEATURES */}
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 22,
                            borderTopWidth: 1,
                            borderTopColor: '#f1f5f9',
                            paddingTop: 16,
                        }}
                    >

                        {/* BEDROOM */}
                        <View style={{ alignItems: 'center' }}>

                            <Ionicons
                                name='bed-outline'
                                size={20}
                                color='#0f172a'
                            />

                            <Text
                                style={{
                                    marginTop: 6,
                                    fontWeight: '800',
                                    color: '#0f172a',
                                }}
                            >
                                {item.bedrooms || 0}
                            </Text>

                            <Text
                                style={{
                                    marginTop: 2,
                                    color: '#64748b',
                                    fontSize: 12,
                                }}
                            >
                                Bedrooms
                            </Text>

                        </View>

                        {/* BATHROOM */}
                        <View style={{ alignItems: 'center' }}>

                            <Ionicons
                                name='water-outline'
                                size={20}
                                color='#0f172a'
                            />

                            <Text
                                style={{
                                    marginTop: 6,
                                    fontWeight: '800',
                                    color: '#0f172a',
                                }}
                            >
                                {item.bathrooms || 0}
                            </Text>

                            <Text
                                style={{
                                    marginTop: 2,
                                    color: '#64748b',
                                    fontSize: 12,
                                }}
                            >
                                Bathrooms
                            </Text>

                        </View>

                        {/* VIEWS */}
                        <View style={{ alignItems: 'center' }}>

                            <Ionicons
                                name='eye-outline'
                                size={20}
                                color='#0f172a'
                            />

                            <Text
                                style={{
                                    marginTop: 6,
                                    fontWeight: '800',
                                    color: '#0f172a',
                                }}
                            >
                                {item.views_count || 0}
                            </Text>

                            <Text
                                style={{
                                    marginTop: 2,
                                    color: '#64748b',
                                    fontSize: 12,
                                }}
                            >
                                Views
                            </Text>

                        </View>

                    </View>

                </View>

            </TouchableOpacity>
        );
    };

    if (loading) {

        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                }}
            >
                <ActivityIndicator
                    size='large'
                    color='#c9a84c'
                />
            </View>
        );
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#f8fafc',
            }}
        >

            {/* HEADER */}
            <View
                style={{
                    paddingTop: 18,
                    paddingBottom: 18,
                    paddingHorizontal: 20,
                    backgroundColor: '#fff',
                }}
            >

                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: '800',
                        color: '#0f172a',
                    }}
                >
                    {company_name || 'Company Listings'}
                </Text>

                <Text
                    style={{
                        marginTop: 5,
                        color: '#64748b',
                        fontSize: 14,
                    }}
                >
                    {filteredProperties.length} active properties available
                </Text>

                {/* SEARCH */}
                <View
                    style={{
                        marginTop: 18,
                        backgroundColor: '#f1f5f9',
                        height: 54,
                        borderRadius: 18,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                    }}
                >

                    <Ionicons
                        name='search'
                        size={20}
                        color='#64748b'
                    />

                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder='Search properties...'
                        placeholderTextColor='#94a3b8'
                        style={{
                            flex: 1,
                            marginLeft: 10,
                            color: '#0f172a',
                            fontSize: 15,
                        }}
                    />

                </View>

                {/* FILTERS */}
                <View
                    style={{
                        flexDirection: 'row',
                        marginTop: 18,
                    }}
                >

                    {['All', 'Rent', 'Sell'].map((tab) => {

                        const active = activeTab === tab;

                        return (
                            <TouchableOpacity
                                key={tab}
                                activeOpacity={0.8}
                                onPress={() => setActiveTab(tab)}
                                style={{
                                    marginRight: 12,
                                    paddingHorizontal: 18,
                                    paddingVertical: 10,
                                    borderRadius: 30,
                                    backgroundColor: active
                                        ? '#0f172a'
                                        : '#e2e8f0',
                                }}
                            >
                                <Text
                                    style={{
                                        color: active
                                            ? '#fff'
                                            : '#334155',
                                        fontWeight: '700',
                                    }}
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                </View>

            </View>

            {/* LIST */}
            <FlatList
                data={filteredProperties}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderProperty}
                contentContainerStyle={{
                    padding: 20,
                    paddingBottom: 120,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={() => (
                    <View
                        style={{
                            marginTop: 100,
                            alignItems: 'center',
                        }}
                    >

                        <Ionicons
                            name='home-outline'
                            size={60}
                            color='#cbd5e1'
                        />

                        <Text
                            style={{
                                marginTop: 16,
                                fontSize: 20,
                                fontWeight: '800',
                                color: '#334155',
                            }}
                        >
                            No properties found
                        </Text>

                        <Text
                            style={{
                                marginTop: 6,
                                color: '#94a3b8',
                                textAlign: 'center',
                            }}
                        >
                            This company has no available listings yet
                        </Text>

                    </View>
                )}
            />

        </View>
    );
}
