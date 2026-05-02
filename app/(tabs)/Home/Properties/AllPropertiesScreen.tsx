import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import PropertyGrid from "../../../../components/PropertyGrid";
import { getStatusBarHeight } from "react-native-status-bar-height";
import PremiumLoader from '@/components/PremiumLoader';

/* 🎨 THEME */
const COLORS = {
  bg: '#091530',
  card: '#0f2044',
  gold: '#c9a84c',
  goldLight: '#f0d98a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  border: 'rgba(255,255,255,0.06)',
};

export default function AllPropertiesScreen() {
  const { companyId } = useLocalSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const url = companyId
        ? `https://insighthub.com.ng/NestifyAPI/get_Company_properties.php?companyId=${companyId}`
        : `https://insighthub.com.ng/NestifyAPI/get_properties.php`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const result = await response.json();

      if (result.status === "success") {
        const data = result.properties || [];
        setProperties(data);
      } else {
        Alert.alert("Error", result.msg || "Failed to load properties");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((item) =>
    item.propertyName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      
      {/* 🔙 Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {companyId ? "Company Properties" : "All Properties"}
        </Text>

        <View style={{ width: 24 }} />
      </View>

      {/* 🔍 Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={COLORS.textSecondary} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search properties..."
          placeholderTextColor={COLORS.textSecondary}
          style={styles.searchInput}
        />
      </View>

      {/* ⏳ Loading */}
      {loading ? (
       <PremiumLoader />
      ) : filteredProperties.length === 0 ? (
        
        /* ❌ Empty state */
        <View style={styles.center}>
          <Ionicons name="home-outline" size={40} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No properties found</Text>
          <Text style={styles.emptySub}>Try a different search</Text>
        </View>

      ) : (
        /* 🏡 Grid */
        <PropertyGrid properties={filteredProperties} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: getStatusBarHeight(),
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  /* 🔍 Search */
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  /* States */
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});