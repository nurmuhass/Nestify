import AsyncStorage from "@react-native-async-storage/async-storage";
import { City, Country, State } from "country-state-city";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { getStatusBarHeight } from "react-native-status-bar-height";
import Icon from "react-native-vector-icons/MaterialIcons";
import PricingModal from "../../../components/PricingModal";

// Multi-step form component
const index = () => {
  // State to track the current step
  const [currentStep, setCurrentStep] = useState(0);

  const [pricingVisible, setPricingVisible] = useState(true);
  // State for form data
  const [formData, setFormData] = useState({
    images: [],
    thumbnail: "",
    propertyName: "",
    listingType: "Sell", // or 'Rent'
    Furnishing: "Unfurnished", // or 'Furnished'
    sellPrice: "",
    rentPrice: "",
    rentPeriod: "Monthly", // or 'Yearly'
    bedrooms: 3,
    Toilet: 2,
    BQ: 1,
    balconies: 2,
    totalRooms: "6",
    description: "",
    propertyCategory: "",
    propertySubCategory: "",
    country: "Nigeria",
    state: "",
    city: "",
    size: "",
    status: "",
    documentType: "",
    condition: "",
    salesType: "",
    location: "",
    parkingspace: 2,
    managedByUs: false,
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  /* =========================
     FETCH CATEGORIES
     ========================= */
  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch(
        "https://insighthub.com.ng/NestifyAPI/get_categories_WithSubs.php",
        {
          headers: {
            Authorization: "Token " + (token ?? ""),
          },
        },
      );

      const result = await response.json();

      if (result.status === "success") {
        setCategories(result.categories);
      } else {
        Alert.alert("Error", result.msg || "Failed to load categories");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  //  const [country, setCountry] = useState(null);
  const [country, setCountry] = useState("NG");
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(false);

  const [countryItems, setCountryItems] = useState([]);
  const [stateItems, setStateItems] = useState([]);
  const [cityItems, setCityItems] = useState([]);

  const [openState, setOpenState] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  const [selectedType, setSelectedType] = useState("");
  const [condition, setCondition] = useState("");
  const [selectedSalesType, setSelectedSalesType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    handleChange("status", value); // keep formData in sync
  };

  const router = useRouter();

  const [openCategory, setOpenCategory] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);

  const [openSub, setOpenSub] = useState(false);
  const [subValue, setSubValue] = useState(null);
  const [subItems, setSubItems] = useState([]);

  useEffect(() => {
    if (categories.length > 0) {
      const formatted = categories.map((cat) => ({
        label: cat.name,
        value: cat.id,
      }));

      setCategoryItems(formatted);
    }
  }, [categories]);

  useEffect(() => {
    if (categoryValue) {
      const selected = categories.find((c) => c.id == categoryValue);

      if (selected) {
        const subs = selected.subcategories.map((s) => ({
          label: s.name,
          value: s.id,
        }));

        setSubItems(subs);
      }
    } else {
      setSubItems([]);
    }

    setSubValue(null);
  }, [categoryValue]);

  const onValueChange = (itemValue) => {
    setSelectedType(itemValue);
    handleChange("documentType", itemValue); // keep formData in sync
  };

  const handleConditionChange = (value) => {
    setCondition(value);
    handleChange("condition", value); // keep formData in sync
  };

  const handleSalesTypeChange = (value) => {
    setSelectedSalesType(value);
    handleChange("salesType", value); // keep formData in sync
  };

  const LAND_CATEGORY_IDS = [7, 12];

  const isLandCategory = LAND_CATEGORY_IDS.includes(Number(categoryValue));

  // Document type
  const [openDoc, setOpenDoc] = useState(false);
  const [docValue, setDocValue] = useState(null);
  const [docItems, setDocItems] = useState([
    { label: "Certificate of Occupancy (C of O)", value: "CofO" },
    { label: "Right of Occupancy (R of O)", value: "RofO" },
    { label: "Deed of Assignment", value: "DeedOfAssignment" },
    { label: "Governor’s Consent", value: "GovernorsConsent" },
    { label: "Registered Survey", value: "RegisteredSurvey" },
    { label: "Excision", value: "Excision" },
    { label: "Gazette", value: "Gazette" },
    { label: "Others", value: "Others" },
  ]);

  // Condition
  const [openCondition, setOpenCondition] = useState(false);
  const [conditionValue, setConditionValue] = useState(null);
  const [conditionItems, setConditionItems] = useState([
    { label: "Newly Built", value: "newly_built" },
    { label: "Renovated", value: "renovated" },
    { label: "Needs Renovation", value: "needs_renovation" },
    { label: "Old Building", value: "Old Building" },
    { label: "Fair Condition", value: "Fair Condition" },
    { label: "Under Construction", value: "Under Construction" },
  ]);

  // Sales type
  const [openSales, setOpenSales] = useState(false);
  const [salesValue, setSalesValue] = useState(null);
  const [salesItems, setSalesItems] = useState([
    { label: "Bonanza", value: "bonanza" },
    { label: "Cash Back Sales", value: "cashback" },
    { label: "Limited Offer", value: "limited_offer" },
    { label: "Discount Promo", value: "discount_promo" },
    { label: "Diaspora", value: "Diaspora" },
    { label: "Distress", value: "Distress" },
    { label: "Investment", value: "Investment" },
    { label: "Off-Plan", value: "Off-Plan" },
  ]);

  // Status
  const [openStatus, setOpenStatus] = useState(false);
  const [statusValue, setStatusValue] = useState(null);
  const [statusItems, setStatusItems] = useState([
    { label: "Available", value: "available" },
    { label: "Sold", value: "sold" },
    { label: "Draft", value: "draft" },
  ]);
  // Load countries
  useEffect(() => {
    const countries = Country.getAllCountries().map((c) => ({
      label: c.name,
      value: c.isoCode,
    }));
    setCountryItems(countries);
  }, []);

  useEffect(() => {
    // Always use 'NG' for Nigeria
    const states = State.getStatesOfCountry("NG").map((s) => ({
      label: s.name,
      value: s.isoCode,
    }));
    setStateItems(states);
    setState(null);
    setCity(null);
    setCityItems([]);
  }, []);

  // Load cities when state changes
  useEffect(() => {
    if (state) {
      const cities = City.getCitiesOfState("NG", state).map((c) => ({
        label: c.name,
        value: c.name,
      }));
      setCityItems(cities);
      setCity(null);
    }
  }, [state]);

  // State for errors/success messages
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Function to handle form field changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Function to handle next step
  const handleNext = () => {
    // Simple validation could be added here
    if (currentStep === steps.length - 1) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  // Function to handle previous step
  const handleBack = () => {
    if (currentStep === 0) {
      // Go back to previous screen
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("uploading");
      setLoading(true);
      // 1) Create a new FormData object
      const data = new FormData();

      // 2) Append all text fields
      data.append("propertyName", formData.propertyName);
      data.append("listingType", formData.listingType);
      data.append("Furnishing", formData.Furnishing);
      data.append("sellPrice", formData.sellPrice || "");
      data.append("rentPrice", formData.rentPrice || "");
      data.append("rentPeriod", formData.rentPeriod || "");
      data.append("size", formData.size || "");
      data.append("bedrooms", String(formData.bedrooms));
      data.append("Toilet", String(formData.Toilet));
      data.append("BQ", String(formData.BQ));
      data.append("balconies", String(formData.balconies));
      data.append("totalRooms", String(formData.totalRooms));
      data.append("description", formData.description);
      data.append("propertyCategory", formData.propertyCategory);
      data.append("propertySubCategory", formData.propertySubCategory);
      data.append("country", formData.country);
      data.append("state", formData.state);
      data.append("city", formData.city);
      data.append("documentType", formData.documentType);
      data.append("condition", formData.condition);
      data.append("salesType", formData.salesType);
      data.append("location", formData.location || "");
      data.append("status", formData.status || "");
      data.append("parkingspace", String(formData.parkingspace));
      data.append("managed_by_us", formData.managedByUs ? "1" : "0");

      // 3) Append each image under a unique key, e.g. 'images[]'
      let thumbnailFileName = "";

      formData.images.forEach((uri) => {
        const fileName = uri.split("/").pop();

        if (uri === formData.thumbnail) {
          thumbnailFileName = fileName; // ✅ This is the real filename
        }

        data.append("images[]", {
          uri,
          name: fileName,
          type: "image/jpeg",
        });
      });

      const thumbnailIndex = formData.images.findIndex(
        (uri) => uri === formData.thumbnail,
      );
      data.append("thumbnailIndex", thumbnailIndex);

      const token = await AsyncStorage.getItem("authToken");
      const userJson = await AsyncStorage.getItem("authUser");
      if (!token || !userJson) {
        console.log("Error", "Not authenticated");
        return;
      }
      const user = JSON.parse(userJson);
      const userId = user.id;

      // 2) Append user_id to FormData
      data.append("user_id", String(userId));

      // 4) Fire the fetch request with multipart/form-data
      const response = await fetch(
        "https://insighthub.com.ng/NestifyAPI/create_property.php",
        {
          method: "POST",
          headers: {
            // "Content-Type": "multipart/form-data",
            Authorization: `Token ${token}`,
          },
          body: data,
        },
      );

      const result = await response.json();
      if (response.ok && result.status === "success") {
        setSuccess(true);
        setError(null);
        setLoading(false);
        console.log("Property ID:", result.id);
        console.log("Property created successfully:", result.uploadedImages);
      } else {
        setError(result.msg || "Failed to create property");
        setSuccess(false);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setSuccess(false);
      setLoading(false);
    }
  };

  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const userJson = await AsyncStorage.getItem("authUser");
      if (!token || !userJson) {
        console.log("Error", "Not authenticated");
        return;
      }
      const userObj = JSON.parse(userJson);
      setUser(userObj);
      console.log("User data:", userObj);
      // Only show pricing modal if user plan is not premium
      if (userObj.planType !== "premium") {
        setPricingVisible(true);
      } else {
        setPricingVisible(false);
      }
    };
    checkAuth();
  }, []);

  //   // Function to handle form submission
  //   const handleSubmit = () => {
  // console.log('Form submitted with data:', formData);
  //     setTimeout(() => {
  //       try {
  //         // Simulate random error for demo purposes
  //         if (Math.random() > 0.7) {
  //           throw new Error("Network error");
  //         }
  //         setSuccess(true);
  //         setError(null);
  //         // Here you would navigate to a success screen or dashboard
  //       } catch (err) {
  //         setError(err.message);
  //         setSuccess(false);
  //       }
  //     }, 1000);
  //   };

  const pickImage = async () => {
    const maxImages = user.planType === "premium" ? 15 : 2;

    if (formData.images.length >= maxImages) {
      Alert.alert(
        "Upgrade Required",
        `Your current plan only allows ${maxImages} images. Upgrade to premium to add more.`,
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: maxImages - formData.images.length,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map((asset) => asset.uri);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...selectedImages],
      }));
    }
  };

  // Function to remove an image
  const removeImage = (index) => {
    const removed = formData.images[index];
    const newImages = [...formData.images];
    newImages.splice(index, 1);

    setFormData({
      ...formData,
      images: newImages,
      thumbnail: formData.thumbnail === removed ? null : formData.thumbnail,
    });
  };

  // Function to increment or decrement property features
  const updateFeatureCount = (feature, increment) => {
    const currentValue = formData[feature] || 0;
    const newValue = increment
      ? currentValue + 1
      : Math.max(0, currentValue - 1);

    handleChange(feature, newValue);
  };

  // Define the steps of the form
  const steps = [
    {
      title: "Fill detail of your real estate",
      render: () => (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginBottom: 100 }}
          >
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>
                Hi {user ? user.name : ""}, Fill detail of your{" "}
                <Text style={styles.highlight}>real estate</Text>
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.formField}>
                  <TextInput
                    style={styles.input}
                    value={formData.propertyName}
                    onChangeText={(text) => handleChange("propertyName", text)}
                    placeholder="Property title with short description"
                  />
                  <Icon
                    name="home"
                    size={24}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                </View>

                <Text style={styles.label}>Property Category</Text>

                <DropDownPicker
                  listMode="SCROLLVIEW"
                  open={openCategory}
                  value={categoryValue}
                  items={categoryItems}
                  setOpen={setOpenCategory}
                  setValue={setCategoryValue}
                  setItems={setCategoryItems}
                  placeholder="Select Property Type"
                  zIndex={3000}
                  onChangeValue={(val) => {
                    handleChange("propertyCategory", val);
                  }}
                />

                {/* Subcategory */}
                {subItems.length > 0 && (
                  <>
                    <Text style={styles.label}>Subcategory</Text>

                    <DropDownPicker
                      listMode="SCROLLVIEW"
                      open={openSub}
                      value={subValue}
                      items={subItems}
                      setOpen={setOpenSub}
                      setValue={setSubValue}
                      setItems={setSubItems}
                      placeholder="Select Subcategory"
                      zIndex={2000}
                      onChangeValue={(val) => {
                        handleChange("propertySubCategory", val);
                      }}
                    />
                  </>
                )}

                <Text style={styles.sectionTitle}>Listing type</Text>
                <View style={styles.toggleContainer}>
                  {["Rent", "Sell", "Both"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.toggleButton,
                        formData.listingType === type &&
                          styles.toggleButtonActive,
                      ]}
                      onPress={() => handleChange("listingType", type)}
                    >
                      <Text
                        style={
                          formData.listingType === type
                            ? styles.toggleTextActive
                            : styles.toggleText
                        }
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {(formData.listingType === "Sell" ||
                  formData.listingType === "Both") && (
                  <>
                    <Text style={styles.sectionTitle}>Sell Price</Text>
                    <View style={styles.priceInputContainer}>
                      <TextInput
                        style={styles.priceInput}
                        value={formData.sellPrice}
                        onChangeText={(text) => handleChange("sellPrice", text)}
                        keyboardType="numeric"
                        placeholder="Enter Sell Price"
                      />
                      <Text style={styles.currencyLabel}>N</Text>
                    </View>
                  </>
                )}

                {(formData.listingType === "Rent" ||
                  formData.listingType === "Both") && (
                  <>
                    <Text
                      style={{
                        marginTop: 2,
                        marginBottom: 8,
                        fontSize: 16,
                        color: "#4B5563",
                        fontWeight: "500",
                      }}
                    >
                      Rent Price
                    </Text>
                    <View style={styles.priceInputContainer}>
                      <TextInput
                        style={styles.priceInput}
                        value={formData.rentPrice}
                        onChangeText={(text) => handleChange("rentPrice", text)}
                        keyboardType="numeric"
                        placeholder="Enter Rent Price"
                      />
                      <Text style={styles.currencyLabel}>N</Text>
                    </View>
                  </>
                )}
              </View>

              <View style={styles.formField}>
                <TextInput
                  value={formData.description}
                  onChangeText={(text) => handleChange("description", text)}
                  placeholder="Enter full description"
                  multiline
                  numberOfLines={4} // Adjust the number of visible lines
                  style={[
                    styles.input,
                    { height: 100, textAlignVertical: "top" },
                  ]} // Custom styling
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ),
    },
    {
      title: "Add photos to your listing",
      render: () => (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>
            Add <Text style={styles.highlight}>photos</Text> to your listing
          </Text>

          <Text
            style={{
              marginTop: 4,
              marginBottom: 8,
              color: "#6B7280",
              fontSize: 14,
            }}
          >
            You can select upto{" "}
            {user ? (user.planType === "premium" ? 15 : 2) : ""} images
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
              marginTop: 4,
            }}
          >
            <Text style={{ color: "blue", fontSize: 14 }}>
              {user
                ? user.planType === "freemium"
                  ? "Upgrade to Premium to upload more images "
                  : ""
                : ""}
            </Text>

            <TouchableOpacity style={{ marginLeft: 4 }}>
              <Icon name="info" size={22} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {formData.images.length > 1 && (
            <Text style={{ marginTop: 4, color: "orange", fontSize: 14 }}>
              Click on an image to set as main thumbnail
            </Text>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.imageGrid}>
              {formData.images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setFormData({ ...formData, thumbnail: image });
                    }}
                  >
                    <Image source={{ uri: image }} style={styles.image} />
                    {formData.thumbnail === image && (
                      <View style={styles.thumbnailBadge}>
                        <Text style={styles.thumbnailText}>Main</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {formData.images.length < 10 && (
                <TouchableOpacity
                  style={styles.addImageBtn}
                  onPress={pickImage}
                >
                  <Text style={styles.addImageText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      ),
    },
    {
      title: "Where is the location?",
      render: () => (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <SafeAreaProvider style={styles.stepContainer}>
              <Text style={styles.stepTitle}>
                Where is the <Text style={styles.highlight}>location</Text>?
              </Text>

              <View style={{ padding: 16 }}>
                <Text style={{ marginBottom: 8 }}>Select State</Text>
                <DropDownPicker
                  open={openState}
                  value={state}
                  items={stateItems}
                  setOpen={setOpenState}
                  listMode="SCROLLVIEW"
                  setValue={(callback) => {
                    const value =
                      typeof callback === "function"
                        ? callback(state)
                        : callback;
                    setState(value);
                    const selected = stateItems.find(
                      (item) => item.value === value,
                    );
                    handleChange("state", selected ? selected.label : value);
                  }}
                  setItems={setStateItems}
                  placeholder="Select a state"
                  searchable={true}
                  zIndex={2000}
                  zIndexInverse={2000}
                  dropDownContainerStyle={{
                    maxHeight: 300,
                  }}
                />

                <Text style={{ marginTop: 20, marginBottom: 1 }}>
                  Select City{" "}
                </Text>
                <DropDownPicker
                  open={openCity}
                  value={city}
                  items={cityItems}
                  setOpen={setOpenCity}
                  listMode="SCROLLVIEW"
                  setValue={(callback) => {
                    const value =
                      typeof callback === "function"
                        ? callback(city)
                        : callback;
                    setCity(value);
                    const selected = cityItems.find(
                      (item) => item.value === value,
                    );
                    handleChange("city", selected ? selected.label : value);
                  }}
                  setItems={setCityItems}
                  placeholder="Select City"
                  searchable={true}
                  zIndex={1000}
                  zIndexInverse={3000}
                />
              </View>

              <View style={styles.formField}>
                <Text style={{ marginTop: 5, marginBottom: 5, marginLeft: 12 }}>
                  Enter Landmark / Area
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#FFFFFF",
                    padding: 15,
                    borderRadius: 5,
                    paddingLeft: 5,
                    marginHorizontal: 14,
                    borderColor: "#555",
                    borderWidth: 1,
                  }}
                  value={formData.location}
                  onChangeText={(text) => handleChange("location", text)}
                  placeholder="Landmark / Area"
                />
              </View>
            </SafeAreaProvider>
          </ScrollView>
        </KeyboardAvoidingView>
      ),
    },
    {
      title: "Complete the listing",
      render: () => (
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              Almost <Text style={styles.highlight}>finish</Text>, complete the
              listing
            </Text>

            <Text style={{ ...styles.label, marginTop: 16 }}>
              Property Size
            </Text>

            <TextInput
              style={{
                backgroundColor: "#FFFFFF",
                padding: 15,
                borderRadius: 5,
                paddingLeft: 5,
                marginHorizontal: 3,
                borderWidth: 1,
              }}
              value={formData.size}
              onChangeText={(text) => handleChange("size", text)}
              placeholder="Optional, e.g. 120 sqm"
            />

            {!isLandCategory && (
              <>
                {/* Furnishing */}
                <Text style={styles.sectionTitle}>Furnishing</Text>

                <View style={styles.categoryContainer}>
                  {[
                    "Furnished",
                    "Unfurnished",
                    "Fully Furnished",
                    "Semi Furnished",
                  ].map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        formData.Furnishing === category &&
                          styles.categoryButtonActive,
                      ]}
                      onPress={() => handleChange("Furnishing", category)}
                    >
                      <Text
                        style={
                          formData.Furnishing === category
                            ? styles.categoryTextActive
                            : styles.categoryText
                        }
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Condition */}
                <Text style={{ ...styles.label, marginTop: 16 }}>
                  Property Condition
                </Text>

                <DropDownPicker
                  listMode="SCROLLVIEW"
                  open={openCondition}
                  value={conditionValue}
                  items={conditionItems}
                  setOpen={setOpenCondition}
                  setValue={setConditionValue}
                  setItems={setConditionItems}
                  placeholder="Select Condition"
                  zIndex={3000}
                  onChangeValue={(val) => {
                    handleConditionChange(val);
                  }}
                />
              </>
            )}

            <Text style={styles.label}>Document Type</Text>

            <DropDownPicker
              listMode="SCROLLVIEW"
              open={openDoc}
              value={docValue}
              items={docItems}
              setOpen={setOpenDoc}
              setValue={setDocValue}
              setItems={setDocItems}
              placeholder="Select Document Type"
              zIndex={4000}
              onChangeValue={(val) => {
                onValueChange(val);
              }}
            />

            <Text style={{ ...styles.label, marginTop: 16 }}>Sales Type</Text>

            <DropDownPicker
              listMode="SCROLLVIEW"
              open={openSales}
              value={salesValue}
              items={salesItems}
              setOpen={setOpenSales}
              setValue={setSalesValue}
              setItems={setSalesItems}
              placeholder="Select Sales Type"
              zIndex={2000}
              onChangeValue={(val) => {
                handleSalesTypeChange(val);
              }}
            />

            <Text style={{ ...styles.label, marginTop: 16 }}>Status</Text>

            <DropDownPicker
              listMode="SCROLLVIEW"
              open={openStatus}
              value={statusValue}
              items={statusItems}
              setOpen={setOpenStatus}
              setValue={setStatusValue}
              setItems={setStatusItems}
              placeholder="Select Status"
              zIndex={1000}
              onChangeValue={(val) => {
                handleStatusChange(val);
              }}
            />

            <Text style={styles.sectionTitle}>Property Features</Text>

            {["bedrooms", "Toilet", "balconies", "parkingspace", "BQ"].map(
              (feature) => {
                const label =
                  feature.charAt(0).toUpperCase() + feature.slice(1);
                return (
                  <View key={feature} style={styles.counterContainer}>
                    <Text style={styles.counterLabel}>{label}</Text>
                    <View style={styles.counterControls}>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => updateFeatureCount(feature, false)}
                      >
                        <Text style={styles.counterButtonText}>−</Text>
                      </TouchableOpacity>

                      <Text style={styles.counterValue}>
                        {formData[feature]}
                      </Text>

                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => updateFeatureCount(feature, true)}
                      >
                        <Text style={styles.counterButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              },
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 16,
                marginBottom: 16,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  handleChange("managedByUs", !formData.managedByUs)
                }
                style={{
                  width: 24,
                  height: 24,
                  borderWidth: 2,
                  borderColor: "#2563EB",
                  borderRadius: 4,
                  backgroundColor: formData.managedByUs ? "#2563EB" : "#FFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {formData.managedByUs && (
                  <Text style={{ color: "#FFF", fontWeight: "bold" }}>✓</Text>
                )}
              </TouchableOpacity>
              <Text style={{ marginLeft: 8 }}>
                Let Nestify handle this sale for 5% commission
              </Text>
            </View>
          </View>
        </ScrollView>
      ),
    },
  ];

  // Error modal
  const ErrorModal = () => (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={styles.modalTitle}>Aw snap, An Error Occurred</Text>
        <Text style={styles.modalText}>{error}</Text> {/* Show actual error */}
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setError(null)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retryButton} onPress={handleSubmit}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  // Success modal
  const SuccessModal = () => (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.successIcon}>
          <Text style={styles.successIconText}>✓</Text>
        </View>
        <Text style={styles.modalTitle}>Your listing is now published</Text>
        <Text style={styles.modalText}>
          Lorem ipsum dolor sit amet, consectetur.
        </Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setSuccess(false);
              router.push("../Publish");
            }}
          >
            <Text style={styles.closeButtonText}>Add More</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.finishButton}
            onPress={() => {
              setSuccess(false);
              router.push("../Profile");
            }}
          >
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Listing</Text>
      </View>

      {/* Current Step Content */}
      {steps[currentStep].render()}

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.backButtonCircle} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          {/* <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </Text> */}

          {loading && currentStep === steps.length - 1 ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <PricingModal
        visible={pricingVisible}
        onSelectPlan={(planKey) => {
          setPricingVisible(false);
          // navigate to your payment/upgrade flow, passing planKey
          // router.push(`./upgrade?plan=${planKey}`);
          switch (planKey) {
            case "freemium":
              setPricingVisible(false);
              break;
            case "single":
              router.push("/upgrade/single");
              break;
            case "monthly":
              router.push("/upgrade/monthly");
              break;
            case "semi":
              router.push("/upgrade/semiannual");
              break;
            case "annual":
              router.push("/upgrade/annual");
              break;
            default:
              router.push("/upgrade");
          }
        }}
        onClose={() => setPricingVisible(false)}
      />

      {/* Error Modal */}
      {error && <ErrorModal />}

      {/* Success Modal */}
      {success && <SuccessModal />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: getStatusBarHeight(),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1F2937",
  },
  highlight: {
    color: "#2563EB",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    position: "absolute",
    bottom: 0,
    height: 70,
    width: "100%",
  },
  backButtonCircle: {
    width: 26,
    height: 26,
    borderRadius: 23,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  nextButton: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
  },
  imageContainer: {
    width: "48%",
    aspectRatio: 1,
    margin: "1%",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  addImageBtn: {
    width: "48%",
    aspectRatio: 1,
    margin: "1%",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: {
    fontSize: 24,
    color: "#9CA3AF",
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginBottom: 16,
  },
  locationContainer2: {
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginBottom: 16,
  },
  locationText: {
    marginLeft: 8,
    color: "#4B5563",
    fontSize: 14,
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 16,
  },
  mapPlaceholder: {
    backgroundColor: "#F3F4F6",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholderText: {
    color: "#9CA3AF",
    fontSize: 16,
    marginBottom: 8,
  },
  mapInstructions: {
    color: "#6B7280",
    fontSize: 12,
  },
  inputContainer: {
    marginTop: 16,
  },
  formField: {
    marginBottom: 16,
    position: "relative",
    alignContent: "center",
  },
  input: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    paddingLeft: 40,
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    top: 12,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "500",
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#2563EB",
  },
  toggleText: {
    color: "#6B7280",
    fontWeight: "500",
  },
  toggleTextActive: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#EC4899",
  },
  categoryText: {
    color: "#6B7280",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  priceInputContainer: {
    position: "relative",
    marginBottom: 16,
  },
  priceInput: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
  },
  label: {
    marginTop: 16,
    marginBottom: 4,
    fontWeight: "bold",
    fontSize: 16,
    color: "#111827",
  },
  currencyLabel: {
    position: "absolute",
    right: 12,
    top: 12,
    color: "#6B7280",
    fontSize: 16,
  },
  counterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  counterLabel: {
    color: "#4B5563",
    fontSize: 16,
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  counterButtonText: {
    fontSize: 16,
    color: "#4B5563",
  },
  counterValue: {
    fontSize: 16,
    color: "#4B5563",
    paddingHorizontal: 12,
  },
  roomsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  roomButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  roomButtonActive: {
    backgroundColor: "#2563EB",
  },
  roomText: {
    color: "#6B7280",
    marginLeft: 4,
  },
  roomTextActive: {
    color: "#FFFFFF",
    marginLeft: 4,
  },
  facilitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  facilityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    marginBottom: 8,
  },
  facilityButtonActive: {
    backgroundColor: "#2563EB",
  },
  facilityText: {
    color: "#6B7280",
  },
  facilityTextActive: {
    color: "#FFFFFF",
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4B5563",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorIconText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundImage: "linear-gradient(to right, #3B82F6, #EC4899)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successIconText: {
    color: "#FFFFFF",
    fontSize: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: {
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
  },
  closeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#4B5563",
    fontWeight: "500",
  },
  retryButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  finishButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    alignItems: "center",
  },
  finishButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 14,
    color: "#333",
  },
  picker: {
    backgroundColor: "#F1F1F1",
    borderRadius: 10,
    marginBottom: 16,
  },
  thumbnailBadge: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  selectedText: {
    marginTop: 15,
    fontSize: 14,
    color: "#333",
  },
  thumbnailText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});

const pickerStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    color: "black",
    backgroundColor: "#fff",
    paddingRight: 30,
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    color: "black",
    backgroundColor: "#fff",
    paddingRight: 30,
    marginBottom: 10,
  },
  iconContainer: {
    top: 14,
    right: 10,
  },
};

export default index;
