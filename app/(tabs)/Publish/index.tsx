import AsyncStorage from "@react-native-async-storage/async-storage";
import { City, Country, State } from "country-state-city";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useFocusEffect } from "expo-router";
import { useEffect, useState, useCallback } from "react";
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
import { MaterialIcons as Icon, Ionicons } from "@expo/vector-icons";
import { useToast } from "../../../components/Toast";
import PricingModal from "../../../components/PricingModal";
import PremiumLoader from "@/components/PremiumLoader";
import { Video } from 'expo-av';


// Add these constants above the component
const GOLD = "#C9A84C";
const NAVY = "#1C2B4A";
const LIGHT = "#F8F9FB";
const BLUE = "#2563EB";  // keep your existing blue for highlights

// Multi-step form component
const PublishProperty = () => {
  const { show } = useToast();
  // State to track the current step
  const [currentStep, setCurrentStep] = useState(0);

  const [pricingVisible, setPricingVisible] = useState(false);

  type FormDataType = {
    images: string[];
    thumbnail: string | null;
    propertyName: string;
    listingType: string;
    Furnishing: string;
    sellPrice: string;
    rentPrice: string;
    rentPeriod: string;
    bedrooms: number;
    Toilet: number;
    BQ: number;
    balconies: number;
    totalRooms: string;
    description: string;
    propertyCategory: string;
    propertySubCategory: string;
    country: string;
    state: string;
    city: string;
    size: string;
    status: string;
    documentType: string;
    condition: string;
    salesType: string;
    location: string;
    parkingspace: number;
    video: string | null;
    managedByUs: boolean;
    [key: string]: any; // Add index signature for dynamic property access

  };

  // State for form data
  const [formData, setFormData] = useState<FormDataType>({
    images: [],
    thumbnail: null,
    propertyName: "",
    listingType: "Sell", // or 'Rent'
    Furnishing: "Unfurnished", // or 'Furnished'
    sellPrice: "",
    rentPrice: "",
    rentPeriod: "Monthly", // or 'Yearly'
    bedrooms: 2,
    Toilet: 2,
    BQ: 1,
    balconies: 0,
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
    parkingspace: 1,
    managedByUs: false,
    video: null as string | null,
  });

  const [categories, setCategories] = useState<any[]>([]);

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
        show({
          type: "error",
          title: "Error",
          message: result.msg || "Failed to load categories",
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
      show({
        type: "error",
        title: "Error",
        message: errorMsg,
      });
    }
  };

  //  const [country, setCountry] = useState(null);
  const [country, setCountry] = useState("NG");
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(false);

  const [countryItems, setCountryItems] = useState<{ label: string, value: string }[]>([]);
  const [stateItems, setStateItems] = useState<{ label: string, value: string }[]>([]);
  const [cityItems, setCityItems] = useState<{ label: string, value: string }[]>([]);

  const [openState, setOpenState] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [selectedSalesType, setSelectedSalesType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const handleStatusChange = (value: string | null) => {
    setSelectedStatus(value);
    handleChange("status", value); // keep formData in sync
  };

  const router = useRouter();

  const [openCategory, setOpenCategory] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);
  const [categoryItems, setCategoryItems] = useState<{ label: string, value: string | number }[]>([]);

  const [openSub, setOpenSub] = useState(false);
  const [subValue, setSubValue] = useState(null);
  const [subItems, setSubItems] = useState<{ label: string, value: string | number }[]>([]);

  const [authLoaded, setAuthLoaded] = useState(false);


  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Validation functions
  const validateStep = (step: number): boolean => {
    const errors: { [key: string]: string } = {};
    const effectiveStep = user?.plan_type?.toLowerCase() === "premium" ? step : step === 3 ? 4 : step;

    switch (effectiveStep) {
      case 0: // Property Details
        if (!formData.propertyName.trim()) {
          errors.propertyName = "Property name is required";
        } else if (formData.propertyName.length < 10) {
          errors.propertyName = "Property name must be at least 10 characters";
        } else if (formData.propertyName.length > 100) {
          errors.propertyName = "Property name cannot exceed 100 characters";
        }

        if (!categoryValue) {
          errors.category = "Please select a property category";
        }

        if (!subValue && subItems.length > 0) {
          errors.subcategory = "Please select a subcategory";
        }

        if (!formData.description.trim()) {
          errors.description = "Description is required";
        } else if (formData.description.length < 30) {
          errors.description = "Description must be at least 30 characters";
        }

        if (formData.listingType === "Sell" || formData.listingType === "Both") {
          if (!formData.sellPrice.trim()) {
            errors.sellPrice = "Sell price is required";
          } else if (isNaN(Number(formData.sellPrice)) || Number(formData.sellPrice) <= 0) {
            errors.sellPrice = "Sell price must be a valid positive number";
          } else if (Number(formData.sellPrice) < 100000) {
            errors.sellPrice = "Sell price seems very low, please verify";
          } else if (Number(formData.sellPrice) > 1000000000) {
            errors.sellPrice = "Sell price seems very high, please verify";
          }
        }

        if (formData.listingType === "Rent" || formData.listingType === "Both") {
          if (!formData.rentPrice.trim()) {
            errors.rentPrice = "Rent price is required";
          } else if (isNaN(Number(formData.rentPrice)) || Number(formData.rentPrice) <= 0) {
            errors.rentPrice = "Rent price must be a valid positive number";
          } else if (Number(formData.rentPrice) < 5000) {
            errors.rentPrice = "Rent price seems very low, please verify";
          } else if (Number(formData.rentPrice) > 50000000) {
            errors.rentPrice = "Rent price seems very high, please verify";
          }
        }
        break;



      case 1: // Location
        if (!state) {
          errors.state = "Please select a state";
        }
        if (!city) {
          errors.city = "Please select a city";
        }
        if (!formData.location.trim()) {
          errors.location = "Please enter a landmark or area";
        } else if (formData.location.length < 3) {
          errors.location = "Landmark must be at least 3 characters";
        }
        break;

      case 2: // Photos
        if (formData.images.length === 0) {
          errors.images = "Please add at least 1 image";
        } else if (formData.images.length === 1 && !formData.thumbnail) {
          errors.thumbnail = "Please set a main image";
        } else if (formData.images.length > 1 && !formData.thumbnail) {
          errors.thumbnail = "Please select a main image as thumbnail";
        }
        break;

      case 4: // Complete Listing
        if (formData.size.trim() && (isNaN(Number(formData.size)) || Number(formData.size) <= 0)) {
          errors.size = "Size must be a valid positive number";
        }

        if (!isLandCategory) {
          if (!conditionValue) {
            errors.condition = "Please select property condition";
          }
        }

        if (!docValue) {
          errors.documentType = "Please select a document type";
        }

        if (!statusValue) {
          errors.status = "Please select a status";
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
      const selected = categories.find((c) => c.id === categoryValue);

      if (selected) {
        const subs = selected.subcategories.map((s: any) => ({
          label: s.name,
          value: s.id,
        }));

        setSubItems(subs);
      }
    } else {
      setSubItems([]);
    }

    setSubValue(null);
  }, [categoryValue, categories]);

  const onValueChange = (itemValue: string | null) => {
    setSelectedType(itemValue);
    handleChange("documentType", itemValue); // keep formData in sync
  };

  const handleConditionChange = (value: string | null) => {
    setCondition(value);
    handleChange("condition", value); // keep formData in sync
  };

  const handleSalesTypeChange = (value: string | null) => {
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Function to handle form field changes
  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Function to handle next step
  const handleNext = () => {
    if (!validateStep(currentStep)) {
      show({
        type: "warning",
        title: "Validation Error",
        message: "Please fix all errors before proceeding",
      });
      return;
    }

    if (currentStep === visibleSteps.length - 1) {
      handleSubmit();
    } else {
      setValidationErrors({});
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
      let thumbnailIndex = -1;

      formData.images.forEach((uri, index) => {
        const fileName = uri.split("/").pop() || `image_${index}.jpg`;

        if (uri === formData.thumbnail) {
          thumbnailIndex = index;
        }

        data.append("images[]", {
          uri,
          name: fileName,
          type: "image/jpeg",
        } as any);
      });

      if (thumbnailIndex !== -1) {
        data.append("thumbnailIndex", String(thumbnailIndex));
      }
      if (formData.video) {
        const videoName = formData.video.split("/").pop() || "property_video.mp4";

        data.append("video", {
          uri: formData.video,
          name: videoName,
          type: "video/mp4",
        } as any);
      }
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
      const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMsg);
      setSuccess(false);
      setLoading(false);
    }
  };

  const [user, setUser] = useState<{ id: string; name: string; plan_type: string; is_seller?: number } | null>(null);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const userJson = await AsyncStorage.getItem('authUser');

    if (!token || !userJson) {
      console.log("Error", "Not authenticated");
      return;
    }
    const userObj = JSON.parse(userJson);
    setUser(userObj);

    const planType = String(userObj.plan_type || "").toLowerCase();
    const isPremium = planType === "premium";
    setPricingVisible(!isPremium);

    setAuthLoaded(true);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Refresh user data whenever screen comes into focus (e.g., after payment)
  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [])
  );

  const pickVideo = async () => {
    if (!user) return;

    if (user.plan_type !== "premium") {
      show({
        type: "warning",
        title: "Premium Required",
        message: "Only premium users can upload videos.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setFormData((prev) => ({
        ...prev,
        video: result.assets[0].uri,
      }));
    }
  };

  const pickImage = async () => {
    if (!user) return; // Guard clause to ensure user is not null
    const maxImages = user.plan_type === "premium" ? 15 : 2;

    if (formData.images.length >= maxImages) {
      show({
        type: "warning",
        title: "Upgrade Required",
        message: `Your current plan only allows ${maxImages} images. Upgrade to premium to add more.`,
      });
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
  const removeImage = (index: number) => {
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
  const updateFeatureCount = (feature: string, increment: boolean) => {
    const currentValue = formData[feature] || 0;
    const newValue = increment
      ? currentValue + 1
      : Math.max(0, currentValue - 1);

    handleChange(feature, newValue);
  };

  // Define the steps of the form
  const steps = [
    {
      title: "Fill detail of your real estate property",
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
                {" "}
              </Text>


              <View style={styles.inputContainer}>
                <View style={styles.formField}>
                  <TextInput
                    style={[
                      styles.input,
                      validationErrors.propertyName && { borderColor: "#dc2626", borderWidth: 2 },
                    ]}
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
                {validationErrors.propertyName && (
                  <Text style={styles.errorText}>{validationErrors.propertyName}</Text>
                )}
                <Text style={styles.charCount}>
                  {formData.propertyName.length}/100 characters
                </Text>

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
                  style={validationErrors.category && { borderColor: "#dc2626", borderWidth: 2 }}
                  onChangeValue={(val) => {
                    handleChange("propertyCategory", val);
                  }}
                />
                {validationErrors.category && (
                  <Text style={styles.errorText}>{validationErrors.category}</Text>
                )}

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
                      style={validationErrors.subcategory && { borderColor: "#dc2626", borderWidth: 2 }}
                      onChangeValue={(val) => {
                        handleChange("propertySubCategory", val);
                      }}
                    />
                    {validationErrors.subcategory && (
                      <Text style={styles.errorText}>{validationErrors.subcategory}</Text>
                    )}
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
                          style={[
                            styles.priceInput,
                            validationErrors.sellPrice && { borderColor: "#dc2626", borderWidth: 2 },
                          ]}
                          value={formData.sellPrice}
                          onChangeText={(text) => handleChange("sellPrice", text)}
                          keyboardType="numeric"
                          placeholder="Enter Sell Price (eg. 5000000)"
                        />
                        <Text style={styles.currencyLabel}>N</Text>
                      </View>
                      {validationErrors.sellPrice && (
                        <Text style={styles.errorText}>{validationErrors.sellPrice}</Text>
                      )}
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
                          style={[
                            styles.priceInput,
                            validationErrors.rentPrice && { borderColor: "#dc2626", borderWidth: 2 },
                          ]}
                          value={formData.rentPrice}
                          onChangeText={(text) => handleChange("rentPrice", text)}
                          keyboardType="numeric"
                          placeholder="Enter Rent Price (eg. 1000000)"
                        />
                        <Text style={styles.currencyLabel}>N</Text>
                      </View>
                      {validationErrors.rentPrice && (
                        <Text style={styles.errorText}>{validationErrors.rentPrice}</Text>
                      )}
                    </>
                  )}
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Description</Text>
                <View
                  style={[
                    styles.textAreaWrapper,
                    validationErrors.description && { borderColor: "#dc2626", borderWidth: 2 },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#9ca3af"
                    style={styles.textAreaIcon}
                  />
                  <TextInput
                    value={formData.description}
                    onChangeText={(text) => handleChange("description", text)}
                    placeholder="Enter full description..."
                    placeholderTextColor="#9ca3af"
                    multiline
                    textAlignVertical="top"
                    style={styles.textArea}
                  />
                </View>
                {validationErrors.description && (
                  <Text style={styles.errorText}>{validationErrors.description}</Text>
                )}
                <Text style={styles.charCount}>
                  {formData.description.length}/500 characters (min 30)
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ),
    },
    {
      title: "Where is the location?",
      render: () => (

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <SafeAreaProvider style={{
            flex: 1,
            padding: 10,
          }}>
            <Text style={styles.stepTitle}>
              Where is the <Text style={styles.highlight}>location</Text>?
            </Text>

            <View style={{ padding: 6 }}>
              <Text style={{ marginBottom: 8 }}>Select State</Text>
              <DropDownPicker
                open={openState}
                value={state}
                items={stateItems}
                setOpen={setOpenState}
                listMode="MODAL"
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
                style={validationErrors.state && { borderColor: "#dc2626", borderWidth: 2 }}
                dropDownContainerStyle={{
                  maxHeight: 500,
                }}
              />
              {validationErrors.state && (
                <Text style={styles.errorText}>{validationErrors.state}</Text>
              )}

              <Text style={{ marginTop: 20, marginBottom: 1 }}>
                Select City{" "}
              </Text>
              <DropDownPicker
                open={openCity}
                value={city}
                items={cityItems}
                setOpen={setOpenCity}
                listMode="MODAL"
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
                zIndex={1800}
                style={validationErrors.city && { borderColor: "#dc2626", borderWidth: 2 }}
                dropDownContainerStyle={{
                  maxHeight: 900,
                }}
              />
              {validationErrors.city && (
                <Text style={styles.errorText}>{validationErrors.city}</Text>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={{ marginTop: 5, marginBottom: 5, marginLeft: 12 }}>
                Enter Landmark / Area
              </Text>
              <TextInput
                style={[
                  {
                    backgroundColor: "#FFFFFF",
                    padding: 14,
                    borderRadius: 4,
                    paddingLeft: 5,
                    marginHorizontal: 10,
                    borderColor: "#555",
                    borderWidth: 1,
                  },
                  validationErrors.location && { borderColor: "#dc2626", borderWidth: 2 },
                ]}
                value={formData.location}
                onChangeText={(text) => handleChange("location", text)}
                placeholder="Landmark / Area"
              />
              {validationErrors.location && (
                <Text style={styles.errorText}>{validationErrors.location}</Text>
              )}
            </View>
          </SafeAreaProvider>
        </ScrollView>

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
            {user ? (user.plan_type === "premium" ? 15 : 2) : ""} images
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
                ? user.plan_type === "freemium"
                  ? "Upgrade to Premium to upload more images "
                  : ""
                : ""}
            </Text>

            <TouchableOpacity style={{ marginLeft: 4 }}>
              <Icon name="info" size={22} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {validationErrors.images && (
            <Text style={styles.errorText}>{validationErrors.images}</Text>
          )}
          {validationErrors.thumbnail && (
            <Text style={styles.errorText}>{validationErrors.thumbnail}</Text>
          )}

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
      title: "Add a video to your listing",
      render: () => (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>
            Add a <Text style={styles.highlight}>video</Text> to your listing
          </Text>

          <Text
            style={{
              marginTop: 4,
              marginBottom: 8,
              color: "#6B7280",
              fontSize: 14,
            }}
          >
            Only premium users can upload a video
          </Text>

          {formData.video ? (
            <View style={{ marginBottom: 16 }}>
              <Video
                source={{ uri: formData.video }}
                useNativeControls
                shouldPlay={false}
                style={{ width: "100%", height: 200, borderRadius: 8 }}
              />
              <TouchableOpacity
                style={styles.removeVideoBtn}
                onPress={() => setFormData({ ...formData, video: null })}
              >
                <Text style={styles.removeVideoText}>Remove Video</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.pickVideoBtn} onPress={pickVideo}>
              <Text style={styles.pickVideoText}>Pick a Video</Text>
            </TouchableOpacity>
          )}
        </View>
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
              style={[
                {
                  backgroundColor: "#FFFFFF",
                  padding: 15,
                  borderRadius: 5,
                  paddingLeft: 5,
                  marginHorizontal: 3,
                  borderWidth: 1,
                },
                validationErrors.size && { borderColor: "#dc2626", borderWidth: 2 },
              ]}
              value={formData.size}
              onChangeText={(text) => handleChange("size", text)}
              keyboardType="numeric"
              placeholder="Optional, e.g. 120 sqm"
            />
            {validationErrors.size && (
              <Text style={styles.errorText}>{validationErrors.size}</Text>
            )}

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
                  zIndex={3500}
                  style={validationErrors.condition && { borderColor: "#dc2626", borderWidth: 2 }}
                  onChangeValue={(val) => {
                    handleConditionChange(val);
                  }}
                />
                {validationErrors.condition && (
                  <Text style={styles.errorText}>{validationErrors.condition}</Text>
                )}
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
              zIndex={3000}
              style={validationErrors.documentType && { borderColor: "#dc2626", borderWidth: 2 }}
              onChangeValue={(val) => {
                onValueChange(val);
              }}
            />
            {validationErrors.documentType && (
              <Text style={styles.errorText}>{validationErrors.documentType}</Text>
            )}

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
              zIndex={2500}
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
              zIndex={2000}
              style={validationErrors.status && { borderColor: "#dc2626", borderWidth: 2 }}
              onChangeValue={(val) => {
                handleStatusChange(val);
              }}
            />
            {validationErrors.status && (
              <Text style={styles.errorText}>{validationErrors.status}</Text>
            )}

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
                  borderColor: "#374151",
                  borderRadius: 4,
                  backgroundColor: formData.managedByUs ? "#374151" : "#FFF",
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

  const visibleSteps = user?.plan_type?.toLowerCase() === "premium"
    ? steps
    : steps.filter((step) => step.title !== "Add a video to your listing");

  useEffect(() => {
    if (currentStep >= visibleSteps.length) {
      setCurrentStep(Math.max(0, visibleSteps.length - 1));
    }
  }, [visibleSteps.length]);

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
          Your Property has now been submitted for review.you can find it in your profile. We will review and publish it within 24 hours.
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

  const BecomeSellerUI = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: "#1A1A2E" }]}>
      <View style={styles.becomeSellerContainer}>
        <View style={styles.becomeSellerContent}>
          <Icon name="business" size={80} color={GOLD} />
          <Text style={styles.becomeSellerTitle}>Become a Seller</Text>
          <Text style={styles.becomeSellerSubtitle}>
            List properties and grow your business. Connect with buyers and manage your real estate portfolio.
          </Text>
          <TouchableOpacity
            style={styles.becomeSellerButton}
            onPress={() => router.push("../Publish/BecomeASeller")}
          >
            <Text style={styles.becomeSellerButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#1A1A2E" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  // Show loading while checking auth
  if (!authLoaded) {
    return (
      <PremiumLoader />
    );
  }

  if (!user || user.is_seller != 1) {
    return <BecomeSellerUI />;
  }

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
      {visibleSteps[currentStep].render()}

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.backButtonCircle} onPress={handleBack} disabled={loading}>
          <Icon name="arrow-back" size={24} color={loading ? "#ccc" : "#333"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            loading && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={loading}
          activeOpacity={loading ? 1 : 0.7}
        >
          {loading && currentStep === visibleSteps.length - 1 ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === visibleSteps.length - 1 ? "Finish" : "Next"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

            <PricingModal
       visible={pricingVisible}
       mode="seller"
       onClose={() => setPricingVisible(false)}
       onSelectPlan={(planKey) => {
     
         switch (planKey) {
     
           case "seller_monthly":
             router.push("../../../upgrade/payment?plan=seller_monthly");
             break;
     
           case "seller_semi":
             router.push("../../../upgrade/payment?plan=seller_semi");
             break;
     
           case "seller_annual":
             router.push("../../../upgrade/payment?plan=seller_annual");
             break;
         }
       }}
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
    backgroundColor: "#F8F9FB",   // was #FFFFFF
    paddingTop: getStatusBarHeight(),
    paddingBottom: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
    color: "#111",
    lineHeight: 30,
  },
  highlight: {
    color: GOLD,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    height: 72,
    width: "100%",
  },
  backButtonCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  nextButton: {
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nextButtonDisabled: {
    backgroundColor: "#9ca3af",
    opacity: 0.6,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
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
    borderRadius: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  addImageText: {
    fontSize: 28,
    color: GOLD,
    fontWeight: "300",
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
  thumbnailBadge: {
    position: "absolute",
    bottom: 7,
    left: 7,
    backgroundColor: GOLD,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  thumbnailText: {
    color: "#1A1A2E",
    fontSize: 10,
    fontWeight: "800",
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
    backgroundColor: "#fff",
    padding: 13,
    borderRadius: 12,
    paddingLeft: 42,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 14,
    color: "#111",
  },
  label: {
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 14,
    fontSize: 13,
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  textAreaWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',       // icon sits at top
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textAreaIcon: {
    marginRight: 10,
    marginTop: 2,                   // aligns icon with first line of text
  },
  textArea: {
    flex: 1,
    minHeight: 110,
    fontSize: 14,
    color: '#111827',
    lineHeight: 22,
    textAlignVertical: 'top',       // Android: text starts at top
    paddingTop: 0,                  // remove default Android padding
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
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  toggleButtonActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  toggleText: {
    color: "#888",
    fontWeight: "600",
    fontSize: 13,
  },
  toggleTextActive: {
    color: "#fff",
    fontWeight: "700",
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
    backgroundColor: "#fff",
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  categoryButtonActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  categoryText: {
    color: "#888",
    fontSize: 13,
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  priceInputContainer: {

    marginBottom: 16,
  },
  priceInput: {
    backgroundColor: "#fff",
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 14,
    color: "#111",
  },
  currencyLabel: {
    position: "absolute",
    right: 14,
    top: 13,
    color: GOLD,
    fontSize: 16,
    fontWeight: "700",
  },
  counterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
  },
  counterLabel: {
    color: "#111",
    fontSize: 14,
    fontWeight: "600",
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NAVY,
    justifyContent: "center",
    alignItems: "center",
  },
  counterButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
    lineHeight: 22,
  },
  counterValue: {
    fontSize: 16,
    color: "#111",
    fontWeight: "700",
    paddingHorizontal: 14,
    minWidth: 36,
    textAlign: "center",
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    width: "85%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#14532d",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successIconText: {
    color: GOLD,
    fontSize: 26,
    fontWeight: "800",
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7f1d1d",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorIconText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  finishButton: {
    flex: 1,
    padding: 13,
    borderRadius: 12,
    backgroundColor: NAVY,
    alignItems: "center",
  },
  retryButton: {
    flex: 1,
    padding: 13,
    borderRadius: 12,
    backgroundColor: NAVY,
    alignItems: "center",
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
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  finishButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
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
  becomeSellerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  becomeSellerContent: {
    alignItems: "center",
    backgroundColor: "#16213E",
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: GOLD + "44",
  },
  becomeSellerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  becomeSellerSubtitle: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  becomeSellerButton: {
    backgroundColor: GOLD,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  becomeSellerButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    fontWeight: "500",
  },
  charCount: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "right",
  },
  removeVideoBtn: {
    marginTop: 8,
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  removeVideoText: {
    color: "#fff",
    fontWeight: "500",
  },
  pickVideoBtn: {
    backgroundColor: NAVY,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  pickVideoText: {
    color: "#fff",
    fontWeight: "500",
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

export default PublishProperty;
