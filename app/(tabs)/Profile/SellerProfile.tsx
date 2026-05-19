// SellerProfile.tsx

import {
    AntDesign,
    Ionicons,
    MaterialIcons,
} from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useFocusEffect, useRouter } from "expo-router";

import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import ConfirmModal from "../../../components/ConfirmModal";
import PricingModal from "../../../components/PricingModal";

import { getStatusBarHeight } from "react-native-status-bar-height";

import { AuthContext } from "@/store";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const BASE = "https://insighthub.com.ng";

const GOLD = "#C9A84C";
const DARK = "#1A1A2E";
const DARK2 = "#16213E";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const formatPrice = (v: any) =>
    Number(String(v).replace(/,/g, "")).toLocaleString("en-NG");

const isBoosted = (boostedUntil: any) => {
    if (!boostedUntil) return false;

    try {
        return new Date(boostedUntil) > new Date();
    } catch {
        return false;
    }
};

// ─────────────────────────────────────────────
// PREMIUM BANNER
// ─────────────────────────────────────────────

const PremiumBanner = ({
    onUpgrade,
}: {
    onUpgrade: () => void;
}) => (
    <TouchableOpacity
        style={styles.premiumBanner}
        onPress={onUpgrade}
    >
        <View style={styles.premiumBannerLeft}>
            <MaterialIcons name="star" size={18} color={GOLD} />

            <View>
                <Text style={styles.premiumBannerTitle}>
                    Unlock Premium
                </Text>

                <Text style={styles.premiumBannerSub}>
                    Chat, analytics & priority listing
                </Text>
            </View>
        </View>

        <View style={styles.premiumBannerBtn}>
            <Text style={styles.premiumBannerBtnText}>
                Upgrade
            </Text>
        </View>
    </TouchableOpacity>
);

// ─────────────────────────────────────────────
// PROPERTY SKELETON
// ─────────────────────────────────────────────

const PropertyGridSkeleton = () => {
    return (
        <View style={styles.propGrid}>
            {[1, 2, 3, 4].map((item) => (
                <View key={item} style={styles.skeletonCard}>
                    <View style={styles.skeletonImage} />

                    <View style={styles.skeletonBody}>
                        <View style={styles.skeletonLineLarge} />
                        <View style={styles.skeletonLineMedium} />
                        <View style={styles.skeletonLineSmall} />
                    </View>
                </View>
            ))}
        </View>
    );
};

// ─────────────────────────────────────────────
// SELLER PROFILE
// ─────────────────────────────────────────────

function SellerProfile({
    user,
    onSettings,
    onMessages,
}: any) {
    const router = useRouter();

    const { signOut } = useContext(AuthContext);

    const [activeTab, setActiveTab] =
        useState("Properties");

    const [approvedProperties, setApprovedProperties] = useState<any[]>([]);
    const [pendingProperties, setPendingProperties] = useState<any[]>([]);
    const [estates, setEstates] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [saved, setSaved] = useState<any[]>([]);

    const [initialLoading, setInitialLoading] =
        useState(true);

    useEffect(() => {
        console.log("Estates State:", estates);
    }, [estates]);

    const [pricingVisible, setPricingVisible] =
        useState(false);

    const [logoutConfirmVisible, setLogoutConfirmVisible] =
        useState(false);

    const [logoutLoading, setLogoutLoading] =
        useState(false);

    const isPremium = user?.plan_type === "premium";

    // ─────────────────────────────────────────────
    // FETCH ALL
    // ─────────────────────────────────────────────

    // fetchAllData is defined after the individual fetchers so dependencies are initialized.

    // ─────────────────────────────────────────────
    // FETCHERS
    // ─────────────────────────────────────────────  
    const fetchProperties = useCallback(async () => {
        try {

            const token =
                await AsyncStorage.getItem("authToken");

            // APPROVED
            const approvedRes = await fetch(
                `${BASE}/NestifyAPI/get_Company_properties.php?companyId=${user.id}&approval_status=approved`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            const approvedResult =
                await approvedRes.json();

            // PENDING
            const pendingRes = await fetch(
                `${BASE}/NestifyAPI/get_Company_properties.php?companyId=${user.id}&approval_status=pending`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            const pendingResult =
                await pendingRes.json();

            if (approvedResult.status === "success") {
                setApprovedProperties(
                    approvedResult.properties ?? []
                );
            }

            if (pendingResult.status === "success") {
                setPendingProperties(
                    pendingResult.properties ?? []
                );
            }

        } catch (e) {
            console.log(e);
        }
    }, [user?.id]);

    const fetchSaved = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");

            const res = await fetch(
                `${BASE}/NestifyAPI/get_liked_properties.php`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            const result = await res.json();

            if (result.status === "success") {
                setSaved(result.data ?? []);
            }
        } catch (e) {
            console.log(e);
        }
    }, []);

    const fetchEstates = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");

            const res = await fetch(
                `${BASE}/NestifyAPI/get_Company_Estate.php?companyId=${user.id}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            const result = await res.json();

            if (result.status === "success") {
                setEstates(result.Estates ?? []);

                console.log("Estates Result:", result.Estates); // Debug log
            }
        } catch (e) {
            console.log(e);
        }
    }, [user?.id]);

    const fetchStaff = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");

            const res = await fetch(
                `${BASE}/NestifyAPI/get_company_staffs.php?companyId=${user.id}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            const result = await res.json();

            if (result.status === "success") {
                setStaff(result.staffs ?? []);
            }
        } catch (e) {
            console.log(e);
        }
    }, [user?.id]);

    // ─────────────────────────────────────────────
    // FETCH ALL
    // ─────────────────────────────────────────────

    const fetchAllData = useCallback(async () => {
        try {
            setInitialLoading(true);

            await Promise.all([
                fetchProperties(),
                fetchSaved(),
                fetchEstates(),
                fetchStaff(),
            ]);
        } catch (e) {
            console.log(e);
        } finally {
            setInitialLoading(false);
        }
    }, [fetchProperties, fetchSaved, fetchEstates, fetchStaff]);

    useFocusEffect(
        useCallback(() => {
            if (user?.id) {
                fetchAllData();
            }
        }, [fetchAllData, user?.id])
    );

    // ─────────────────────────────────────────────
    // LOGOUT
    // ─────────────────────────────────────────────

    const handleLogout = async () => {
        setLogoutLoading(true);

        try {
            await signOut();
            router.replace("/(auth)/Login");
        } finally {
            setLogoutLoading(false);
            setLogoutConfirmVisible(false);
        }
    };

    // ─────────────────────────────────────────────
    // TABS
    // ─────────────────────────────────────────────

    const TABS = useMemo(() => {
        const tabs = ["Properties", "Pending"];

        const sellerType =
            user?.seller_type || user?.sellerType;

        if (sellerType === "company") {
            tabs.push("Estates");
            tabs.push("Staffs");
        }

        return tabs;
    }, [user]);

    // ─────────────────────────────────────────────
    // TAB DATA
    // ─────────────────────────────────────────────
    const tabData = useMemo(() => {

        if (activeTab === "Properties") {
            return approvedProperties;
        }

        if (activeTab === "Pending") {
            return pendingProperties;
        }

        if (activeTab === "Estates") {
            return estates;
        }

        if (activeTab === "Staffs") {
            return staff;
        }

        return [];

    }, [
        activeTab,
        approvedProperties,
        pendingProperties,
        estates,
        staff
    ]);

    // ─────────────────────────────────────────────
    // PROPERTY CARD
    // ─────────────────────────────────────────────

    const renderPropertyCard = (item: any) => (
        <TouchableOpacity
            key={`property-${item.id}`}
            style={styles.sellerPropCard}
            onPress={() =>
                router.push({
                    pathname: "/Profile/EditProperty",
                    params: { id: item.id },
                })
            }
        >
            <Image
                source={{
                    uri: `${BASE}/${item.images?.[0]}`,
                }}
                style={styles.sellerPropImg}
            />

            <View style={styles.sellerPropOverlay}>
                {isBoosted(item.boosted_until) && (
                    <View style={styles.featuredBadge}>
                        <MaterialIcons
                            name="star"
                            size={12}
                            color="#fff"
                        />

                        <Text style={styles.featuredBadgeText}>
                            Featured
                        </Text>
                    </View>
                )}

                <View
                    style={[
                        styles.sellerStatusPill,
                        {
                            backgroundColor:
                                item.status === "available"
                                    ? "#166534"
                                    : item.status === "sold"
                                        ? "#991b1b"
                                        : "#374151",
                        },
                    ]}
                >
                    <Text style={styles.sellerStatusText}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.sellerPropBody}>
                <Text
                    style={styles.sellerPropName}
                    numberOfLines={1}
                >
                    {item.propertyName}
                </Text>

                <Text style={styles.sellerPropPrice}>
                    ₦
                    {item.listingType === "Rent"
                        ? formatPrice(item.rentPrice)
                        : formatPrice(item.sellPrice)}
                </Text>

                <View style={styles.sellerPropMeta}>
                    <Text style={styles.sellerPropCity}>
                        {item.city}
                    </Text>

                    {item.created_at && (
                        <Text style={styles.sellerPropDate}>
                            {formatDate(item.created_at)}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEstateCard = (item: any) => (
        <TouchableOpacity
            key={`estate-${item.id}`}
            style={styles.estateCard}
            activeOpacity={0.85}
            onPress={() =>
                router.push({ pathname: "/Home/EstateCompanyDetails", params: { id: item.id } })
            }
        >
            <Image
                source={{ uri: item.image_path }}
                style={{ width: 90, height: 80 }}
                resizeMode="cover"
            />
            <View style={styles.estateCardBody}>
                <Text style={styles.estateTitle} numberOfLines={1}>
                    {item.name || item.estate_name || 'Untitled Estate'}
                </Text>
                <Text style={styles.estateSubtitle} numberOfLines={1}>
                    {item.location || item.city || item.state || 'No location'}
                </Text>
                <Text style={styles.estateMeta} numberOfLines={1}>
                    {item.total_properties
                        ? `${item.total_properties} properties`
                        : item.num_properties
                            ? `${item.num_properties} properties`
                            : 'No properties'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderStaffCard = (item: any) => (
        <View
            key={`staff-${item.id}`}
            style={styles.staffCard}
        >
            <Text style={styles.staffName} numberOfLines={1}>
                {item.name || item.staff_name || 'Unnamed'}
            </Text>
            <Text style={styles.staffRole} numberOfLines={1}>
                {item.role || item.position || 'Staff'}
            </Text>
        </View>
    );

    // ─────────────────────────────────────────────
    // RENDER CONTENT
    // ─────────────────────────────────────────────

    const renderTabContent = () => {
        if (initialLoading) {
            return <PropertyGridSkeleton />;
        }

        if (tabData.length === 0) {
            return (
                <View style={styles.emptyTab}>
                    <MaterialIcons
                        name="inbox"
                        size={36}
                        color="#555"
                    />

                    <Text style={styles.emptyTabText}>
                        No {activeTab.toLowerCase()} yet
                    </Text>
                </View>
            );
        }

        if (
            activeTab === "Properties" ||
            activeTab === "Pending"
        ) {
            return (
                <View style={styles.propGrid}>
                    {tabData.map(renderPropertyCard)}
                </View>
            );
        }

        if (activeTab === "Estates") {
            return (
                <View style={styles.tabList}>
                    {estates.map(renderEstateCard)}
                </View>
            );
        }

        if (activeTab === "Staffs") {
            return (
                <View style={styles.tabList}>
                    {staff.map(renderStaffCard)}
                </View>
            );
        }

        return null;
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: "#0F0F1A",
                },
            ]}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                {/* HERO */}

                <View style={styles.sellerHero}>
                    {user.cover_image ? (
                        <Image
                            source={{ uri: user.cover_image }}
                            style={StyleSheet.absoluteFillObject}
                        />
                    ) : (
                        <View style={styles.heroPattern} />
                    )}

                    <View style={styles.heroOverlay} />

                    <View style={styles.heroTopBar}>
                        <TouchableOpacity
                            style={styles.heroBtnDark}
                            onPress={onMessages}
                        >
                            <AntDesign
                                name="message1"
                                size={18}
                                color="#fff"
                            />
                        </TouchableOpacity>

                        <View style={styles.heroTopRight}>
                            {isPremium && (
                                <View style={styles.premiumPill}>
                                    <MaterialIcons
                                        name="star"
                                        size={11}
                                        color={GOLD}
                                    />

                                    <Text
                                        style={styles.premiumPillText}
                                    >
                                        Premium
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={() =>
                                    setLogoutConfirmVisible(true)
                                }
                            >
                                <Ionicons
                                    name="log-out-outline"
                                    size={19}
                                    color="rgba(255,255,255,0.68)"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.heroBtnDark}
                                onPress={onSettings}
                            >
                                <Ionicons
                                    name="settings-outline"
                                    size={18}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.heroBottom}>
                        <View style={styles.sellerAvatarWrap}>
                            {user.profile_image ? (
                                <Image
                                    source={{
                                        uri: user.profile_image,
                                    }}
                                    style={styles.sellerAvatar}
                                />
                            ) : (
                                <View
                                    style={[
                                        styles.sellerAvatar,
                                        styles.sellerAvatarFallback,
                                    ]}
                                >
                                    <Text
                                        style={
                                            styles.sellerAvatarInitial
                                        }
                                    >
                                        {(
                                            user.company_name ??
                                            user.name ??
                                            "?"
                                        )[0].toUpperCase()}
                                    </Text>
                                </View>
                            )}

                            {user.seller_verified === "1" ? (

                                <View style={styles.verifiedDot}>
                                    <MaterialIcons
                                        name="verified"
                                        size={16}
                                        color={GOLD}
                                    />
                                </View>

                            ) : (
                                null
                            )}

                        </View>
                    </View>
                </View>

                {/* IDENTITY */}

                <View style={styles.sellerIdentity}>
                    <Text style={styles.sellerName}>
                        {user.company_name ?? user.name}
                    </Text>
                    <View style={styles.sellerSubRow}>
                        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "500" }}>
                            {user.city}, {user.state}
                        </Text>
                        <Text style={styles.sellerEstablished}>
                            Established{" "}
                            {user.date_established
                                ? new Date(
                                    user.date_established
                                ).getFullYear()
                                : "N/A"}
                        </Text>
                    </View>

                    {/* STATS */}

                    <View style={styles.sellerStats}>
                        <View style={styles.sellerStatItem}>
                            <Text style={styles.sellerStatNum}>
                                {approvedProperties.length + pendingProperties.length}
                            </Text>

                            <Text style={styles.sellerStatLbl}>
                                Properties
                            </Text>
                        </View>

                        <View style={styles.sellerStatDivider} />

                        <View style={styles.sellerStatItem}>
                            <Text style={styles.sellerStatNum}>
                                {estates.length}
                            </Text>

                            <Text style={styles.sellerStatLbl}>
                                Estates
                            </Text>
                        </View>

                        <View style={styles.sellerStatDivider} />

                        <TouchableOpacity
                            style={styles.sellerStatItem}
                            onPress={() =>
                                router.push({
                                    pathname:
                                        "../Profile/UserReviews",
                                    params: {
                                        company_id: user.id,
                                        company_name:
                                            user.company_name,
                                    },
                                })
                            }
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 3,
                                }}
                            >
                                <Text
                                    style={styles.sellerStatNum}
                                >
                                    {Number(
                                        user.average_rating ?? 0
                                    ).toFixed(1)}
                                </Text>

                                <MaterialIcons
                                    name="star"
                                    size={13}
                                    color={GOLD}
                                />
                            </View>

                            <Text style={styles.sellerStatLbl}>
                                {user.review_count ?? 0} Reviews
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.sellerStatDivider} />

                        <TouchableOpacity
                            style={styles.sellerStatItem}
                            onPress={() =>
                                router.push(
                                    "../Profile/Wishlist"
                                )
                            }
                        >
                            <Text style={styles.sellerStatNum}>
                                {saved.length}
                            </Text>

                            <Text style={styles.sellerStatLbl}>
                                Wishlists
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* CTA */}

                    <View style={styles.sellerCtaRow}>
                        <TouchableOpacity
                            style={styles.sellerCtaPrimary}
                            onPress={() =>
                                router.push("../Publish")
                            }
                        >
                            <Ionicons
                                name="add"
                                size={16}
                                color="#0F0F1A"
                            />

                            <Text
                                style={
                                    styles.sellerCtaPrimaryText
                                }
                            >
                                Add Property
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sellerCtaSecondary}
                            onPress={() =>
                                router.push(
                                    "../Profile/EditProfile"
                                )
                            }
                        >
                            <Ionicons
                                name="pencil-outline"
                                size={15}
                                color={GOLD}
                            />

                            <Text
                                style={
                                    styles.sellerCtaSecondaryText
                                }
                            >
                                Edit Profile
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sellerCtaIcon}
                            onPress={() =>
                                router.push({
                                    pathname:
                                        "../Profile/UserReviews",
                                    params: {
                                        company_id: user.id,
                                        company_name:
                                            user.company_name,
                                    },
                                })
                            }
                        >
                            <MaterialIcons
                                name="rate-review"
                                size={18}
                                color={GOLD}
                            />
                        </TouchableOpacity>
                    </View>

                    {!isPremium && (
                        <PremiumBanner
                            onUpgrade={() =>
                                setPricingVisible(true)
                            }
                        />
                    )}
                </View>

                {/* TABS */}

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabScroll}
                    contentContainerStyle={
                        styles.tabScrollContent
                    }
                >
                    {TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={styles.sellerTab}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text
                                style={[
                                    styles.sellerTabText,
                                    activeTab === tab &&
                                    styles.sellerTabTextActive,
                                ]}
                            >
                                {tab}
                            </Text>

                            {activeTab === tab && (
                                <View
                                    style={
                                        styles.sellerTabUnderline
                                    }
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {renderTabContent()}
            </ScrollView>

            <ConfirmModal
                visible={logoutConfirmVisible}
                title="Confirm Logout"
                message="Are you sure you want to logout?"
                onCancel={() =>
                    setLogoutConfirmVisible(false)
                }
                onConfirm={handleLogout}
                loading={logoutLoading}
                confirmText="Logout"
            />

            <PricingModal
                visible={pricingVisible}
                mode="seller"
                onClose={() =>
                    setPricingVisible(false)
                }
                onSelectPlan={(planKey) => {
                    switch (planKey) {
                        case "seller_monthly":
                            router.push(
                                "../../../upgrade/payment?plan=seller_monthly"
                            );
                            break;

                        case "seller_semi":
                            router.push(
                                "../../../upgrade/payment?plan=seller_semi"
                            );
                            break;

                        case "seller_annual":
                            router.push(
                                "../../../upgrade/payment?plan=seller_annual"
                            );
                            break;
                    }
                }}
            />
        </View>
    );
}


export default SellerProfile;
// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: getStatusBarHeight(),
    },

    premiumBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1A1A2E",
        borderRadius: 14,
        padding: 14,
        marginTop: 12,
        borderWidth: 1,
        borderColor: "#C9A84C33",
    },

    premiumBannerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },

    premiumBannerTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#fff",
    },

    premiumBannerSub: {
        fontSize: 11,
        color: "#888",
        marginTop: 2,
    },

    premiumBannerBtn: {
        backgroundColor: GOLD,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
    },

    premiumBannerBtnText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#1A1A2E",
    },

    sellerHero: {
        height: 220,
        position: "relative",
        backgroundColor: DARK2,
    },

    heroPattern: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: DARK2,
    },

    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(15,15,26,0.55)",
    },

    heroTopBar: {
        position: "absolute",
        top: 16,
        left: 16,
        right: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    heroTopRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    heroBtnDark: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },

    premiumPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(201,168,76,0.18)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },

    premiumPillText: {
        fontSize: 11,
        fontWeight: "700",
        color: GOLD,
    },

    heroBottom: {
        position: "absolute",
        bottom: -19,
        left: 20,
    },

    sellerAvatarWrap: {
        position: "relative",
    },

    sellerAvatar: {
        width: 72,
        height: 72,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: GOLD,
    },

    sellerAvatarFallback: {
        backgroundColor: DARK2,
        alignItems: "center",
        justifyContent: "center",
    },

    sellerAvatarInitial: {
        fontSize: 22,
        fontWeight: "800",
        color: GOLD,
    },

    tabScroll: {
        marginTop: 20,
    },

    tabScrollContent: {
        paddingHorizontal: 20,
        gap: 4,
    },

    sellerTab: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        position: "relative",
    },

    sellerTabText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#555",
    },

    sellerTabTextActive: {
        color: GOLD,
    },

    sellerTabUnderline: {
        position: "absolute",
        bottom: 0,
        left: 16,
        right: 16,
        height: 2,
        backgroundColor: GOLD,
        borderRadius: 2,
    },

    sellerPropCard: {
        width: "48%",
        backgroundColor: "#16213E",
        borderRadius: 14,
        overflow: "hidden",
        marginVertical: 10,
    },

    sellerPropImg: {
        width: "100%",
        height: 100,
    },

    sellerPropOverlay: {
        position: "absolute",
        top: 8,
        right: 8,
        gap: 6,
    },

    featuredBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: GOLD,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },

    featuredBadgeText: {
        fontSize: 9,
        fontWeight: "700",
        color: "#1A1A2E",
    },

    sellerStatusPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },

    sellerStatusText: {
        fontSize: 9,
        fontWeight: "700",
        color: "#fff",
    },

    sellerPropBody: {
        padding: 10,
    },

    sellerPropName: {
        fontSize: 12,
        fontWeight: "700",
        color: "#fff",
    },

    sellerPropPrice: {
        fontSize: 12,
        fontWeight: "700",
        color: GOLD,
        marginTop: 3,
    },

    sellerPropMeta: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },

    sellerPropCity: {
        fontSize: 10,
        color: "#666",
        flex: 1,
    },

    sellerPropDate: {
        fontSize: 10,
        color: "#555",
    },

    emptyTab: {
        alignItems: "center",
        paddingTop: 50,
        gap: 10,
    },

    emptyTabText: {
        fontSize: 14,
        color: "#555",
    },

    tabList: {
        paddingHorizontal: 16,
        paddingTop: 14,
        gap: 12,
    },

    estateCard: {
        flexDirection: "row",
        backgroundColor: "#16213E",
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#ffffff10",
        marginBottom: 8,
    },

    estateCardBody: {
        flex: 1, padding: 12, justifyContent: "center"
    },

    estateTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
    },

    estateSubtitle: {
        fontSize: 12,
        color: "#ccc",
    },

    estateMeta: {
        fontSize: 12,
        color: "#94a3b8",
    },

    staffCard: {
        backgroundColor: "#16213E",
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
    },

    staffName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
    },

    staffRole: {
        fontSize: 12,
        color: "#94a3b8",
        marginTop: 4,
    },

    skeletonCard: {
        width: "48%",
        backgroundColor: "#16213E",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 10,
    },

    skeletonImage: {
        height: 100,
        backgroundColor: "#2A2A3C",
    },

    skeletonBody: {
        padding: 10,
        gap: 8,
    },

    skeletonLineLarge: {
        height: 12,
        width: "90%",
        backgroundColor: "#2A2A3C",
        borderRadius: 6,
    },

    skeletonLineMedium: {
        height: 12,
        width: "70%",
        backgroundColor: "#2A2A3C",
        borderRadius: 6,
    },

    skeletonLineSmall: {
        height: 10,
        width: "40%",
        backgroundColor: "#2A2A3C",
        borderRadius: 6,
    },

    propGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 14,
    },
    sellerIdentity: {
        paddingTop: 48,
        paddingHorizontal: 20,
        paddingBottom: 6,
    },

    sellerName: {
        fontSize: 20,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: 0.3,
    },

    sellerSubRow: {
        marginTop: 8,
        gap: 6,
    },

    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },

    sellerSub: {
        fontSize: 13,
        color: "#9CA3AF",
        fontWeight: "500",
    },

    sellerEstablished: {
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "500",
    },

    /* ── Stats ── */
    sellerStats: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        marginTop: 22,

        backgroundColor: "#16213E",
        borderRadius: 18,

        paddingVertical: 18,
        paddingHorizontal: 8,

        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",

        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 6,
        },

        elevation: 8,
    },

    sellerStatItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    sellerStatNum: {
        fontSize: 20,
        fontWeight: "800",
        color: "#FFFFFF",
    },

    sellerStatLbl: {
        marginTop: 4,
        fontSize: 11,
        color: "#9CA3AF",
        fontWeight: "600",
    },

    sellerStatDivider: {
        width: 1,
        height: 34,
        backgroundColor: "rgba(255,255,255,0.08)",
    },

    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },

    /* ── CTA Row ── */
    sellerCtaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 18,
    },

    sellerCtaPrimary: {
        flex: 1,
        height: 50,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,

        backgroundColor: GOLD,
        borderRadius: 16,

        shadowColor: GOLD,
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 5,
        },

        elevation: 5,
    },

    sellerCtaPrimaryText: {
        fontSize: 14,
        fontWeight: "800",
        color: "#0F0F1A",
    },

    sellerCtaSecondary: {
        flex: 1,
        height: 50,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,

        borderRadius: 16,
        borderWidth: 1,
        borderColor: `${GOLD}55`,

        backgroundColor: "rgba(255,255,255,0.02)",
    },

    sellerCtaSecondaryText: {
        fontSize: 14,
        fontWeight: "700",
        color: GOLD,
    },

    sellerCtaIcon: {
        width: 50,
        height: 50,

        borderRadius: 16,

        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "#16213E",

        borderWidth: 1,
        borderColor: `${GOLD}40`,

        shadowColor: GOLD,
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 4,
        },

        elevation: 4,

    },
    verifiedDot: {
        position: "absolute",
        bottom: -4,
        right: -4,
        backgroundColor: DARK,
        borderRadius: 10,
        padding: 1,
    },

});