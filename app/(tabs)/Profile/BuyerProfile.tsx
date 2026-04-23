
// ═══════════════════════════════════════════════════════════════════════════════
// BUYER PROFILE

import { ScrollView, View } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { useFocusEffect, useRouter } from "expo-router";
import { Alert, ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";


// ── Constants ─────────────────────────────────────────────────────────────────
const BASE = "https://insighthub.com.ng";
const GOLD = "#C9A84C";
const DARK = "#1A1A2E";
const DARK2 = "#16213E";

// ═══════════════════════════════════════════════════════════════════════════════
function BuyerProfile({ user, onSettings, onMessages }: any) {
    const router = useRouter();
    const [saved, setSaved] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const isPremium = user?.planType === "premium";

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

    const handleBecomeSeller = () => {
        Alert.alert(
            "Become a Seller",
            "Switch to a seller account to list properties, manage estates and connect with buyers. This will upgrade your account type.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Continue",
                    onPress: () => router.push("/BecomeASeller"),
                },
            ]
        );
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

    return (
        <View style={[styles.container, { backgroundColor: "#fff" }]}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── Header bar ── */}
                <View style={styles.buyerHeaderBar}>
                    <TouchableOpacity style={styles.buyerHeaderBtn} onPress={onMessages}>
                        <AntDesign name="message1" size={18} color="#111" />
                    </TouchableOpacity>
                    <Text style={styles.buyerHeaderTitle}>Profile</Text>
                    <TouchableOpacity style={styles.buyerHeaderBtn} onPress={onSettings}>
                        <Ionicons name="settings-outline" size={18} color="#111" />
                    </TouchableOpacity>
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
                        <PremiumBanner onUpgrade={() => router.push("/Subscription")} />
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
                        <ActivityIndicator color="#007bff" style={{ marginTop: 20 }} />
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
                                    router.push({ pathname: "/Home/Details/[id]", params: { id: item.id } })
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
                    <TouchableOpacity style={styles.becomeSellerCard} onPress={handleBecomeSeller}>
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
    premiumBannerSub: { fontSize: 11, color: "#888", marginTop: 2 },
    premiumBannerBtn: {
        backgroundColor: GOLD,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
    },
    premiumBannerBtnText: { fontSize: 12, fontWeight: "700", color: "#1A1A2E" },


    buyerHeaderBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderColor: "#e5e7eb",
    },
    buyerHeaderBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: "#f3f4f6",
        alignItems: "center", justifyContent: "center",
    },
    buyerHeaderTitle: { fontSize: 17, fontWeight: "800", color: "#111" },

    buyerAvatarBlock: {
        alignItems: "center",
        paddingTop: 28,
        paddingBottom: 20,
    },
    buyerAvatarRing: {
        width: 88, height: 88, borderRadius: 44,
        borderWidth: 3, borderColor: "#e5e7eb",
        overflow: "hidden",
    },
    buyerAvatarImg: { width: "100%", height: "100%" },
    buyerAvatarFallback: {
        width: "100%", height: "100%",
        backgroundColor: "#e0e7ff",
        alignItems: "center", justifyContent: "center",
    },
    buyerAvatarInitial: { fontSize: 30, fontWeight: "800", color: "#4338ca" },
    buyerName: { fontSize: 20, fontWeight: "800", color: "#111", marginTop: 12 },
    buyerSince: { fontSize: 12, color: "#888", marginTop: 4 },
    buyerRatingPill: {
        flexDirection: "row", alignItems: "center", gap: 4,
        backgroundColor: "#fef9c3",
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20, marginTop: 8,
    },
    buyerRatingText: { fontSize: 12, fontWeight: "600", color: "#b45309" },

    buyerStatsGrid: {
        flexDirection: "row", flexWrap: "wrap",
        paddingHorizontal: 16, gap: 10, marginBottom: 20,
    },
    buyerStatCard: {
        width: "47.5%",
        flexDirection: "row", alignItems: "center", gap: 10,
        backgroundColor: "#f9fafb",
        borderRadius: 14, padding: 14,
        borderWidth: 0.5, borderColor: "#e5e7eb",
    },
    buyerStatIcon: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: "center", justifyContent: "center",
    },
    buyerStatNum: { fontSize: 18, fontWeight: "800", color: "#111" },
    buyerStatLbl: { fontSize: 11, color: "#888", marginTop: 1 },

    buyerSection: { paddingHorizontal: 16, marginBottom: 20 },
    buyerSectionHeader: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between", marginBottom: 12,
    },
    buyerSectionTitle: { fontSize: 15, fontWeight: "700", color: "#111" },
    buyerSeeAll: { fontSize: 12, fontWeight: "600", color: "#007bff" },

    buyerWishCard: {
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: "#f9fafb",
        borderRadius: 14, padding: 12,
        marginBottom: 8, borderWidth: 0.5, borderColor: "#e5e7eb",
    },
    buyerWishImg: { width: 60, height: 60, borderRadius: 10 },
    buyerWishInfo: { flex: 1 },
    buyerWishName: { fontSize: 13, fontWeight: "700", color: "#111" },
    buyerWishLocRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 3 },
    buyerWishLoc: { fontSize: 11, color: "#888" },
    buyerWishPrice: { fontSize: 13, fontWeight: "700", color: "#007bff", marginTop: 4 },

    buyerEmpty: { alignItems: "center", paddingVertical: 30, gap: 8 },
    buyerEmptyText: { fontSize: 13, color: "#aaa" },

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
    becomeSellerSub: { fontSize: 11, color: "#888", marginTop: 2 },
});

export default BuyerProfile;