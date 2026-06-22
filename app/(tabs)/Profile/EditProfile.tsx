import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { City, State } from "country-state-city";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { AuthContext } from "../../../store";
import { useToast } from "@/components/Toast";
import PremiumLoader from "@/components/PremiumLoader";
import { colorWithAlpha } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

type UserType = {
  id?: number | string;
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  address?: string;
  is_seller?: number | boolean;
  seller_type?: "company" | "agent" | "owner" | string;
  sellerType?: "company" | "agent" | "owner" | string;
  company_name?: string;
  companyName?: string;
  license_number?: string;
  rc_number?: string;
  nin?: string;
  about?: string;
  website?: string;
  profileImage?: string;
  profile_image?: string;
  cover_image?: string;
  coverImage?: string;
  date_established?: string;
  isSeller?: number | boolean;
};

const NG = "NG";

const EditProfile = () => {
  const router = useRouter();
  const { signOut } = useContext(AuthContext);
  const { show } = useToast();
  const { colors } = useTheme();

  const [user, setUser] = useState<UserType | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const [isSeller, setIsSeller] = useState(false);
  const [sellerType, setSellerType] = useState<
    "company" | "agent" | "owner" | null
  >(null);
  const [companyName, setCompanyName] = useState("");
  const [sellerIdNumber, setSellerIdNumber] = useState("");
  const [about, setAbout] = useState("");
  const [website, setWebsite] = useState("");
  const [date_established, setDateEstablished] = useState("");

  const [state, setState] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);

  const [stateItems, setStateItems] = useState<any[]>([]);
  const [cityItems, setCityItems] = useState<any[]>([]);
  const [openState, setOpenState] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  const [rawUser, setRawUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const stateLabel = useMemo(() => {
    if (!state) return null;
    const found = stateItems.find((item) => item.value === state);
    return found?.label ?? state;
  }, [state, stateItems]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userJson = await AsyncStorage.getItem("authUser");

        if (!token || !userJson) {
          show({
            type: "error",
            title: "Not authenticated",
            message: "Please sign in again.",
          });
          router.replace("/(auth)/Login");
          return;
        }

        const userObj: UserType = JSON.parse(userJson);

        setUser(userObj);

        setName(userObj.name || "");
        setPhone(userObj.phone || "");
        setEmail(userObj.email || "");
        setAddress(userObj.address || "");

        const sellerFlag =
          userObj.is_seller == 1 ||
          userObj.is_seller === true ||
          userObj.isSeller === true;
        setIsSeller(sellerFlag);

        let sellerTypeValue = String(
          userObj.seller_type || userObj.sellerType || "",
        ).toLowerCase();
        if (!["company", "agent", "owner"].includes(sellerTypeValue)) {
          if (userObj.company_name || userObj.companyName)
            sellerTypeValue = "company";
          else if (userObj.rc_number) sellerTypeValue = "company";
          else if (userObj.nin) sellerTypeValue = sellerFlag ? "agent" : "";
        }

        // Default to 'company' if isSeller but no type detected
        const finalSellerType =
          sellerFlag && !sellerTypeValue
            ? "company"
            : sellerTypeValue === "company" ||
                sellerTypeValue === "agent" ||
                sellerTypeValue === "owner"
              ? (sellerTypeValue as "company" | "agent" | "owner")
              : null;

        setSellerType(finalSellerType);
        setCompanyName(userObj.company_name || userObj.companyName || "");

        // Load seller ID number based on final seller type
        if (finalSellerType === "company") {
          setSellerIdNumber(userObj.rc_number || userObj.license_number || "");
        } else if (finalSellerType === "agent" || finalSellerType === "owner") {
          setSellerIdNumber(userObj.nin || userObj.license_number || "");
        } else {
          setSellerIdNumber(userObj.license_number || "");
        }

        setAbout(userObj.about || "");
        setWebsite(userObj.website || "");
        setDateEstablished(userObj.date_established || "");

        setProfileImage(userObj.profileImage || userObj.profile_image || null);
        setCoverImage(userObj.cover_image || userObj.coverImage || null);

        setRawUser(userObj);

        const allStates = State.getStatesOfCountry(NG);
        const mappedStates = allStates.map((s) => ({
          label: s.name,
          value: s.isoCode,
        }));
        setStateItems(mappedStates);

        const foundState = allStates.find(
          (s) => s.name.toLowerCase() === (userObj.state || "").toLowerCase(),
        );

        if (foundState) {
          setState(foundState.isoCode);

          const allCities = City.getCitiesOfState(NG, foundState.isoCode);
          const mappedCities = allCities.map((c) => ({
            label: c.name,
            value: c.name,
          }));
          setCityItems(mappedCities);

          const foundCity = allCities.find(
            (c) => c.name.toLowerCase() === (userObj.city || "").toLowerCase(),
          );
          if (foundCity) {
            setCity(foundCity.name);
          }
        }
      } catch (err) {
        console.error(err);
        show({
          type: "error",
          title: "Error",
          message: "Failed to load profile.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router, show]);

  useEffect(() => {
    const states = State.getStatesOfCountry("NG").map((s) => ({
      label: s.name,
      value: s.isoCode,
    }));

    setStateItems(states);
  }, []);

  useEffect(() => {
    if (!rawUser || stateItems.length === 0) return;

    const matchedState = stateItems.find(
      (s) => s.label.toLowerCase() === rawUser.state?.toLowerCase(),
    );

    if (matchedState) {
      setState(matchedState.value); // ISO code
    }
  }, [rawUser, stateItems]);

  useEffect(() => {
    if (!state) return;

    const cities = City.getCitiesOfState("NG", state).map((c) => ({
      label: c.name,
      value: c.name,
    }));

    setCityItems(cities);
  }, [state]);

  useEffect(() => {
    if (!rawUser || cityItems.length === 0) return;

    const matchedCity = cityItems.find(
      (c) => c.label.toLowerCase() === rawUser.city?.toLowerCase(),
    );

    if (matchedCity) {
      setCity(matchedCity.value);
    }
  }, [rawUser, cityItems]);

  const pickImage = async (setFn: (uri: string) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      show({
        type: "error",
        title: "Permission denied",
        message: "Gallery permission is required.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setFn(result.assets[0].uri);
    }
  };

  const handlePickProfileImage = async () => {
    await pickImage(setProfileImage);
  };

  const handlePickCoverImage = async () => {
    await pickImage(setCoverImage);
  };

  const appendImageIfLocal = (
    formData: FormData,
    fieldName: string,
    uri: string | null,
  ) => {
    if (!uri || !uri.startsWith("file")) return;

    const fileName = uri.split("/").pop() || `${fieldName}.jpg`;
    const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";

    let mimeType = "image/jpeg";
    if (ext === "png") mimeType = "image/png";
    if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
    if (ext === "webp") mimeType = "image/webp";

    formData.append(fieldName, {
      uri,
      name: fileName,
      type: mimeType,
    } as any);
  };

  const handleUpdateProfile = async () => {
    const currentProfileImage =
      profileImage || user?.profile_image || user?.profileImage;

    if (!name.trim() || !email.trim() || !phone.trim()) {
      show({
        type: "error",
        title: "Missing fields",
        message: "Name, email, and phone are required.",
      });
      return;
    }

    if (!address.trim()) {
      show({
        type: "error",
        title: "Address required",
        message: "Please enter your full address.",
      });
      return;
    }

    if (!currentProfileImage) {
      show({
        type: "error",
        title: "Profile image required",
        message: "Please upload a profile image before updating your profile.",
      });
      return;
    }

    if (!state || !city) {
      show({
        type: "error",
        title: "Location required",
        message: "Please select both state and city.",
      });
      return;
    }

    if (isSeller) {
      if (!sellerType) {
        show({
          type: "warning",
          title: "Seller details",
          message: "Seller type is required to update seller information.",
        });
        return;
      }

      if (!companyName.trim()) {
        show({
          type: "warning",
          title: "Company name required",
          message: "Please enter your company name.",
        });
        return;
      }

      if (!sellerIdNumber.trim()) {
        show({
          type: "warning",
          title: "Seller details",
          message:
            sellerType === "company"
              ? "RC number is required for company sellers."
              : "NIN is required for agent or owner sellers.",
        });
        return;
      }
    }

    setUpdating(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        show({
          type: "error",
          title: "Not authenticated",
          message: "Please sign in again.",
        });
        router.replace("/(auth)/Login");
        return;
      }

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("address", address.trim());

      if (stateLabel) {
        formData.append("state", stateLabel);
      }

      formData.append("city", city);

      if (isSeller) {
        // Always send company name if provided
        if (companyName.trim()) {
          formData.append("company_name", companyName.trim());
        }

        if (sellerType === "company") {
          formData.append("rc_number", sellerIdNumber.trim());
        } else {
          formData.append("nin", sellerIdNumber.trim());
        }
        formData.append("seller_type", sellerType ?? "");
        formData.append("about", about.trim());
        formData.append("website", website.trim());
        formData.append("date_established", date_established.trim());
      }

      appendImageIfLocal(formData, "profile_image", profileImage);

      if (isSeller) {
        appendImageIfLocal(formData, "cover_image", coverImage);
      }

      const response = await fetch(
        "https://insighthub.com.ng/NestifyAPI/update_profile.php",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        },
      );

      const text = await response.text();

      let result: any;
      try {
        result = JSON.parse(text);
      } catch {
        show({
          type: "error",
          title: "Server error",
          message: "Unexpected response from server.",
        });
        return;
      }

      if (response.ok && result.status === "success") {
        if (result.user) {
          await AsyncStorage.setItem("authUser", JSON.stringify(result.user));
          setUser(result.user);
        }

        show({
          type: "success",
          title: "Profile updated",
          message: "Your profile was updated successfully.",
        });

        // Navigate back to profile page after successful update
        router.replace("/(tabs)/Profile");
      } else {
        show({
          type: "error",
          title: "Update failed",
          message: result.msg || "Unknown error occurred.",
        });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      show({
        type: "error",
        title: "Network error",
        message: "Could not update profile.",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/Login");
  };

  if (loading) {
    return <PremiumLoader />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => router.replace("/(tabs)/Profile")}
          >
            <Ionicons name="arrow-back" size={22} color={colors.icon} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>
            Update your details and seller profile
          </Text>

          {isSeller && (
            <View style={styles.coverCard}>
              <View style={[styles.coverPreviewWrap, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                {coverImage || user?.cover_image ? (
                  <Image
                    source={{ uri: coverImage || user?.cover_image }}
                    style={styles.coverImage}
                  />
                ) : (
                  <View style={[styles.coverPlaceholder, { backgroundColor: colors.inputBackground }]}>
                    <Ionicons
                      name="image-outline"
                      size={28}
                      color={colors.icon}
                    />
                    <Text style={[styles.coverPlaceholderText, { color: colors.mutedText }]}>
                      Seller cover image
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.coverEditBtn, { backgroundColor: colors.buttonBackground }]}
                  onPress={handlePickCoverImage}
                >
                  <Ionicons name="camera" size={18} color={colors.background} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.profileCard}>
            <View style={styles.profileImageWrap}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={[styles.profileFallback, { backgroundColor: colors.cardBackground, borderColor: colorWithAlpha(colors.buttonBackground, 0.7) }]}>
                  <Text style={[styles.profileFallbackText, { color: colors.warning }]}>
                    {(user?.name?.[0] || "U").toUpperCase()}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.profileEditBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.background }]}
                onPress={handlePickProfileImage}
              >
                <Ionicons name="pencil" size={16} color={colors.background} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>

            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={18} color={colors.icon} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor={colors.mutedText}
                style={[styles.input, { color: colors.text }]}
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Ionicons name="call-outline" size={18} color={colors.icon} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone Number"
                placeholderTextColor={colors.mutedText}
                keyboardType="phone-pad"
                style={[styles.input, { color: colors.text }]}
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={18} color={colors.icon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor={colors.mutedText}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: colors.text }]}
              />
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>

            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Ionicons name="location-outline" size={18} color={colors.icon} />
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Full Address"
                placeholderTextColor={colors.mutedText}
                style={[styles.input, { color: colors.text }]}
              />
            </View>

            <View style={{ zIndex: 3000, marginBottom: 14 }}>
              <DropDownPicker
                open={openState}
                value={state}
                items={stateItems}
                setOpen={setOpenState}
                setValue={(callback) => {
                  const value =
                    typeof callback === "function" ? callback(state) : callback;
                  setState(value);
                }}
                setItems={setStateItems}
                placeholder="Select State"
                searchable
                listMode="SCROLLVIEW"
                zIndex={3000}
                zIndexInverse={1000}
                style={[styles.dropdown, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                dropDownContainerStyle={[styles.dropdownContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                textStyle={[styles.dropdownText, { color: colors.text }]}
                placeholderStyle={[styles.dropdownPlaceholder, { color: colors.mutedText }]}
                searchTextInputStyle={[styles.dropdownSearch, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              />
            </View>

            <View style={{ zIndex: 2000 }}>
              <DropDownPicker
                open={openCity}
                value={city}
                items={cityItems}
                setOpen={setOpenCity}
                setValue={(callback) => {
                  const value =
                    typeof callback === "function" ? callback(city) : callback;
                  setCity(value);
                }}
                setItems={setCityItems}
                placeholder="Select City"
                searchable
                listMode="SCROLLVIEW"
                zIndex={2000}
                zIndexInverse={2000}
                style={[styles.dropdown, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                dropDownContainerStyle={[styles.dropdownContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                textStyle={[styles.dropdownText, { color: colors.text }]}
                placeholderStyle={[styles.dropdownPlaceholder, { color: colors.mutedText }]}
                searchTextInputStyle={[styles.dropdownSearch, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              />
            </View>
          </View>

          {isSeller && (
            <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Seller Details</Text>

              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Ionicons name="business-outline" size={18} color={colors.icon} />
                <TextInput
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholder="Company Name"
                  placeholderTextColor={colors.mutedText}
                  style={[styles.input, { color: colors.text }]}
                />
              </View>

              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Ionicons name="card-outline" size={18} color={colors.icon} />
                <TextInput
                  value={sellerIdNumber}
                  onChangeText={setSellerIdNumber}
                  placeholder={
                    sellerType === "company"
                      ? "RC Number"
                      : sellerType === "agent" || sellerType === "owner"
                        ? "NIN"
                        : "NIN / RC Number"
                  }
                  placeholderTextColor={colors.mutedText}
                  style={[styles.input, { color: colors.text }]}
                />
              </View>

              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Ionicons name="globe-outline" size={18} color={colors.icon} />
                <TextInput
                  value={website}
                  onChangeText={setWebsite}
                  placeholder="Website(optional)"
                  placeholderTextColor={colors.mutedText}
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Ionicons name="calendar-outline" size={18} color={colors.icon} />
                <TextInput
                  value={date_established}
                  onChangeText={setDateEstablished}
                  placeholder="Date Established"
                  placeholderTextColor={colors.mutedText}
                  style={[styles.input, { color: colors.text }]}
                />
              </View>

              <View style={[styles.inputWrapper, styles.textAreaWrap, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={colors.icon}
                />
                <TextInput
                  value={about}
                  onChangeText={setAbout}
                  placeholder="About your company(optional)"
                  placeholderTextColor={colors.mutedText}
                  multiline
                  textAlignVertical="top"
                  style={[styles.input, styles.textArea, { color: colors.text }]}
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: colors.buttonBackground }, updating && { opacity: 0.7 }]}
            onPress={handleUpdateProfile}
            disabled={updating}
            activeOpacity={0.85}
          >
            {updating ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.updateButtonText, { color: colors.background }]}>Update Profile</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: colorWithAlpha(colors.error, 0.28), backgroundColor: colorWithAlpha(colors.error, 0.08) }]}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2044",
    paddingTop: getStatusBarHeight(),
  },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f2044",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    marginTop: 6,
    marginBottom: 18,
  },
  coverCard: {
    marginBottom: 16,
  },
  coverPreviewWrap: {
    height: 160,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  coverPlaceholderText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
  },
  coverEditBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#c9a84c",
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    alignItems: "center",
    marginBottom: 12,
  },
  profileImageWrap: {
    position: "relative",
    width: 96,
    height: 96,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(201,168,76,0.7)",
  },
  profileFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 2,
    borderColor: "rgba(201,168,76,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileFallbackText: {
    color: "#f0d98a",
    fontSize: 28,
    fontWeight: "700",
  },
  profileEditBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#c9a84c",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0f2044",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  inputWrapper: {
    width: "100%",
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
    paddingVertical: 12,
  },
  textAreaWrap: {
    alignItems: "flex-start",
    paddingTop: 14,
    paddingBottom: 14,
  },
  textArea: {
    minHeight: 80,
  },
  dropdown: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    minHeight: 52,
  },
  dropdownContainer: {
    backgroundColor: "#0f2044",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
  },
  dropdownText: {
    color: "#fff",
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: "#98a2b3",
    fontSize: 14,
  },
  dropdownSearch: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.12)",
    color: "#fff",
    borderRadius: 10,
  },
  updateButton: {
    backgroundColor: "#c9a84c",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginTop: 8,
    marginBottom: 12,
  },
  updateButtonText: {
    color: "#0f2044",
    fontSize: 15,
    fontWeight: "800",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.28)",
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default EditProfile;
