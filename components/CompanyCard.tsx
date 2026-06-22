import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/context/ThemeContext";

type CompanyCardItem = {
  profile_image?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
};

type CompanyCardProps = {
  item: CompanyCardItem;
  onPress: (item: CompanyCardItem) => void;
};

export default function CompanyCard({ item, onPress }: CompanyCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={{
        backgroundColor: colors.cardBackground,
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "center",
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
      }}
    >
      <Image
        source={{ uri: item.profile_image }}
        style={{
          width: 60,
          height: 60,
          borderRadius: 50,
          backgroundColor: colors.inputBackground,
        }}
      />

      <View style={{ marginLeft: 15, flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.text }}>
          {item.company_name}
        </Text>

        <Text style={{ fontSize: 13, color: colors.mutedText, marginTop: 2 }}>
          {item.email}
        </Text>
        <Text style={{ fontSize: 13, color: colors.mutedText }}>
          {item.phone}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Ionicons name="shield-checkmark" size={18} color={colors.success} />
          <Text style={{ marginLeft: 6, fontSize: 14, color: colors.success }}>
            Verified
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.icon} />
    </TouchableOpacity>
  );
}
