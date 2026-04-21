import { AntDesign, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

const tabs = ["Properties", "Pending", "Rejected"];

const index = () => {
  const [activeTab, setActiveTab] = useState("Properties");
  const [user, setUser] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState([]);
  const [error, setError] = useState(null);

  const router = useRouter();

  

  

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

useFocusEffect(
  useCallback(() => {
    if (user) {
      fetchPropertiesByCompany();
      fetchSaved();
    }
  }, [user])
);

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
     
        setAllProperties(result.properties ?? []);
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


  const fetchSaved = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(
        'https://insighthub.com.ng/NestifyAPI/get_liked_properties.php',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token ?? ''}`,
          },
        }
      );
      const result = await res.json();
      if (result.status === 'success') setSaved(result.data ?? []);
      console.log(result.data ,' saved properties loaded');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
const renderTabContent = () => {
  
  if (!allProperties || allProperties.length === 0) {
    return (
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <Text style={{ color: '#888', fontSize: 15 }}>No properties found</Text>
      </View>
    );
  }

  let data;
  if (activeTab === "Properties") {
    data = allProperties.filter(p => p.approval_status === 'approved');
  } else if (activeTab === "Pending") {
    data = allProperties.filter(p => p.approval_status === 'pending');
  } else {
    data = allProperties.filter(p => p.approval_status === 'rejected');
  }

  if (data.length === 0) {
    return (
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <Text style={{ color: '#888', fontSize: 15 }}>
          No {activeTab.toLowerCase()} properties
        </Text>
      </View>
    );
  }

  return (
   
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}        onPress={() =>
                    router.push({
                      pathname: "/Profile/EditProperty",
                params: { id: item.id },
                    })
                  }>
            <Image
              source={{ uri: `https://insighthub.com.ng/${item.images[0]}` }}
              style={styles.cardImage}
            />
            <View style={styles.cardContent}>
              <Text  numberOfLines={1}
    ellipsizeMode="tail" style={styles.cardTitle}>{item.propertyName}</Text>
              {item.sellPrice  && (
                <Text  numberOfLines={1}
    ellipsizeMode="tail" style={{...styles.subText, color: '#1e40af', }}>
                  {item.listingType === 'Rent'
                    ? `$${item.rentPrice}/year`
                    : item.listingType === 'Sell'
                    ? `${item.sellPrice}`
                    : `${item.sellPrice} • ${item.rentPrice}/year`}
                </Text>
              )}


         


            {item.location && (
  <Text
    style={{flex: 1 ,color: '#4b5563', fontSize: 13, width: '80%' }}
    numberOfLines={1}
    ellipsizeMode="tail"
  >
    {item.location}
  </Text>
)}

<View style={{ flexDirection: 'row' ,alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>

{item.created_at && (
  <Text style={{}}>{formatDate(item.created_at)}</Text>
)}

             {item.status && (
  <Text
    style={{
      backgroundColor: 
        item.status.toLowerCase() === 'available' ? '#059669' :
        item.status.toLowerCase() === 'draft'     ? '#64748b' :
        item.status.toLowerCase() === 'sold'      ? '#e11d48' :
        '#4f46e5',
      color: 'white',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 20,        // pill shape looks cleaner for status badges

      marginRight: '17%',
      marginTop: 2,
      textTransform: 'capitalize',
      fontSize: 11,
      fontWeight: '600',       // slightly bold reads better on colored bg
      overflow: 'hidden',      // ensures borderRadius clips properly on Android
    }}
  >
    {item.status}
  </Text>
)}
</View>
            </View>
          </TouchableOpacity>
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

        <Text style={styles.name}>{user ? user.name : "User Name"}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{allProperties.length}</Text>
            <Text style={{fontSize:12}}>Properties</Text>
          </View>
     <TouchableOpacity style={styles.stat} onPress={() => router.push("../Profile/Wishlist")}>
            <Text style={styles.statNumber}>{saved.length}</Text>
            <Text style={{fontSize:12}}>Wishlists</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => {
              router.push("../Profile/UserReviews");
            }}
          >
            <Text style={styles.statNumber}>{user?.review_count ?? 0}</Text>
            <Text style={{fontSize:12}}>Reviews</Text>
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
