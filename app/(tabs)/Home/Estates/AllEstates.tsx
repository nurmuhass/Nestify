import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {

  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EstateCard from "../../../../components/EstateCard";
import { useToast } from '@/components/Toast';
import PremiumLoader from "@/components/PremiumLoader";
import { getStatusBarHeight } from "react-native-status-bar-height";

export default function AllEstatesScreen() {
  const { companyId } = useLocalSearchParams();
  const [estates, setEstates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  useEffect(() => {
    fetchEstates();
  }, []);

  const fetchEstates = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const url = companyId
        ? `https://insighthub.com.ng/NestifyAPI/get_Company_Estate.php?companyId=${companyId}`
        : `https://insighthub.com.ng/NestifyAPI/get_Estates.php`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const result = await response.json();

      if (result.status === "success") {
        const data = result.Estates || result.estates || [];
        setEstates(data);
        console.log("Fetched Estates:", data);
      } else {
        show({ type: 'error', title: 'Error', message: result.msg || 'Failed to load estates' });
      }
    } catch (err) {
      show({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredEstates = estates.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {companyId ? "Company Estates" : "All Estates"}
        </Text>

        <View style={{ width: 30 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#c9a84c" />
        <TextInput
          placeholder="Search estates..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Empty state while loading */}
      {loading ? (
        <PremiumLoader />
      ) : (
        <FlatList
          data={filteredEstates}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <EstateCard
              item={item}
           
              onPress={() => router.push(`/Home/EstateCompanyDetails?id=${item.id}`)}
            />
          )}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>No estates found.</Text>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1a", padding: 16 ,paddingTop:getStatusBarHeight() + 10},
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.2)",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    marginLeft: 10,
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },
  empty: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 15,
    color: "rgba(255,255,255,0.5)",
  },
});
