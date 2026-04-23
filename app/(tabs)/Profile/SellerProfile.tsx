
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";

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
    const isPremium = user?.planType === "premium";

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
            if (result.status === "success") setStaff(result.staff ?? []);
        } catch { }
    };

    const tabData = () => {
        if (activeTab === "Properties")
            return allProperties.filter((p) => p.approval_status === "approved");
        if (activeTab === "Pending")
            return allProperties.filter((p) => p.approval_status === "pending");
        if (activeTab === "Estates") return estates;
        if (activeTab === "Staff") return staff;
        return [];
    };

    const TABS = ["Properties", "Pending", "Estates", "Staff"];

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
                <Text style={styles.estateLoc}>{item.city} · {item.state}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderStaffCard = (item: any) => (
        <View key={item.id} style={styles.staffCard}>
            {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.staffAvatar} />
            ) : (
                <View style={styles.staffAvatarFallback}>
                    <Text style={styles.staffAvatarInitial}>
                        {(item.name ?? "?")[0].toUpperCase()}
                    </Text>
                </View>
            )}
            <View style={styles.staffInfo}>
                <Text style={styles.staffName}>{item.name}</Text>
                <Text style={styles.staffRole}>{item.role}</Text>
            </View>
            <View style={[styles.staffBadge, { backgroundColor: item.is_active ? "#14532d" : "#374151" }]}>
                <Text style={styles.staffBadgeText}>{item.is_active ? "Active" : "Inactive"}</Text>
            </View>
        </View>
    );

    const renderTabContent = () => {
        const data = tabData();
        if (data.length === 0) {
            return (
                <View style={styles.emptyTab}>
                    <MaterialIcons name="inbox" size={36} color="#555" />
                    <Text style={styles.emptyTabText}>No {activeTab.toLowerCase()} yet</Text>
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
        if (activeTab === "Staff") {
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
                        <Ionicons name="location-outline" size={12} color="#888" />
                        <Text style={styles.sellerSub}>
                            {[user.city, user.state].filter(Boolean).join(", ")}
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
                        <View style={styles.sellerStatItem}>
                            <Text style={styles.sellerStatNum}>{saved.length}</Text>
                            <Text style={styles.sellerStatLbl}>Wishlists</Text>
                        </View>
                    </View>

                    {/* CTA row */}
                    <View style={styles.sellerCtaRow}>
                        <TouchableOpacity
                            style={styles.sellerCtaPrimary}
                            onPress={() => router.push("/AddProperty")}
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
                                router.push({ pathname: "/Profile/CompanyReviews", params: { company_id: user.id, company_name: user.company_name } })
                            }
                        >
                            <MaterialIcons name="rate-review" size={18} color={GOLD} />
                        </TouchableOpacity>
                    </View>

                    {/* Premium banner for non-premium sellers */}
                    {!isPremium && (
                        <PremiumBanner onUpgrade={() => router.push("/Subscription")} />
                    )}
                </View>

                {/* ── Tabs ── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabScroll}
                    contentContainerStyle={styles.tabScrollContent}
                >
                    {TABS.map((tab) => (
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
        overflow: "hidden",
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
        bottom: -32,
        left: 20,
    },
    sellerAvatarWrap: { position: "relative" },
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
    sellerAvatarInitial: { fontSize: 26, fontWeight: "800", color: GOLD },
    verifiedDot: {
        position: "absolute",
        bottom: -4,
        right: -4,
        backgroundColor: DARK,
        borderRadius: 10,
        padding: 1,
    },

    sellerIdentity: {
        paddingTop: 44,
        paddingHorizontal: 20,
        paddingBottom: 4,
    },
    sellerName: { fontSize: 20, fontWeight: "800", color: "#fff" },
    sellerSubRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
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