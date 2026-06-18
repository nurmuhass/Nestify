

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
            console.log("BuyerProfile user:", user);
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
                                    router.push({ pathname: "../Home/Properties/Details", params: { id: item.id } })
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

              {/* ── Seller Status Section ── */}
{user?.seller_status !== "approved" && (
    <View style={{ paddingHorizontal: 16, marginBottom: 40 }}>

        {/* Pending */}
        {user?.seller_status === "pending" ? (
            <View style={styles.pendingSellerCard}>
                <View style={styles.pendingSellerIcon}>
                    <MaterialIcons
                        name="hourglass-top"
                        size={24}
                        color="#f59e0b"
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.pendingSellerTitle}>
                        Seller Request Under Review
                    </Text>

                    <Text style={styles.pendingSellerSub}>
                        Thank you for applying to become a seller. Your
                        application is currently being reviewed by our team.
                        You'll receive a notification once a decision has been
                        made.
                    </Text>
                </View>
            </View>
        ) : user?.seller_status === "rejected" ? (

            <View style={styles.rejectedSellerCard}>
                <View style={styles.rejectedSellerIcon}>
                    <MaterialIcons
                        name="cancel"
                        size={24}
                        color="#ef4444"
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.rejectedSellerTitle}>
                        Seller Application Not Approved
                    </Text>

                    <Text style={styles.rejectedSellerSub}>
                        We couldn't approve your seller application at this
                        time. Please review the feedback below and submit a new
                        application when you're ready.
                    </Text>

                    {!!user?.seller_rejection_reason && (
                        <View style={styles.reasonBox}>
                            <Text style={styles.reasonLabel}>
                                Review Feedback
                            </Text>

                            <Text style={styles.reasonText}>
                                {user.seller_rejection_reason}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.reapplyButton}
                        onPress={() =>
                            router.push("../Publish/BecomeASeller")
                        }
                    >
                        <Text style={styles.reapplyButtonText}>
                            Apply Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

        ) : (

            <TouchableOpacity
                style={styles.becomeSellerCard}
                onPress={() => router.push("../Publish/BecomeASeller")}
            >
                <View style={styles.becomeSellerLeft}>
                    <View style={styles.becomeSellerIcon}>
                        <MaterialIcons
                            name="business"
                            size={22}
                            color={GOLD}
                        />
                    </View>

                    <View>
                        <Text style={styles.becomeSellerTitle}>
                            Become a Seller
                        </Text>

                        <Text style={styles.becomeSellerSub}>
                            List properties and grow your business
                        </Text>
                    </View>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={GOLD}
                />
            </TouchableOpacity>

        )}
    </View>
)}


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
    pendingSellerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#2a2110",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f59e0b55",
},

pendingSellerIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#f59e0b22",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
},

pendingSellerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fbbf24",
    marginBottom: 4,
},

pendingSellerSub: {
    fontSize: 12,
    lineHeight: 18,
    color: "#e5e7eb",
},

rejectedSellerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#2b1111",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ef444455",
},

rejectedSellerIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#ef444422",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
},

rejectedSellerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f87171",
    marginBottom: 4,
},

rejectedSellerSub: {
    fontSize: 12,
    lineHeight: 18,
    color: "#e5e7eb",
},

reasonBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#00000033",
    borderWidth: 1,
    borderColor: "#ef444433",
},

reasonLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fca5a5",
    marginBottom: 4,
    textTransform: "uppercase",
},

reasonText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#fff",
},

reapplyButton: {
    marginTop: 14,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
},

reapplyButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
},
});

export default BuyerProfile;