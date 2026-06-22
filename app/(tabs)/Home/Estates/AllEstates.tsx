import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "@/components/Toast";
import PremiumLoader from "@/components/PremiumLoader";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import EstateCard from "../../../../components/EstateCard";
import { colorWithAlpha } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

const API_BASE = "https://insighthub.com.ng/NestifyAPI";

type Estate = {
  id?: number | string;
  name?: string;
  city?: string;
  state?: string;
  location?: string;
  image_path?: string;
  num_properties?: number | string;
  boosted_until?: string | null;
};

type EstateResponse = {
  status?: string;
  msg?: string;
  Estates?: Estate[];
  estates?: Estate[];
};

export default function AllEstatesScreen() {
  const { colors, isDark } = useTheme();
  const { companyId } = useLocalSearchParams();
  const companyIdParam = Array.isArray(companyId) ? companyId[0] : companyId;
  const { show } = useToast();

  const [estates, setEstates] = useState<Estate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const pageTitle = companyId ? "Company Estates" : "All Estates";

  const fetchEstates = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        const token = await AsyncStorage.getItem("authToken");

        const url = companyIdParam
          ? `${API_BASE}/get_Company_Estate.php?companyId=${encodeURIComponent(
              companyIdParam,
            )}`
          : `${API_BASE}/get_Estates.php`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });

        const text = await response.text();

        let result: EstateResponse;
        try {
          result = JSON.parse(text);
        } catch {
          throw new Error("Invalid server response. Please try again.");
        }

        if (!response.ok) {
          throw new Error(result?.msg || "Failed to load estates.");
        }

        if (result.status === "success") {
          const data = result.Estates || result.estates || [];
          setEstates(Array.isArray(data) ? data : []);
        } else {
          throw new Error(result.msg || "Failed to load estates.");
        }
      } catch (err: any) {
        const message = err?.message || "Something went wrong.";
        setErrorMessage(message);

        show({
          type: "error",
          title: "Error",
          message,
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [companyIdParam, show],
  );

  useEffect(() => {
    fetchEstates();
  }, [fetchEstates]);

  const filteredEstates = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return estates;

    return estates.filter((item: Estate) => {
      const name = item?.name?.toLowerCase() || "";
      const city = item?.city?.toLowerCase() || "";
      const state = item?.state?.toLowerCase() || "";
      const location = item?.location?.toLowerCase() || "";

      return (
        name.includes(keyword) ||
        city.includes(keyword) ||
        state.includes(keyword) ||
        location.includes(keyword)
      );
    });
  }, [estates, search]);

  const handleEstatePress = (item: Estate) => {
    router.push(`/Home/Estates/EstateDetails?id=${item.id}`);
  };

  const renderEstate = ({ item }: { item: Estate }) => (
    <EstateCard item={item} onPress={() => handleEstatePress(item)} />
  );

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <View style={[styles.emptyIconWrap, { backgroundColor: colorWithAlpha(colors.buttonBackground, 0.1), borderColor: colorWithAlpha(colors.buttonBackground, 0.22) }]}>
          <Ionicons name="business-outline" size={34} color={colors.buttonBackground} />
        </View>

        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {search ? "No matching estates" : "No estates found"}
        </Text>

        <Text style={[styles.emptyText, { color: colors.mutedText }]}>
          {search
            ? "Try searching with another estate name, city, state, or location."
            : "There are no estates available at the moment."}
        </Text>

        {errorMessage ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.retryBtn, { backgroundColor: colors.buttonBackground }]}
            onPress={() => fetchEstates()}
          >
            <Text style={[styles.retryText, { color: colors.background }]}>Retry</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.backBtn, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.icon} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>{pageTitle}</Text>

          <View style={styles.headerSpacer} />
        </View>

        <PremiumLoader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.backBtn, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.icon} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{pageTitle}</Text>
          <Text style={[styles.headerSubTitle, { color: colors.mutedText }]}>
            {filteredEstates.length}{" "}
            {filteredEstates.length === 1 ? "estate" : "estates"} available
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.inputBackground, borderColor: colorWithAlpha(colors.buttonBackground, 0.28) }]}>
        <Ionicons name="search-outline" size={20} color={colors.buttonBackground} />

        <TextInput
          placeholder="Search estates, city, state..."
          placeholderTextColor={colors.mutedText}
          style={[styles.input, { color: colors.text }]}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />

        {search.length > 0 ? (
          <TouchableOpacity activeOpacity={0.8} onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color={colors.mutedText} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filteredEstates}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : index.toString()
        }
        renderItem={renderEstate}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchEstates(true)}
            tintColor={colors.buttonBackground}
            colors={[colors.buttonBackground]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#091530",
    paddingHorizontal: 16,
    paddingTop: getStatusBarHeight() + 10,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },

  headerSubTitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#7a90b8",
    fontWeight: "500",
  },

  headerSpacer: {
    width: 42,
  },

  searchBox: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.22)",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: "#c8d8f8",
    fontSize: 14,
    fontWeight: "500",
  },

  listContent: {
    paddingTop: 4,
    paddingBottom: 28,
    flexGrow: 1,
  },

  emptyState: {
    flex: 1,
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
  },

  emptyIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(201,168,76,0.1)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.22)",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#7a90b8",
    textAlign: "center",
  },

  retryBtn: {
    marginTop: 18,
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c9a84c",
  },

  retryText: {
    color: "#091530",
    fontSize: 14,
    fontWeight: "800",
  },
});
