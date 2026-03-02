import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import PropertyGrid from "../../../../components/PropertyGrid";

export default function AllPropertiesScreen() {
  const { companyId } = useLocalSearchParams();
  const [properties, setProperties] = useState([]);
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
        const data = result.properties || result.properties || [];
        setProperties(data);
        console.log("Fetched properties:", data);
      } else {
        Alert.alert("Error", result.msg || "Failed to load estates");
      }
       } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((item) =>
    item.propertyName.toLowerCase().includes(search.toLowerCase())
  );

   return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {companyId ? "Company Properties" : "All Properties"}
        </Text>

        <View style={{ width: 30 }} />
      </View>

    
      {/* 🔍 SEARCH BAR (only in this screen) */}
      <View style={{ padding: 15 }}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search properties..."
          style={{
            backgroundColor: '#f1f1f1',
            padding: 12,
            borderRadius: 10,
            fontSize: 15,
          }}
        />
      </View>

        {/* Property Grid */}
      <PropertyGrid properties={filteredProperties} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
});