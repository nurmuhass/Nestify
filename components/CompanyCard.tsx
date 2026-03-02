import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function CompanyCard({ item, onPress }) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={{
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "center",
        elevation: 2,
      }}
    >
      {/* Image */}
      <Image
        source={{ uri: item.profile_image }}
        style={{
          width: 60,
          height: 60,
          borderRadius: 50,
          backgroundColor: "#eee",
        }}
      />

      {/* Info */}
      <View style={{ marginLeft: 15, flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          {item.company_name}
        </Text>

        <Text style={{ fontSize: 13, color: "gray", marginTop: 2 }}>
          {item.email}
        </Text>
        <Text style={{ fontSize: 13, color: "gray" }}>{item.phone}</Text>


  
         
                   <View style={{flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                     <Ionicons name="shield-checkmark" size={18} color="#0a84ff" />
                     <Text style={{ marginLeft: 6, fontSize: 14, color: "#0a84ff" }}>Verified</Text>
                   </View>
             
     
      </View>

      <Ionicons name="chevron-forward" size={20} color="gray" />
    </TouchableOpacity>
  );
}
