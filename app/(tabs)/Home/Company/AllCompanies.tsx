import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CompanyCard from "../../../../components/CompanyCard";

export default function AllCompanies() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH COMPANIES
     ========================= */
  const fetchCompanies = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch(
        "https://insighthub.com.ng/NestifyAPI/get_companies.php",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Token " + (token ?? ""),
          },
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setCompanies(result.companies || []);
      } else {
        Alert.alert("Error", result.msg || "Failed to load companies");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  /* =========================
     FETCH CATEGORIES
     ========================= */
  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch(
        "https://insighthub.com.ng/NestifyAPI/get_categories.php",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Token " + (token ?? ""),
          },
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setCategories(result.categories || []);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  useEffect(() => {
    Promise.all([fetchCompanies(), fetchCategories()]).finally(() =>
      setLoading(false)
    );
  }, []);

  /* =========================
     FILTER LOGIC
     ========================= */
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      // SEARCH FILTER
      if (
        search &&
        !company.company_name
          ?.toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false;
      }

      // CATEGORY FILTER
      if (activeCategory !== "All") {
        // Expecting company.categories = ["3","7"]
        if (!company.categories?.includes(activeCategory)) return false;
      }

      return true;
    });
  }, [companies, search, activeCategory]);

  if (loading) return null;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 15 }}>
      {/* ================= HEADER ================= */}
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Real Estate Companies
      </Text>

      {/* ================= SEARCH ================= */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search company..."
        style={{
          backgroundColor: "#f1f1f1",
          padding: 12,
          borderRadius: 10,
          fontSize: 15,
          marginBottom: 15,
        }}
      />

      {/* ================= CATEGORY FILTER ================= */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 15 }}
      >
        <TouchableOpacity
          onPress={() => setActiveCategory("All")}
          style={{
            marginRight: 10,
            paddingVertical: 6,
            paddingHorizontal: 16,
            backgroundColor: activeCategory === "All" ? "#000" : "#eee",
            borderRadius: 20,
          }}
        >
          <Text style={{ color: activeCategory === "All" ? "#fff" : "#000" }}>
            All
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setActiveCategory(String(cat.id))}
            style={{
              marginRight: 10,
              paddingVertical: 6,
              paddingHorizontal: 16,
              backgroundColor:
                activeCategory === String(cat.id) ? "#000" : "#eee",
              borderRadius: 20,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color:
                  activeCategory === String(cat.id) ? "#fff" : "#000",
              }}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ================= LIST ================= */}
      <FlatList
        data={filteredCompanies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CompanyCard
            item={item}
            onPress={() =>
              router.push({
                pathname: "/Home/Company/Details",
                params: { id: item.id },
              })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
