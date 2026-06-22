
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
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useTheme } from '@/context/ThemeContext';

export default function CompanyProperties() {

    const { show } = useToast();
    const { colors } = useTheme();
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


    const formatPrice = (price: any) => {
        const n = Number(String(price ?? 0).replace(/,/g, ''));
        return Number.isFinite(n) ? n.toLocaleString() : '0';
    };

    const fetchProperties = async () => {

        try {

            const token = await AsyncStorage.getItem('authToken');

            const response = await fetch(
                `https://insighthub.com.ng/NestifyAPI/get_Company_properties.php?companyId=${id}&approval_status=approved`,
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



        return (
            <TouchableOpacity
                activeOpacity={0.92}
                onPress={() =>
                    router.push({
                        pathname: '/Home/Properties/Details',
                        params: {
                            id: String(item.id),
                        },
                    })
                }
                style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: 24,
                    overflow: 'hidden',
                    marginBottom: 24,
                    shadowColor: colors.shadow,
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
                        source={{ uri: `https://insighthub.com.ng/${item.images[0]}` }}
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
                                color: colors.background,
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
                                fontSize: 18,
                                fontWeight: '800',
                            }}
                        >


                            {item.listingType === "Rent"
                                ? `₦${formatPrice(item.rentPrice)}`
                                : item.listingType === "Sell"
                                    ? `₦${formatPrice(item.sellPrice)}`
                                    : `₦${formatPrice(item.sellPrice)} / ₦${formatPrice(item.rentPrice)}`}
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
                            color: colors.text,
                            lineHeight: 28,
                        }}
                    >
                        {item.propertyTitle ||
                            item.title ||
                            item.propertyName}
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
                            color={colors.icon}
                        />

                        <Text
                            style={{
                                marginLeft: 5,
                                color: colors.mutedText,
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
                            borderTopColor: colors.border,
                            paddingTop: 16,
                        }}
                    >

                        {/* BEDROOM */}
                        <View style={{ alignItems: 'center' }}>

                            <Ionicons
                                name='bed-outline'
                                size={20}
                                color={colors.icon}
                            />

                            <Text
                                style={{
                                    marginTop: 6,
                                    fontWeight: '800',
                                    color: colors.text,
                                }}
                            >
                                {item.bedrooms || 0}
                            </Text>

                            <Text
                                style={{
                                    marginTop: 2,
                                    color: colors.mutedText,
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
                                color={colors.icon}
                            />

                            <Text
                                style={{
                                    marginTop: 6,
                                    fontWeight: '800',
                                    color: colors.text,
                                }}
                            >
                                {item.Toilet || 0}
                            </Text>

                            <Text
                                style={{
                                    marginTop: 2,
                                    color: colors.mutedText,
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
                                color={colors.icon}
                            />

                            <Text
                                style={{
                                    marginTop: 6,
                                    fontWeight: '800',
                                    color: colors.text,
                                }}
                            >
                                {item.views_count || 0}
                            </Text>

                            <Text
                                style={{
                                    marginTop: 2,
                                    color: colors.mutedText,
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
                    backgroundColor: colors.background,
                }}
            >
                <ActivityIndicator
                    size='large'
                    color={colors.buttonBackground}
                />
            </View>
        );
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.background,
                paddingTop: getStatusBarHeight(),
            }}
        >

            {/* HEADER */}
            <View
                style={{
                    paddingTop: 18,
                    paddingBottom: 18,
                    paddingHorizontal: 20,
                    backgroundColor: colors.cardBackground,
                }}
            >


                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Ionicons
                        name='arrow-back'
                        size={24}
                        color={colors.icon}
                        onPress={() => router.back()}

                    />

                    <Text
                        style={{
                            fontSize: 28,
                            fontWeight: '800',
                            color: colors.text,
                            marginLeft: 16,
                        }}
                    >
                        {company_name || 'Company Listings'}

                    </Text>
                </View>




                <Text
                    style={{
                        marginTop: 5,
                        color: colors.mutedText,
                        fontSize: 14,
                    }}
                >
                    {filteredProperties.length} active properties available
                </Text>

                {/* SEARCH */}
                <View
                    style={{
                        marginTop: 18,
                        backgroundColor: colors.inputBackground,
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
                        color={colors.icon}
                    />

                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder='Search properties...'
                        placeholderTextColor={colors.mutedText}
                        style={{
                            flex: 1,
                            marginLeft: 10,
                            color: colors.text,
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
                                        ? colors.buttonBackground
                                        : colors.inputBackground,
                                }}
                            >
                                <Text
                                    style={{
                                        color: active
                                            ? colors.background
                                            : colors.text,
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
                        tintColor={colors.buttonBackground}
                        colors={[colors.buttonBackground]}
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
                            color={colors.mutedText}
                        />

                        <Text
                            style={{
                                marginTop: 16,
                                fontSize: 20,
                                fontWeight: '800',
                                color: colors.text,
                            }}
                        >
                            No properties found
                        </Text>

                        <Text
                            style={{
                                marginTop: 6,
                                color: colors.mutedText,
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
