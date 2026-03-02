import { AntDesign, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { signOut } from "../../../store";

const tabs = ["Properties", "Pending", "Sold"];

const index = () => {
  const [activeTab, setActiveTab] = useState("Properties");
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const Propertiess = [
    {
      id: "1",
      title: "Wings Tower",
      date: "November 21, 2021",
      status: "Rent",
      image: require("@/assets/images/nearby1.jpg"),
    },
    {
      id: "2",
      title: "Bridgeland Modern House",
      date: "December 17, 2021",
      status: "Rent",
      image: require("@/assets/images/nearby2.jpg"),
    },
  ];

  const Pending = [
    {
      id: "1",
      title: "Fairview Apartment",
      price: "$370/month",
      location: "Jakarta, Indonesia",
      image: require("@/assets/images/nearby3.jpg"),
    },
    {
      id: "2",
      title: "Shoolview House",
      price: "$320/month",
      location: "Jakarta, Indonesia",
      image: require("@/assets/images/nearby4.jpeg"),
    },
  ];

  const sold = [
    {
      id: "1",
      title: "Sunset Villa",
      date: "March 3, 2021",
      price: "$500,000",
      image: require("@/assets/images/nearby3.jpg"),
    },
  ];

  const handleLogout = async () => {
    await signOut();
    // After clearing AsyncStorage, redirect to login:
    router.replace("../../(auth)/Login");
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const userJson = await AsyncStorage.getItem("authUser");
      if (!token || !userJson) {
        console.log("Error", "Not authenticated");
        setLoading(false);
        return;
      }
      const userObj = JSON.parse(userJson);
      setUser(userObj);
      setLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPropertiesByCompany();
    }
  }, [user]);

  const fetchPropertiesByCompany = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(
        `https://insighthub.com.ng/NestifyAPI/get_Company_properties.php?companyId=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        },
      );
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setProperties(result.properties);
        setLoading(false);
        console.log("properties by companies=.....", result.properties);
      } else {
        const msg = result.msg || "Failed to load property details";
        setError(msg);
        setLoading(false);
        Alert.alert("Error", msg);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    let data;
    if (activeTab === "Properties") data = properties;
    else if (activeTab === "Pending") data = Pending;
    else data = sold;

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: `https://insighthub.com.ng/${item.images[0]}` }}
              style={styles.cardImage}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.propertyName}</Text>
              {item.price && (
                <Text style={styles.subText}>
                  {item.rentPrice ? item.rentPrice : item.sellPrice}
                </Text>
              )}
              {/* {item.date && <Text style={styles.subText}>{item.date}</Text>} */}
              {item.location && (
                <Text style={styles.subText}>{item.location}</Text>
              )}
            </View>
          </View>
        )}
      />
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
          height: 50,
        }}
      >
        <TouchableOpacity
          style={{
            padding: 15,
            borderRadius: 25,
            backgroundColor: "#f0f0f0",
            width: 50,
            height: 50,
            position: "absolute",
            left: 20,
            zIndex: 10,
          }}
          onPress={() => {
            router.push("../Profile/Messages");
          }}
        >
          <AntDesign
            name="message1"
            size={20}
            color="black"
            style={{ alignSelf: "center" }}
          />
        </TouchableOpacity>

        <Text
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 22,
          }}
        >
          Profile
        </Text>

        <TouchableOpacity
          style={{
            padding: 15,
            borderRadius: 25,
            backgroundColor: "#f0f0f0",
            width: 50,
            height: 50,
            position: "absolute",
            right: 20,
          }}
          onPress={() => {
            router.push("../Profile/EditProfile");
          }}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color="black"
            style={{ alignSelf: "center" }}
          />
        </TouchableOpacity>

        {/* 
<TouchableOpacity style={{padding:15,borderRadius:25,backgroundColor:'#f0f0f0',
  width:50,height:50, position: 'absolute',right: 20}} onPress={handleLogout}>
 <Ionicons name="settings-outline" size={20} color="black" style={{ alignSelf:'center' }} />
</TouchableOpacity> */}
      </View>

      <View style={styles.profileSection}>
        {user && user.profileImage != null ? (
          <Image
            source={{ uri: user.profileImage }}
            style={styles.profileImage}
          />
        ) : (
          <Image
            source={require("@/assets/images/andrew.jpg")}
            style={styles.profileImage}
          />
        )}

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>30</Text>
            <Text>Properties</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>12</Text>
            <Text>Sold</Text>
          </View>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => {
              router.push("../Profile/UserReviews");
            }}
          >
            <Text style={styles.statNumber}>28</Text>
            <Text>Reviews</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text
              style={[styles.tabText, activeTab === tab && styles.activeTab]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.contentContainer}>{renderTabContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: getStatusBarHeight(),
  },
  profileSection: { alignItems: "center", padding: 20 },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#007BFF",
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#007BFF",
  },
  name: { fontSize: 18, fontWeight: "bold", marginTop: 8 },
  email: { color: "gray", fontSize: 14 },
  statsContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-around",
    width: "100%",
  },
  stat: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e6f5ea",
    padding: 10,
    borderRadius: 10,
    width: 90,
  },
  statNumber: { fontWeight: "bold", fontSize: 16 },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 13,
    backgroundColor: "#f0f0f0",
    width: "90%",
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 20,
  },
  tabText: { fontSize: 16, color: "#888", padding: 7 },
  activeTab: {
    color: "#555",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 7,
  },
  contentContainer: { paddingHorizontal: 10 },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginVertical: 8,
    padding: 10,
  },
  cardImage: { width: 100, height: 80, borderRadius: 10 },
  cardContent: { marginLeft: 10, justifyContent: "center" },
  cardTitle: { fontWeight: "bold", fontSize: 16 },
  subText: { fontSize: 14, color: "gray" },
});
export default index;
