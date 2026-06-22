import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useToast } from './Toast';
import { useTheme } from '@/context/ThemeContext';

type Props = {
    companyId: string | number;
};

export default function RelatedCompanies({
    companyId,
}: Props) {

    const { show } = useToast();
    const { colors } = useTheme();
    const router = useRouter();

    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (companyId) {
            fetchCompanies();
        }

    }, [companyId]);

    const fetchCompanies = async () => {

        try {

            const token = await AsyncStorage.getItem('authToken');

            const response = await fetch(
                `https://insighthub.com.ng/NestifyAPI/get_related_companies.php?company_id=${companyId}&limit=6`,
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

            } else {

                show({
                    type: 'error',
                    title: 'Error',
                    message: result.msg || 'Failed to load related companies',
                });
                console.error('API Error:', result.msg);
            }

        } catch (err: any) {

            show({
                type: 'error',
                title: 'Error',
                message: err.message,
            });

        } finally {

            setLoading(false);
        }
    };

    /* =========================================
       LOADING
       ========================================= */

    if (loading) {

        return (
            <View
                style={{
                    height: 220,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <ActivityIndicator
                    size="large"
                    color={colors.buttonBackground}
                />
            </View>
        );
    }

    /* =========================================
       EMPTY
       ========================================= */

    if (companies.length === 0) {
        return null;
    }

    /* =========================================
       UI
       ========================================= */

    return (
        <View
            style={{
                marginTop: 0,
                marginBottom: 10,
            }}
        >

            {/* HEADER */}
            <View
                style={{
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                }}
            >

                <View>

                    <Text
                        style={{
                            fontSize: 22,
                            fontWeight: '800',
                            color: colors.text,
                        }}
                    >
                        Similar Agencies
                    </Text>

                    <Text
                        style={{
                            marginTop: 4,
                            color: colors.mutedText,
                            fontSize: 13,
                        }}
                    >
                        Agencies you may also like
                    </Text>

                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                        router.push('/Home/Company/AllCompanies')
                    }
                >

                    <Text
                        style={{
                            color: colors.buttonBackground,
                            fontWeight: '700',
                        }}
                    >
                        View All
                    </Text>

                </TouchableOpacity>

            </View>

            {/* COMPANIES */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingLeft: 20,
                    paddingRight: 10,
                }}
            >

                {companies.map((company: any) => {

                    const logo =
                        company.profile_image ||
                        'https://via.placeholder.com/100';

                    const cover =
                        company.company_cover_image ||
                        company.profile_image;

                    return (

                        <TouchableOpacity
                            key={company.id}
                            activeOpacity={0.9}
                            onPress={() =>
                                router.push({
                                    pathname: '/Home/Company/CompanyScreen',
                                    params: {
                                        id: String(company.id),
                                    },
                                })
                            }
                            style={{
                                width: 285,
                                marginRight: 18,
                                borderRadius: 24,
                                overflow: 'hidden',
                                backgroundColor: colors.cardBackground,
                                shadowColor: colors.shadow,
                                shadowOpacity: 0.12,
                                shadowRadius: 12,
                                shadowOffset: {
                                    width: 0,
                                    height: 5,
                                },
                                elevation: 6,
                            }}
                        >

                            {/* COVER */}
                            <View
                                style={{
                                    height: 170,
                                }}
                            >

                                <Image
                                    source={{ uri: cover }}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                    }}
                                />

                                {/* OVERLAY */}
                                <LinearGradient
                                    colors={[
                                        'transparent',
                                        'rgba(0,0,0,0.75)',
                                    ]}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                    }}
                                />

                                {/* MATCH BADGE */}
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: 14,
                                        left: 14,
                                        backgroundColor: colors.inputBackground,
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 20,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >

                                        <Ionicons
                                            name="sparkles"
                                            size={12}
                                            color={colors.icon}
                                    />

                                    <Text
                                        style={{
                                            color: colors.text,
                                            fontSize: 11,
                                            fontWeight: '700',
                                            marginLeft: 5,
                                        }}
                                    >
                                        SIMILAR
                                    </Text>

                                </View>

                                {/* ACTIVE */}
                                {company.is_online == 1 && (

                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: 14,
                                            right: 14,
                                            backgroundColor: colors.success,
                                            paddingHorizontal: 10,
                                            paddingVertical: 5,
                                            borderRadius: 20,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                    >

                                        <View
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: colors.background,
                                                marginRight: 6,
                                            }}
                                        />

                                        <Text
                                            style={{
                                                color: colors.background,
                                                fontSize: 11,
                                                fontWeight: '700',
                                            }}
                                        >
                                            ACTIVE
                                        </Text>

                                    </View>
                                )}

                                {/* LOGO */}
                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: -28,
                                        left: 18,
                                        backgroundColor: colors.cardBackground,
                                        borderRadius: 18,
                                        padding: 4,
                                    }}
                                >

                                    <Image
                                        source={{ uri: logo }}
                                        style={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: 16,
                                        }}
                                    />

                                </View>

                            </View>

                            {/* CONTENT */}
                            <View
                                style={{
                                    paddingTop: 38,
                                    paddingHorizontal: 18,
                                    paddingBottom: 18,
                                }}
                            >

                                {/* NAME */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >

                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            flex: 1,
                                            fontSize: 18,
                                            fontWeight: '800',
                                            color: colors.text,
                                        }}
                                    >
                                        {company?.company_name || company?.name}
                                    </Text>

                                    {company.seller_verified == 1 && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={18}
                                        color={colors.success}
                                        />
                                    )}

                                </View>

                                {/* LOCATION */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: 6,
                                    }}
                                >

                                    <Ionicons
                                        name="location-outline"
                                        size={14}
                                    color={colors.icon}
                                    />

                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            marginLeft: 5,
                                            color: colors.mutedText,
                                            fontSize: 13,
                                            flex: 1,
                                        }}
                                    >
                                        {company.city}, {company.state}
                                    </Text>

                                </View>

                                {/* STATS */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        marginTop: 20,
                                        borderTopWidth: 1,
                                        borderTopColor: colors.border,
                                        paddingTop: 16,
                                    }}
                                >

                                    {/* LISTINGS */}
                                    <View
                                        style={{
                                            alignItems: 'center',
                                        }}
                                    >

                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontWeight: '800',
                                                color: colors.text,
                                            }}
                                        >
                                            {company.properties_count || 0}
                                        </Text>

                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: colors.mutedText,
                                                marginTop: 3,
                                            }}
                                        >
                                            Listings
                                        </Text>

                                    </View>

                                    {/* RATING */}
                                    <View
                                        style={{
                                            alignItems: 'center',
                                        }}
                                    >

                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontWeight: '800',
                                                color: colors.text,
                                            }}
                                        >
                                            {company.average_rating || '0.0'}
                                        </Text>

                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: colors.mutedText,
                                                marginTop: 3,
                                            }}
                                        >
                                            Rating
                                        </Text>

                                    </View>

                                    {/* VIEWS */}
                                    <View
                                        style={{
                                            alignItems: 'center',
                                        }}
                                    >

                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontWeight: '800',
                                                color: colors.text,
                                            }}
                                        >
                                            {company.company_views || 0}
                                        </Text>

                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: colors.mutedText,
                                                marginTop: 3,
                                            }}
                                        >
                                            Views
                                        </Text>

                                    </View>

                                </View>

                            </View>

                        </TouchableOpacity>
                    );
                })}

            </ScrollView>

        </View>
    );
}
