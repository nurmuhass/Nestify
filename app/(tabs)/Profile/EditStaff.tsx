import PremiumLoader from "@/components/PremiumLoader";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { useToast } from "@/components/Toast";
import { useTheme } from "@/context/ThemeContext";

const BASE = "https://insighthub.com.ng";

export default function EditStaff() {
  const { show } = useToast();
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [city, setCity] = useState("");
  const [image, setImage] = useState<any>(null);

  // ── FETCH STAFF ─────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");

        const res = await fetch(
          `${BASE}/NestifyAPI/get_user_by_id.php?id=${id}`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );

        const result = await res.json();

        if (result.status === "success") {
          const u = result.data;
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setStateVal(u.state || "");
          setCity(u.city || "");
          setImage(u.profile_image || null);
        }
      } catch (err) {
        show({
          type: 'error',
          title: 'Error',
          message: 'Failed to load staff',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  // ── PICK IMAGE ─────────────────────────────────────
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      show({
        type: 'error',
        title: 'Permission required',
        message: 'Please allow photo library access.',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ── UPDATE STAFF ───────────────────────────────────
  const handleUpdate = async () => {
    if (!name || !email || !phone) {
      show({
        type: 'error',
        title: 'Error',
        message: 'All fields are required',
      });
      return;
    }

    setUpdating(true);

    try {
      const token = await AsyncStorage.getItem("authToken");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("state", stateVal);
      formData.append("city", city);

      // image
      if (image && image.startsWith("file")) {
        const fileName = image.split("/").pop();
        const ext = fileName.split(".").pop();

        formData.append("profile_image", {
          uri: image,
          name: fileName,
          type: `image/${ext}`,
        } as any);
      }

      const res = await fetch(
        `${BASE}/NestifyAPI/update_staff.php?id=${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        }
      );

      const result = await res.json();

      if (result.status === "success") {
        show({
          type: 'success',
          title: 'Success',
          message: 'Staff updated successfully',
        });
        router.back();
      } else {
        show({
          type: 'error',
          title: 'Error',
          message: result.msg,
        });
      }
    } catch (err) {
      show({
        type: 'error',
        title: 'Error',
        message: 'Update failed',
      });
    } finally {
      setUpdating(false);
    }
  };


  // delete staff
  const handleDelete = async () => {
    show({
      type: 'warning',
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this staff?',
      action: {
        label: 'Delete',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("authToken");

            const res = await fetch(`${BASE}/NestifyAPI/delete_staff.php`, {
              method: "POST",
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userId: id }),
            });

            const result = await res.json();

            if (result.status === "success") {
              show({
                type: 'success',
                title: 'Success',
                message: 'Staff deleted successfully',
              });
              router.back();
            } else {
              show({
                type: 'error',
                title: 'Error',
                message: result.msg,
              });
            }
          } catch (err) {
            show({
              type: 'error',
              title: 'Error',
              message: 'Delete failed',
            });
          }
        },
      },
    });
  };



  if (loading) {
    return <PremiumLoader />;
  }


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Edit Staff</Text>

        <TouchableOpacity onPress={handleDelete} style={{ marginLeft: "auto" }}>
          <Ionicons name="trash" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Image */}
      <TouchableOpacity onPress={pickImage} style={styles.imageWrap}>
        <Image
          source={
            image
              ? { uri: image }
              : require("@/assets/images/andrew.jpg")
          }
        style={[styles.avatar, { borderColor: colors.buttonBackground }]}
        />
        <View style={[styles.editIcon, { backgroundColor: colors.buttonBackground }]}>
          <Ionicons name="pencil" size={14} color={colors.background} />
        </View>
      </TouchableOpacity>

      {/* Inputs */}
      <View style={[styles.inputBox, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor={colors.mutedText}
          style={[styles.input, { color: colors.text }]}
        />
      </View>

      <View style={[styles.inputBox, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.mutedText}
          style={[styles.input, { color: colors.text }]}
        />
      </View>

      <View style={[styles.inputBox, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone"
          placeholderTextColor={colors.mutedText}
          style={[styles.input, { color: colors.text }]}
        />
      </View>

      <View style={[styles.inputBox, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <TextInput
          value={stateVal}
          onChangeText={setStateVal}
          placeholder="State"
          placeholderTextColor={colors.mutedText}
          style={[styles.input, { color: colors.text }]}
        />
      </View>

      <View style={[styles.inputBox, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder="City"
          placeholderTextColor={colors.mutedText}
          style={[styles.input, { color: colors.text }]}
        />
      </View>

      {/* Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.buttonBackground }]}
        onPress={handleUpdate}
        disabled={updating}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          {updating ? "Updating..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A",
    padding: 20,
    paddingTop: getStatusBarHeight(),
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  imageWrap: {
    alignSelf: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#C9A84C",
  },

  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#C9A84C",
    padding: 5,
    borderRadius: 10,
  },

  inputBox: {
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ffffff10",
  },

  input: {
    color: "#fff",
    fontSize: 14,
  },

  button: {
    backgroundColor: "#C9A84C",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#0F0F1A",
    fontWeight: "700",
  },
});
