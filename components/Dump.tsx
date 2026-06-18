this is the biggest challenge am having on skeleton, even if a user is a seller it displays the buyers skeleton then later the sellers skeleton which i don't like and also even after loading in the sellers page its takes time before displaying the properties instead of immediately after skeleton what is the best thing to do
// app/(tabs)/Profile/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import BuyerProfile from "./BuyerProfile";
import SellerProfile from "./SellerProfile";
import BuyerProfileSkeleton from "@/components/BuyerProfileSkeleton";
import SellerProfileSkeleton from "@/components/SellerProfileSkeleton";

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // null = not yet read from cache
    // true = seller, false = buyer
    const [isSeller, setIsSeller] = useState<boolean | null>(null);

    // ── Read cache ONCE on mount so the first render already knows the type ──
    // This useEffect runs before useFocusEffect and before the API call,
    // so `isSeller` is set on the very first meaningful render.
    useEffect(() => {
        AsyncStorage.getItem("authUser").then((json) => {
            if (!json) return;
            try {
                const cached = JSON.parse(json);
                setIsSeller(cached?.is_seller == 1);
            } catch { /* ignore */ }
        });
    }, []);

    // ── Full refresh every time the tab comes into focus ─────────────────────
    useFocusEffect(
        useCallback(() => {
            let cancelled = false;

            const refreshUser = async () => {
                setLoading(true);
                try {
                    const token = await AsyncStorage.getItem("authToken");
                    const userJson = await AsyncStorage.getItem("authUser");

                    if (!token || !userJson) {
                        if (!cancelled) setLoading(false);
                        return;
                    }

                    const cached = JSON.parse(userJson);

                    // Ensure skeleton matches while we wait for the API response
                    if (!cancelled) setIsSeller(cached?.is_seller == 1);

                    const res = await fetch(
                        `https://insighthub.com.ng/NestifyAPI/get_user_by_id.php?id=${cached.id}`,
                        { headers: { Authorization: `Token ${token}` } }
                    );
                    const result = await res.json();

                    if (cancelled) return;

                    if (result.status === "success") {
                        const freshUser = result.data;
                        await AsyncStorage.setItem("authUser", JSON.stringify(freshUser));
                        setIsSeller(freshUser?.is_seller == 1);
                        setUser(freshUser);
                    } else {
                        setUser(cached);
                    }
                } catch {
                    if (cancelled) return;
                    try {
                        const userJson = await AsyncStorage.getItem("authUser");
                        if (userJson) {
                            const cached = JSON.parse(userJson);
                            setIsSeller(cached?.is_seller == 1);
                            setUser(cached);
                        }
                    } catch { /* storage unavailable */ }
                } finally {
                    if (!cancelled) setLoading(false);
                }
            };

            refreshUser();

            // Cleanup: if the tab loses focus before the fetch resolves,
            // don't apply stale state updates.
            return () => { cancelled = true; };
        }, [])
    );

    const onMessages = () => router.push("../Profile/Messages");
    const onSettings = () => router.push("../Profile/EditProfile");

    // ── Show skeleton while loading ───────────────────────────────────────────
    // isSeller === null  → cache read hasn't resolved yet (< one JS tick)
    //                      fall back to BuyerProfileSkeleton as safe default
    // isSeller === true  → show SellerProfileSkeleton
    // isSeller === false → show BuyerProfileSkeleton
    if (loading) {
        return isSeller === true
            ? <SellerProfileSkeleton />
            : <BuyerProfileSkeleton />;
    }

    // ── Real content ──────────────────────────────────────────────────────────
    if (isSeller) {
        return <SellerProfile user={user} onMessages={onMessages} onSettings={onSettings} />;
    }
    return <BuyerProfile user={user} onMessages={onMessages} onSettings={onSettings} />;
    import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
    import AsyncStorage from "@react-native-async-storage/async-storage";
    import { useFocusEffect, useRouter } from "expo-router";
    import { useCallback, useContext, useEffect, useState } from "react";
    import {
        FlatList,
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
    import { AuthContext } from '@/store';

    // ── Constants ─────────────────────────────────────────────────────────────────
    const BASE = "https://insighthub.com.ng";
    const GOLD = "#C9A84C";
    const DARK = "#1A1A2E";
    const DARK2 = "#16213E";

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
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

    // ── Premium Banner ────────────────────────────────────────────────────────────
    const PremiumBanner = ({ onUpgrade }: { onUpgrade: () => void }) => (
        <TouchableOpacity style={styles.premiumBanner} onPress={onUpgrade}>
            <View style={styles.premiumBannerLeft}>
                <MaterialIcons name="star" size={18} color={GOLD} />
                <View>
                    <Text style={styles.premiumBannerTitle}>Unlock Premium</Text>
                    <Text style={styles.premiumBannerSub}>
                        Chat, analytics & priority listing
                    </Text>
                </View>
            </View>
            <View style={styles.premiumBannerBtn}>
                <Text style={styles.premiumBannerBtnText}>Upgrade</Text>
            </View>
        </TouchableOpacity>
    );

    // ═══════════════════════════════════════════════════════════════════════════════
    // SELLER PROFILE
    // ═══════════════════════════════════════════════════════════════════════════════
    function SellerProfile({ user, onSettings, onMessages }: any) {
        const router = useRouter();
        const [activeTab, setActiveTab] = useState("Properties");
        const [allProperties, setAllProperties] = useState<any[]>([]);
        const [estates, setEstates] = useState<any[]>([]);
        const [staff, setStaff] = useState<any[]>([]);
        const [saved, setSaved] = useState<any[]>([]);
        const [loading, setLoading] = useState(false);
        const [pricingVisible, setPricingVisible] = useState(false);
        const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
        const [logoutLoading, setLogoutLoading] = useState(false);
        const isPremium = user?.plan_type === "premium";
        const { signOut } = useContext(AuthContext);


        useFocusEffect(
            useCallback(() => {
                if (user) {
                    fetchProperties();
                    fetchSaved();
                    fetchEstates();
                    fetchStaff();
                }
            }, [user])
        );

        const fetchProperties = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                const res = await fetch(
                    `${BASE}/NestifyAPI/get_Company_properties.php?companyId=${user.id}`,
                    { headers: { Authorization: `Token ${token}` } }
                );
                const result = await res.json();
                if (result.status === "success") setAllProperties(result.properties ?? []);
                console.log("Fetched properties:", result.properties);
            } catch { }
        };

        const fetchSaved = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                const res = await fetch(`${BASE}/NestifyAPI/get_liked_properties.php`, {
                    headers: { Authorization: `Token ${token}` },
                });
                const result = await res.json();
                if (result.status === "success") setSaved(result.data ?? []);
            } catch { }
        };

        const fetchEstates = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                const res = await fetch(
                    `${BASE}/NestifyAPI/get_Company_Estate.php?companyId=${user.id}`,
                    { headers: { Authorization: `Token ${token}` } }
                );
                const result = await res.json();

                if (result.status === "success") setEstates(result.Estates ?? []);

            } catch { }
        };

        const fetchStaff = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                const res = await fetch(
                    `${BASE}/NestifyAPI/get_company_staffs.php?companyId=${user.id}`,
                    { headers: { Authorization: `Token ${token}` } }
                );
                const result = await res.json();
                if (result.status === "success") setStaff(result.staffs ?? []);
            } catch { }
        };



        const handleLogout = async () => {
            setLogoutLoading(true);
            try {
                await signOut();
                router.replace('/(auth)/Login');
            } finally {
                setLogoutLoading(false);
                setLogoutConfirmVisible(false);
            }
        };

        const tabData = () => {
            if (activeTab === "Properties")
                return allProperties.filter((p) => p.approval_status === "approved");
            if (activeTab === "Pending")
                return allProperties.filter((p) => p.approval_status === "pending");
            if (activeTab === "Estates") return estates;
            if (activeTab === "Staffs") return staff;
            return [];
        };

        const TABS = ["Properties", "Pending", "Estates", "Staffs"];

        // Filter tabs based on seller type - only companies can see Estates and Staffs
        const availableTabs = TABS.filter((tab) => {
            const sellerType = user?.seller_type || user?.sellerType || '';
            if (sellerType !== 'company' && (tab === 'Estates' || tab === 'Staffs')) {
                return false;
            }
            return true;
        });

        // Ensure activeTab is valid for current seller type
        useEffect(() => {
            if (!availableTabs.includes(activeTab)) {
                setActiveTab('Properties');
            }
        }, [availableTabs, activeTab]);

        const renderPropertyCard = (item: any) => (
            <TouchableOpacity
                key={item.id}
                style={styles.sellerPropCard}
                onPress={() =>
                    router.push({ pathname: "/Profile/EditProperty", params: { id: item.id } })
                }
            >
                <Image
                    source={{ uri: `${BASE}/${item.images?.[0]}` }}
                    style={styles.sellerPropImg}
                    resizeMode="cover"
                />
                <View style={styles.sellerPropOverlay}>
                    {isBoosted(item.boosted_until) && (
                        <View style={styles.featuredBadge}>
                            <MaterialIcons name="star" size={12} color="#fff" />
                            <Text style={styles.featuredBadgeText}>Featured</Text>
                        </View>
                    )}
                    <View
                        style={[
                            styles.sellerStatusPill,
                            {
                                backgroundColor:
                                    item.status === "available" ? "#166534"
                                        : item.status === "sold" ? "#991b1b"
                                            : "#374151",
                            },
                        ]}
                    >
                        <Text style={styles.sellerStatusText}>{item.status}</Text>
                    </View>
                </View>
                <View style={styles.sellerPropBody}>
                    <Text style={styles.sellerPropName} numberOfLines={1}>
                        {item.propertyName}
                    </Text>
                    <Text style={styles.sellerPropPrice}>
                        ₦
                        {item.listingType === "Rent"
                            ? formatPrice(item.rentPrice)
                            : formatPrice(item.sellPrice)}
                    </Text>
                    <View style={styles.sellerPropMeta}>
                        <Text style={styles.sellerPropCity} numberOfLines={1}>
                            {item.city}
                        </Text>
                        {item.created_at && (
                            <Text style={styles.sellerPropDate}>{formatDate(item.created_at)}</Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );

        const renderEstateCard = (item: any) => (
            <TouchableOpacity
                key={item.id}
                style={styles.estateCard}
                onPress={() =>
                    router.push({ pathname: "/Home/EstateCompanyDetails", params: { id: item.id } })
                }
            >
                <Image
                    source={{ uri: item.image_path }}
                    style={styles.estateImg}
                    resizeMode="cover"
                />
                <View style={styles.estateBody}>
                    <Text style={styles.estateName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.estateLoc}>{item.location}</Text>
                </View>
            </TouchableOpacity>
        );

        const renderStaffCard = (item: any) => (
            <TouchableOpacity key={item.id} style={styles.staffCard} onPress={() => { router.push({ pathname: "/Profile/EditStaff", params: { id: item.id } }) }}>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    {item.profile_image ? (
                        <Image source={{ uri: item.profile_image }} style={styles.staffAvatar} />
                    ) : (
                        <View style={styles.staffAvatarFallback}>
                            <Text style={styles.staffAvatarInitial}>
                                {(item.name ?? "?")[0].toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <View style={styles.staffInfo}>
                        <Text style={styles.staffName}>{item.name}</Text>
                        <Text style={styles.staffRole}>{item.email}</Text>
                    </View>

                    <View style={[styles.staffBadge, { backgroundColor: item.account_status ? "#14532d" : "#374151" }]}>
                        <Text style={styles.staffBadgeText}>{item.account_status}</Text>
                    </View>


                </View>


            </TouchableOpacity>
        );

        const renderTabContent = () => {
            const data = tabData();
            if (data.length === 0) {
                return (
                    <View style={styles.emptyTab}>
                        <MaterialIcons name="inbox" size={36} color="#555" />
                        <Text style={styles.emptyTabText}>No {activeTab.toLowerCase()} {activeTab === "Pending" ? "properties" : ""} yet</Text>
                    </View>
                );
            }
            if (activeTab === "Properties" || activeTab === "Pending") {
                return (
                    <View style={styles.propGrid}>
                        {data.map(renderPropertyCard)}
                    </View>
                );
            }
            if (activeTab === "Estates") {
                return <View style={styles.estateGrid}>{data.map(renderEstateCard)}</View>;
            }
            if (activeTab === "Staffs") {
                return <View style={styles.staffList}>{data.map(renderStaffCard)}</View>;
            }
            return null;
        };

        return (
            <View style={[styles.container, { backgroundColor: "#0F0F1A" }]}>
                <ScrollView showsVerticalScrollIndicator={false}>

                    {/* ── Hero ── */}
                    <View style={styles.sellerHero}>
                        {user.cover_image ? (
                            <Image
                                source={{ uri: user.cover_image }}
                                style={StyleSheet.absoluteFillObject}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.heroPattern} />
                        )}
                        <View style={styles.heroOverlay} />

                        {/* Top bar */}
                        <View style={styles.heroTopBar}>
                            <TouchableOpacity style={styles.heroBtnDark} onPress={onMessages}>
                                <AntDesign name="message1" size={18} color="#fff" />
                            </TouchableOpacity>
                            <View style={styles.heroTopRight}>
                                {isPremium && (
                                    <View style={styles.premiumPill}>
                                        <MaterialIcons name="star" size={11} color={GOLD} />
                                        <Text style={styles.premiumPillText}>Premium</Text>
                                    </View>
                                )}

                                <TouchableOpacity onPress={() => setLogoutConfirmVisible(true)}>
                                    <Ionicons name="log-out-outline" size={19} color="rgba(255,255,255,0.68)" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.heroBtnDark} onPress={onSettings}>
                                    <Ionicons name="settings-outline" size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Avatar + name */}
                        <View style={styles.heroBottom}>
                            <View style={styles.sellerAvatarWrap}>
                                {user.profile_image ? (
                                    <Image source={{ uri: user.profile_image }} style={styles.sellerAvatar} />
                                ) : (
                                    <View style={[styles.sellerAvatar, styles.sellerAvatarFallback]}>
                                        <Text style={styles.sellerAvatarInitial}>
                                            {(user.company_name ?? user.name ?? "?")[0].toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.verifiedDot}>
                                    <MaterialIcons name="verified" size={16} color={GOLD} />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* ── Identity ── */}
                    <View style={styles.sellerIdentity}>
                        <Text style={styles.sellerName}>
                            {user.company_name ?? user.name}
                        </Text>
                        <View style={styles.sellerSubRow}>

                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                <Ionicons name="location-outline" size={12} color="#888" />
                                <Text style={styles.sellerSub}>
                                    {[user.city, user.state].filter(Boolean).join(", ")}

                                </Text>
                            </View>


                            <Text style={styles.sellerSub}>

                                {user.date_established ? ` · Est. ${user.date_established}` : ""}
                            </Text>

                        </View>


                        {/* Stats */}
                        <View style={styles.sellerStats}>
                            <View style={styles.sellerStatItem}>
                                <Text style={styles.sellerStatNum}>{allProperties.length}</Text>
                                <Text style={styles.sellerStatLbl}>Properties</Text>
                            </View>
                            <View style={styles.sellerStatDivider} />
                            <View style={styles.sellerStatItem}>
                                <Text style={styles.sellerStatNum}>{estates.length}</Text>
                                <Text style={styles.sellerStatLbl}>Estates</Text>
                            </View>
                            <View style={styles.sellerStatDivider} />
                            <View style={styles.sellerStatItem}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                                    <Text style={styles.sellerStatNum}>
                                        {Number(user.average_rating ?? 0).toFixed(1)}
                                    </Text>
                                    <MaterialIcons name="star" size={13} color={GOLD} />
                                </View>
                                <Text style={styles.sellerStatLbl}>{user.review_count ?? 0} Reviews</Text>
                            </View>
                            <View style={styles.sellerStatDivider} />
                            <TouchableOpacity style={styles.sellerStatItem} onPress={() => router.push("../Profile/Wishlist")}>
                                <Text style={styles.sellerStatNum}>{saved.length}</Text>
                                <Text style={styles.sellerStatLbl}>Wishlists</Text>
                            </TouchableOpacity>
                        </View>

                        {/* CTA row */}
                        <View style={styles.sellerCtaRow}>
                            <TouchableOpacity
                                style={styles.sellerCtaPrimary}
                                onPress={() => router.push("../Publish")}
                            >
                                <Ionicons name="add" size={16} color="#0F0F1A" />
                                <Text style={styles.sellerCtaPrimaryText}>Add Property</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.sellerCtaSecondary}
                                onPress={() => router.push("../Profile/EditProfile")}
                            >
                                <Ionicons name="pencil-outline" size={15} color={GOLD} />
                                <Text style={styles.sellerCtaSecondaryText}>Edit Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.sellerCtaIcon}
                                onPress={() =>
                                    router.push({ pathname: "../Profile/UserReviews", params: { company_id: user.id, company_name: user.company_name } })
                                }
                            >
                                <MaterialIcons name="rate-review" size={18} color={GOLD} />
                            </TouchableOpacity>
                        </View>

                        {/* Premium banner for non-premium sellers */}
                        {!isPremium && (
                            <PremiumBanner onUpgrade={() => setPricingVisible(true)} />
                        )}
                    </View>

                    {/* ── Tabs ── */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.tabScroll}
                        contentContainerStyle={styles.tabScrollContent}
                    >
                        {availableTabs.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.sellerTab, activeTab === tab && styles.sellerTabActive]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text
                                    style={[
                                        styles.sellerTabText,
                                        activeTab === tab && styles.sellerTabTextActive,
                                    ]}
                                >
                                    {tab}
                                </Text>
                                {activeTab === tab && <View style={styles.sellerTabUnderline} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* ── Tab content ── */}
                    <View style={{ paddingBottom: 40 }}>
                        {renderTabContent()}
                    </View>

                </ScrollView>
                <ConfirmModal
                    visible={logoutConfirmVisible}
                    title="Confirm Logout"
                    message="Are you sure you want to logout?"
                    onCancel={() => setLogoutConfirmVisible(false)}
                    onConfirm={handleLogout}
                    loading={logoutLoading}
                    confirmText="Logout"
                />
                <PricingModal
                    visible={pricingVisible}
                    mode="seller"
                    onClose={() => setPricingVisible(false)}
                    onSelectPlan={(planKey) => {

                        switch (planKey) {

                            case "seller_monthly":
                                router.push("../../../upgrade/payment?plan=seller_monthly");
                                break;

                            case "seller_semi":
                                router.push("../../../upgrade/payment?plan=seller_semi");
                                break;

                            case "seller_annual":
                                router.push("../../../upgrade/payment?plan=seller_annual");
                                break;
                        }
                    }}
                />
            </View>
        );
    }


    // ═══════════════════════════════════════════════════════════════════════════════
    // STYLES
    // ═══════════════════════════════════════════════════════════════════════════════
    const styles = StyleSheet.create({
        container: { flex: 1, paddingTop: getStatusBarHeight() },

        // ── Premium banner ──
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
        premiumBannerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
        premiumBannerTitle: { fontSize: 13, fontWeight: "700", color: "#fff" },
        premiumBannerSub: { fontSize: 11, color: "#888", marginTop: 2 },
        premiumBannerBtn: {
            backgroundColor: GOLD,
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: 20,
        },
        premiumBannerBtnText: { fontSize: 12, fontWeight: "700", color: "#1A1A2E" },

        // ── SELLER ──────────────────────────────────────────────────────────────────
        sellerHero: {
            height: 220,
            position: "relative",
            backgroundColor: DARK2,
            overflow: "visible",
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
        heroTopRight: { flexDirection: "row", alignItems: "center", gap: 8 },
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
            borderWidth: 1,
            borderColor: GOLD + "55",
        },
        premiumPillText: { fontSize: 11, fontWeight: "700", color: GOLD },
        heroBottom: {
            position: "absolute",
            bottom: -19,
            left: 20,
            zIndex: 9000,
        },
        sellerAvatarWrap: { position: "relative", overflow: "visible", },
        sellerAvatar: {
            width: 72,
            height: 72,
            borderRadius: 20,
            borderWidth: 3,
            borderColor: GOLD,
            zIndex: 9000
        },
        sellerAvatarFallback: {
            backgroundColor: DARK2,
            alignItems: "center",
            justifyContent: "center",
        },
        sellerAvatarInitial: { fontSize: 26, fontWeight: "800", color: GOLD },
        verifiedDot: {
            position: "absolute",
            bottom: -4,
            right: -4,
            backgroundColor: DARK,
            borderRadius: 10,
            padding: 1,
            zIndex: 2000,
            elevation: 5,
        },

        sellerIdentity: {
            paddingTop: 44,
            paddingHorizontal: 20,
            paddingBottom: 4,
        },
        sellerName: { fontSize: 20, fontWeight: "800", color: "#fff" },
        sellerSubRow: { flexDirection: "column", alignItems: "center", gap: 4, marginTop: 4 },
        sellerSub: { fontSize: 12, color: "#888" },

        sellerStats: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: 20,
            backgroundColor: "#16213E",
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: "#ffffff10",
        },
        sellerStatItem: { flex: 1, alignItems: "center" },
        sellerStatNum: { fontSize: 18, fontWeight: "800", color: "#fff" },
        sellerStatLbl: { fontSize: 10, color: "#666", marginTop: 2 },
        sellerStatDivider: { width: 1, height: 28, backgroundColor: "#ffffff15" },

        sellerCtaRow: { flexDirection: "row", gap: 8, marginTop: 16 },
        sellerCtaPrimary: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            backgroundColor: GOLD,
            paddingVertical: 12,
            borderRadius: 14,
        },
        sellerCtaPrimaryText: { fontSize: 13, fontWeight: "700", color: DARK },
        sellerCtaSecondary: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            backgroundColor: "transparent",
            paddingVertical: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: GOLD + "66",
        },
        sellerCtaSecondaryText: { fontSize: 13, fontWeight: "700", color: GOLD },
        sellerCtaIcon: {
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: "#16213E",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: GOLD + "33",
        },

        tabScroll: { marginTop: 20 },
        tabScrollContent: { paddingHorizontal: 20, gap: 4 },
        sellerTab: {
            paddingHorizontal: 16,
            paddingVertical: 10,
            position: "relative",
        },
        sellerTabActive: {},
        sellerTabText: { fontSize: 13, fontWeight: "600", color: "#555" },
        sellerTabTextActive: { color: GOLD },
        sellerTabUnderline: {
            position: "absolute",
            bottom: 0,
            left: 16,
            right: 16,
            height: 2,
            backgroundColor: GOLD,
            borderRadius: 2,
        },

        propGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            paddingHorizontal: 16,
            gap: 10,
            paddingTop: 14,
        },
        sellerPropCard: {
            width: "47.5%",
            backgroundColor: "#16213E",
            borderRadius: 14,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#ffffff10",
        },
        sellerPropImg: { width: "100%", height: 100 },
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
            alignSelf: "flex-start",
        },
        featuredBadgeText: {
            fontSize: 9,
            fontWeight: "700",
            color: "#1A1A2E",
            textTransform: "capitalize",
        },
        sellerStatusPill: {
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 20,
        },
        sellerStatusText: { fontSize: 9, fontWeight: "700", color: "#fff", textTransform: "capitalize" },
        sellerPropBody: { padding: 10 },
        sellerPropName: { fontSize: 12, fontWeight: "700", color: "#fff" },
        sellerPropPrice: { fontSize: 12, fontWeight: "700", color: GOLD, marginTop: 3 },
        sellerPropMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
        sellerPropCity: { fontSize: 10, color: "#666", flex: 1 },
        sellerPropDate: { fontSize: 10, color: "#555" },

        estateGrid: {
            paddingHorizontal: 16,
            gap: 10,
            paddingTop: 14,
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
        estateImg: { width: 90, height: 80 },
        estateBody: { flex: 1, padding: 12, justifyContent: "center" },
        estateName: { fontSize: 14, fontWeight: "700", color: "#fff" },
        estateLoc: { fontSize: 11, color: "#666", marginTop: 4 },

        staffList: { paddingHorizontal: 16, paddingTop: 14 },
        staffCard: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: "#16213E",
            borderRadius: 14,
            padding: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: "#ffffff10",
        },
        staffAvatar: { width: 44, height: 44, borderRadius: 22 },
        staffAvatarFallback: {
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: DARK2,
            alignItems: "center", justifyContent: "center",
            borderWidth: 1, borderColor: GOLD + "44",
        },
        staffAvatarInitial: { fontSize: 16, fontWeight: "700", color: GOLD },
        staffInfo: { flex: 1 },
        staffName: { fontSize: 14, fontWeight: "600", color: "#fff" },
        staffRole: { fontSize: 12, color: "#666", marginTop: 2 },
        staffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
        staffBadgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },

        emptyTab: {
            alignItems: "center",
            paddingTop: 50,
            gap: 10,
        },
        emptyTabText: { fontSize: 14, color: "#555" },
    });

    export default SellerProfile;
}

import { ScrollView, View } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useCallback, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import PricingModal from "@/components/PricingModal";
import { AuthContext } from '@/store';
import BuyerProfileSkeleton from '@/components/BuyerProfileSkeleton';


// ── Constants ─────────────────────────────────────────────────────────────────
const BASE = "https://insighthub.com.ng";
const GOLD = "#C9A84C";
const DARK = "#1A1A2E";
const DARK2 = "#16213E";

// ═══════════════════════════════════════════════════════════════════════════════
function BuyerProfile({ user, onSettings, onMessages }: any) {
    const { show } = useToast();
    const router = useRouter();
    const [saved, setSaved] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pricingVisible, setPricingVisible] = useState(false);
    const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const isPremium = user?.plan_type === "premium";
    const { signOut } = useContext(AuthContext);


    useFocusEffect(
        useCallback(() => {
            if (user) fetchSaved();
        }, [user])
    );



    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
        });

    const formatPrice = (v: any) =>
        Number(String(v).replace(/,/g, "")).toLocaleString("en-NG");

    // ── Premium Banner ────────────────────────────────────────────────────────────
    const PremiumBanner = ({ onUpgrade }: { onUpgrade: () => void }) => (
        <TouchableOpacity style={styles.premiumBanner} onPress={onUpgrade}>
            <View style={styles.premiumBannerLeft}>
                <MaterialIcons name="star" size={18} color={GOLD} />
                <View>
                    <Text style={styles.premiumBannerTitle}>Unlock Premium</Text>
                    <Text style={styles.premiumBannerSub}>
                        Chat, analytics & priority listing
                    </Text>
                </View>
            </View>
            <View style={styles.premiumBannerBtn}>
                <Text style={styles.premiumBannerBtnText}>Upgrade</Text>
            </View>
        </TouchableOpacity>
    );

    const fetchSaved = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("authToken");
            const res = await fetch(`${BASE}/NestifyAPI/get_liked_properties.php`, {
                headers: { Authorization: `Token ${token}` },
            });
            const result = await res.json();
            if (result.status === "success") setSaved(result.data ?? []);
        } catch { }
        finally { setLoading(false); }
    };

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await signOut();
            router.replace('/(auth)/Login');
        } finally {
            setLogoutLoading(false);
            setLogoutConfirmVisible(false);
        }
    };

    const handleBecomeSeller = () => {
        show({
            type: 'info',
            title: 'Become a Seller',
            message: 'Switch to a seller account to list properties, manage estates and connect with buyers. This will upgrade your account type.',
            action: {
                label: 'Continue',
                onPress: () => router.push("/BecomeASeller"),
            },
        });
    };

    const QUICK_STATS = [
        {
            icon: "favorite-border",
            label: "Saved",
            value: saved.length,
            color: "#be185d",
            bg: "#fce7f3",
            route: "../Profile/Wishlist",
        },
        {
            icon: "star-border",
            label: "My reviews",
            value: user?.review_count ?? 0,
            color: "#b45309",
            bg: "#fef3c7",
            route: "../Profile/UserReviews",
        },
        {
            icon: "chat-bubble-outline",
            label: "Messages",
            value: "",
            color: "#0369a1",
            bg: "#e0f2fe",
            route: "../Profile/Messages",
        },
        {
            icon: "settings",
            label: "Settings",
            value: "",
            color: "#374151",
            bg: "#f3f4f6",
            route: "../Profile/EditProfile",
        },
    ];
    type PricingModalProps = {
        visible: boolean;
        userType?: "buyer" | "seller";
        currentPlan?: string;
        onSelectPlan: (plan: string) => void;
        onClose: () => void;
    };
    return (
        <View style={[styles.container, { backgroundColor: DARK }]}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── Header bar ── */}
                <View style={styles.buyerHeaderBar}>
                    <TouchableOpacity style={styles.buyerHeaderBtn} onPress={onMessages}>
                        <AntDesign name="message1" size={18} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.buyerHeaderTitle}>Profile</Text>
                    <View style={styles.buyerHeaderRight}>
                        <TouchableOpacity style={styles.buyerHeaderBtn} onPress={() => setLogoutConfirmVisible(true)}>
                            <Ionicons name="log-out-outline" size={18} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buyerHeaderBtn} onPress={onSettings}>
                            <Ionicons name="settings-outline" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Avatar block ── */}
                <View style={styles.buyerAvatarBlock}>
                    <View style={styles.buyerAvatarRing}>
                        {user?.profile_image ? (
                            <Image source={{ uri: user.profile_image }} style={styles.buyerAvatarImg} />
                        ) : (
                            <View style={styles.buyerAvatarFallback}>
                                <Text style={styles.buyerAvatarInitial}>
                                    {(user?.name ?? "?")[0].toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.buyerName}>{user?.name ?? "User"}</Text>
                    <Text style={styles.buyerSince}>
                        Member since {user?.created_at ? new Date(user.created_at).getFullYear() : "—"}
                    </Text>

                    {/* Rating pill */}
                    {Number(user?.average_rating) > 0 && (
                        <View style={styles.buyerRatingPill}>
                            <MaterialIcons name="star" size={13} color="#f59e0b" />
                            <Text style={styles.buyerRatingText}>
                                {Number(user.average_rating).toFixed(1)} rating
                            </Text>
                        </View>
                    )}
                </View>

                {/* ── Premium banner ── */}
                {!isPremium && (
                    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                        <PremiumBanner onUpgrade={() => setPricingVisible(true)} />
                    </View>
                )}

                {/* ── Premium User Badge ── */}
                {isPremium && (
                    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                        <View style={styles.premiumUserBadge}>
                            <MaterialIcons name="star" size={20} color={GOLD} />
                            <Text style={styles.premiumUserText}>Premium User</Text>
                        </View>
                    </View>
                )}

                {/* ── Quick stats grid ── */}
                <View style={styles.buyerStatsGrid}>
                    {QUICK_STATS.map((s) => (
                        <TouchableOpacity
                            key={s.label}
                            style={styles.buyerStatCard}
                            onPress={() => router.push(s.route as any)}
                        >
                            <View style={[styles.buyerStatIcon, { backgroundColor: s.bg }]}>
                                <MaterialIcons name={s.icon as any} size={20} color={s.color} />
                            </View>
                            <View>
                                {s.value !== "" && (
                                    <Text style={styles.buyerStatNum}>{s.value}</Text>
                                )}
                                <Text style={styles.buyerStatLbl}>{s.label}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Saved properties ── */}
                <View style={styles.buyerSection}>
                    <View style={styles.buyerSectionHeader}>
                        <Text style={styles.buyerSectionTitle}>Saved properties</Text>
                        <TouchableOpacity onPress={() => router.push("../Profile/Wishlist")}>
                            <Text style={styles.buyerSeeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator color="#c9a84c" style={{ marginTop: 20 }} />
                    ) : saved.length === 0 ? (
                        <View style={styles.buyerEmpty}>
                            <Ionicons name="heart-outline" size={32} color="#ddd" />
                            <Text style={styles.buyerEmptyText}>No saved properties yet</Text>
                        </View>
                    ) : (
                        saved.slice(0, 3).map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.buyerWishCard}
                                onPress={() =>
                                    router.push({ pathname: "/Home/Properties/Details/[id]", params: { id: item.id } })
                                }
                            >
                                <Image
                                    source={{ uri: `${BASE}/${item.images?.[0]}` }}
                                    style={styles.buyerWishImg}
                                    resizeMode="cover"
                                />
                                <View style={styles.buyerWishInfo}>
                                    <Text style={styles.buyerWishName} numberOfLines={1}>
                                        {item.propertyName}
                                    </Text>
                                    <View style={styles.buyerWishLocRow}>
                                        <Ionicons name="location-outline" size={11} color="#888" />
                                        <Text style={styles.buyerWishLoc} numberOfLines={1}>
                                            {[item.city, item.state].filter(Boolean).join(", ")}
                                        </Text>
                                    </View>
                                    <Text style={styles.buyerWishPrice}>
                                        ₦
                                        {item.listingType === "Rent"
                                            ? formatPrice(item.rentPrice)
                                            : formatPrice(item.sellPrice)}
                                    </Text>
                                </View>
                                <Ionicons name="heart" size={18} color="#e11d48" />
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* ── Become a seller ── */}
                <View style={{ paddingHorizontal: 16, marginBottom: 40 }}>
                    <TouchableOpacity style={styles.becomeSellerCard} onPress={() => router.push("../Publish/BecomeASeller")}>
                        <View style={styles.becomeSellerLeft}>
                            <View style={styles.becomeSellerIcon}>
                                <MaterialIcons name="business" size={22} color={GOLD} />
                            </View>
                            <View>
                                <Text style={styles.becomeSellerTitle}>Become a seller</Text>
                                <Text style={styles.becomeSellerSub}>
                                    List properties and grow your business
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={GOLD} />
                    </TouchableOpacity>
                </View>



            </ScrollView>

            <ConfirmModal
                visible={logoutConfirmVisible}
                title="Confirm Logout"
                message="Are you sure you want to logout?"
                onCancel={() => setLogoutConfirmVisible(false)}
                onConfirm={handleLogout}
                loading={logoutLoading}
                confirmText="Logout"
            />
            <PricingModal
                visible={pricingVisible}
                mode="buyer"
                onClose={() => setPricingVisible(false)}
                onSelectPlan={(planKey) => {

                    switch (planKey) {

                        case "buyer_monthly":
                            router.push("/upgrade/payment?plan=buyer_monthly");
                            break;

                        case "buyer_annual":
                            router.push("/upgrade/payment?plan=buyer_annual");
                            break;
                    }
                }}
            />


        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: getStatusBarHeight() },

    // ── Premium banner ──
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
    premiumBannerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
    premiumBannerTitle: { fontSize: 13, fontWeight: "700", color: "#fff" },
    premiumBannerSub: { fontSize: 11, color: "#ccc", marginTop: 2 },
    premiumBannerBtn: {
        backgroundColor: GOLD,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
    },
    premiumBannerBtnText: { fontSize: 12, fontWeight: "700", color: "#1A1A2E" },

    // ── Premium User Badge ──
    premiumUserBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: DARK2,
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: GOLD + "44",
        gap: 8,
    },
    premiumUserText: { fontSize: 14, fontWeight: "700", color: GOLD },


    buyerHeaderBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderColor: "#555",
    },
    buyerHeaderBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: DARK2,
        alignItems: "center", justifyContent: "center",
    },
    buyerHeaderRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    buyerHeaderTitle: { fontSize: 17, fontWeight: "800", color: "#fff" },

    buyerAvatarBlock: {
        alignItems: "center",
        paddingTop: 28,
        paddingBottom: 20,
    },
    buyerAvatarRing: {
        width: 88, height: 88, borderRadius: 44,
        borderWidth: 3, borderColor: "#555",
        overflow: "hidden",
    },
    buyerAvatarImg: { width: "100%", height: "100%", },
    buyerAvatarFallback: {
        width: "100%", height: "100%",
        backgroundColor: "#555",
        alignItems: "center", justifyContent: "center",
    },
    buyerAvatarInitial: { fontSize: 30, fontWeight: "800", color: "#fff" },
    buyerName: { fontSize: 20, fontWeight: "800", color: "#fff", marginTop: 12 },
    buyerSince: { fontSize: 12, color: "#ccc", marginTop: 4 },
    buyerRatingPill: {
        flexDirection: "row", alignItems: "center", gap: 4,
        backgroundColor: DARK2,
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20, marginTop: 8,
    },
    buyerRatingText: { fontSize: 12, fontWeight: "600", color: "#fff" },

    buyerStatsGrid: {
        flexDirection: "row", flexWrap: "wrap",
        paddingHorizontal: 16, gap: 10, marginBottom: 20,
    },
    buyerStatCard: {
        width: "47.5%",
        flexDirection: "row", alignItems: "center", gap: 10,
        backgroundColor: DARK2,
        borderRadius: 14, padding: 14,
        borderWidth: 0.5, borderColor: "#555",
    },
    buyerStatIcon: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: "center", justifyContent: "center",
    },
    buyerStatNum: { fontSize: 18, fontWeight: "800", color: "#fff" },
    buyerStatLbl: { fontSize: 11, color: "#ccc", marginTop: 1 },

    buyerSection: { paddingHorizontal: 16, marginBottom: 20 },
    buyerSectionHeader: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between", marginBottom: 12,
    },
    buyerSectionTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
    buyerSeeAll: { fontSize: 12, fontWeight: "600", color: GOLD },

    buyerWishCard: {
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: DARK2,
        borderRadius: 14, padding: 12,
        marginBottom: 8, borderWidth: 0.5, borderColor: "#555",
    },
    buyerWishImg: { width: 60, height: 60, borderRadius: 10 },
    buyerWishInfo: { flex: 1 },
    buyerWishName: { fontSize: 13, fontWeight: "700", color: "#fff" },
    buyerWishLocRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 3 },
    buyerWishLoc: { fontSize: 11, color: "#ccc" },
    buyerWishPrice: { fontSize: 13, fontWeight: "700", color: GOLD, marginTop: 4 },

    buyerEmpty: { alignItems: "center", paddingVertical: 30, gap: 8 },
    buyerEmptyText: { fontSize: 13, color: "#ccc" },

    becomeSellerCard: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: DARK,
        borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: GOLD + "44",
    },
    becomeSellerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    becomeSellerIcon: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: GOLD + "22",
        alignItems: "center", justifyContent: "center",
    },
    becomeSellerTitle: { fontSize: 14, fontWeight: "700", color: "#fff" },
    becomeSellerSub: { fontSize: 11, color: "#ccc", marginTop: 2 },
});

export default BuyerProfile; 