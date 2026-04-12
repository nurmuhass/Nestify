import { EvilIcons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { City, State } from "country-state-city";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { getStatusBarHeight } from "react-native-status-bar-height";
import Icon from "react-native-vector-icons/MaterialIcons";

const EditProperty = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [property, setProperty] = useState(null);
  const [user, setUser] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
const [previewVisible, setPreviewVisible] = useState(false);

const [categories, setCategories] = useState([]);

const [categoryValue, setCategoryValue] = useState(null);
const [categoryItems, setCategoryItems] = useState([]);

const [subValue, setSubValue] = useState(null);
const [subItems, setSubItems] = useState([]);

const [stateValue, setStateValue] = useState(null);
const [stateItems, setStateItems] = useState([]);

const [cityValue, setCityValue] = useState(null);
const [cityItems, setCityItems] = useState([]);

const [openCategory, setOpenCategory] = useState(false);
const [openSub, setOpenSub] = useState(false);
const [openState, setOpenState] = useState(false);
const [openCity, setOpenCity] = useState(false);
// Store raw property data separately so we can prefill dropdowns after items load
const [rawProperty, setRawProperty] = useState(null);

const fetchCategories = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");

    const res = await fetch(
      "https://insighthub.com.ng/NestifyAPI/get_categories_WithSubs.php",
      {
        headers: { Authorization: "Token " + token },
      }
    );

    const result = await res.json();

    if (result.status === "success") {
      setCategories(result.categories);

      const formatted = result.categories.map((cat) => ({
        label: cat.name,
        value: cat.id,
      }));

      setCategoryItems(formatted);
    }
  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  const states = State.getStatesOfCountry("NG").map((s) => ({
    label: s.name,
    value: s.isoCode,
  }));

  setStateItems(states);
}, []);

useEffect(() => {
  if (stateValue) {
    const cities = City.getCitiesOfState("NG", stateValue).map((c) => ({
      label: c.name,
      value: c.name,
    }));

    setCityItems(cities);
  }
}, [stateValue]);

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
  }
}, [categoryValue]);

// Document type
  const [openDoc, setOpenDoc] = useState(false);
  const [docValue, setDocValue] = useState(null);
  const [docItems, setDocItems] = useState([
    { label: "Certificate of Occupancy (C of O)", value: "Certificate of Occupancy (C of O)" },
    { label: "Right of Occupancy (R of O)", value: "Right of Occupancy (R of O)" },
    { label: "Deed of Assignment", value: "Deed of Assignment" },
    { label: "Governor’s Consent", value: "Governor’s Consent" },
    { label: "Registered Survey", value: "Registered Survey" },
    { label: "Excision", value: "Excision" },
    { label: "Gazette", value: "Gazette" },
    { label: "Others", value: "Others" },
  ]);

  // Condition
  const [openCondition, setOpenCondition] = useState(false);
  const [conditionValue, setConditionValue] = useState(null);
  const [conditionItems, setConditionItems] = useState([
    { label: "Newly Built", value: "Newly Built" },
    { label: "Renovated", value: "Renovated" },
    { label: "Needs Renovation", value: "Needs Renovation" },
    { label: "Old Building", value: "Old Building" },
    { label: "Fair Condition", value: "Fair Condition" },
    { label: "Under Construction", value: "Under Construction" },
  ]);

  // Sales type
  const [openSales, setOpenSales] = useState(false);
  const [salesValue, setSalesValue] = useState(null);
  const [salesItems, setSalesItems] = useState([
    { label: "Bonanza", value: "Bonanza" },
    { label: "Cash Back Sales", value: "Cash Back Sales" },
    { label: "Limited Offer", value: "Limited Offer" },
    { label: "Discount Promo", value: "Discount Promo" },
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

  // Furnishing
const [openFurnishing, setOpenFurnishing] = useState(false);
const [furnishingValue, setFurnishingValue] = useState(null);
const [furnishingItems, setFurnishingItems] = useState([
  { label: "Furnished", value: "Furnished" },
  { label: "Unfurnished", value: "Unfurnished" },
  { label: "Fully Furnished", value: "Fully Furnished" },
  { label: "Semi Furnished", value: "Semi Furnished" },
]);

useEffect(() => {
  fetchCategories();
}, []);

  const LAND_CATEGORY_IDS = [7, 12];

  const isLandCategory = LAND_CATEGORY_IDS.includes(Number(categoryValue));

  const [formData, setFormData] = useState({
    images: [],
    thumbnail: "",
    propertyName: "",
    listingType: "Sell",
    Furnishing: "Unfurnished",
    sellPrice: "",
    rentPrice: "",
    bedrooms: 0,
    Toilet: 0,
    BQ: 0,
    balconies: 0,
    totalRooms: "",
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
    parkingspace: 0,
    managedByUs: false,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* =========================
     FETCH PROPERTY
  ========================= */
useEffect(() => {
  const init = async () => {
    if (!id) return;
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");

      // Fetch both in parallel
      const [catRes, propRes] = await Promise.all([
        fetch("https://insighthub.com.ng/NestifyAPI/get_categories_WithSubs.php", {
          headers: { Authorization: "Token " + token },
        }),
        fetch(`https://insighthub.com.ng/NestifyAPI/get_property_by_id.php?id=${id}`, {
          headers: { Authorization: `Token ${token}` },
        }),
      ]);

      const [catResult, propResult] = await Promise.all([
        catRes.json(),
        propRes.json(),
      ]);

      // ── Categories ──
      if (catResult.status === "success") {
        setCategories(catResult.categories);

        const formatted = catResult.categories.map((cat) => ({
          label: cat.name,
          value: String(cat.id),
        }));
        setCategoryItems(formatted);

        // ── Property ──
        if (propResult.status === "success") {
          const p = propResult.property;
          setProperty(p);

          setFormData({
            propertyName: p.propertyName || "",
            listingType: p.listingType || "Sell",
            Furnishing: p.Furnishing || "Unfurnished",
            sellPrice: p.sellPrice || "",
            rentPrice: p.rentPrice || "",
            bedrooms: Number(p.bedrooms) || 0,
            Toilet: Number(p.Toilet) || 0,
            BQ: Number(p.BQ) || 0,
            balconies: Number(p.balconies) || 0,
            totalRooms: p.totalRooms || "",
            description: p.description || "",
            propertyCategory: p.propertyCategory || "",
            propertySubCategory: p.propertySubCategory || "",
            state: p.state || "",
            city: p.city || "",
            size: p.size || "",
            status: p.status || "",
            documentType: p.documentType || "",
            condition: p.condition || "",
            salesType: p.salesType || "",
            location: p.location || "",
            parkingspace: Number(p.parkingspace) || 0,
            managedByUs: p.managed_by_us == "1",
            images: p.images.map((img) => `https://insighthub.com.ng/${img}`),
            thumbnail: p.thumbnail ? `https://insighthub.com.ng/${p.thumbnail}` : "",
          });


          // Prefill documentType
if (p.documentType) {
  setDocValue(p.documentType);
}

// Prefill condition
if (p.condition) {
  setConditionValue(p.condition);
 
}

if (p.Furnishing) {
  setFurnishingValue(p.Furnishing);
}

// Prefill salesType
if (p.salesType) {
  setSalesValue(p.salesType);
  
}

// Prefill status
if (p.status) {
  setStatusValue(p.status);
}
          // ── Prefill Category (both available now) ──
          if (p.propertyCategory) {
            setCategoryValue(String(p.propertyCategory));

            // Derive subcategory items immediately
            const selectedCat = catResult.categories.find(
              (c) => String(c.id) === String(p.propertyCategory)
            );
            if (selectedCat) {
              const subs = selectedCat.subcategories.map((s) => ({
                label: s.name,
                value: String(s.id),
              }));
              setSubItems(subs);

              // Prefill subcategory
              if (p.propertySubCategory) {
                setSubValue(String(p.propertySubCategory));
              }
            }
          }

          // ── Prefill State ──
          if (p.state) {
            const stateObj = State.getStatesOfCountry("NG").find(
              (s) => s.name.toLowerCase() === p.state.toLowerCase()
            );
            if (stateObj) {
              setStateValue(stateObj.isoCode);

              // Prefill City
              if (p.city) {
                const cities = City.getCitiesOfState("NG", stateObj.isoCode).map((c) => ({
                  label: c.name,
                  value: c.name,
                }));
                setCityItems(cities);

                const cityObj = cities.find(
                  (c) => c.value.toLowerCase() === p.city.toLowerCase()
                );
                if (cityObj) setCityValue(cityObj.value);
              }
            }
          }
        } else {
          Alert.alert("Error", propResult.msg || "Failed to load property");
        }
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  init();
}, [id]);

  useEffect(() => {
  const getUser = async () => {
    const userJson = await AsyncStorage.getItem("authUser");
    if (userJson) {
      setUser(JSON.parse(userJson));
      
    }
  };

  getUser();
}, []);


useEffect(() => {
  if (categoryValue && categories.length > 0) {
    const selected = categories.find((c) => String(c.id) === String(categoryValue));
    if (selected) {
      const subs = selected.subcategories.map((s) => ({
        label: s.name,
        value: String(s.id),
      }));
      setSubItems(subs);
    }
  }
}, [categoryValue, categories]); // ✅ categories added


const handleDelete = async () => {
  Alert.alert(
    "Delete Property",
    "Are you sure you want to delete this property?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);

            const token = await AsyncStorage.getItem("authToken");

            const response = await fetch(
              "https://insighthub.com.ng/NestifyAPI/delete_property.php",
              {
                method: "POST",
                headers: {
                  Authorization: `Token ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  propertyId: id,
                }),
              }
            );

            const result = await response.json();

            if (result.status === "success") {
              Alert.alert("Success", "Property deleted");
               router.back();
            } else {
              Alert.alert("Error", result.msg);
            }
          } catch (err) {
            Alert.alert("Error", err.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]
  );
};

  /* =========================
     IMAGE PICKER
  ========================= */
 // Prefill category once categoryItems are loaded
useEffect(() => {
  if (categoryItems.length > 0 && rawProperty?.propertyCategory) {
    setCategoryValue(Number(rawProperty.propertyCategory));
  }
}, [categoryItems, rawProperty]);

// Prefill subcategory once subItems are derived
useEffect(() => {
  if (subItems.length > 0 && rawProperty?.propertySubCategory) {
    setSubValue(Number(rawProperty.propertySubCategory));
  }
}, [subItems, rawProperty]);

// Prefill state once stateItems are loaded
useEffect(() => {
  if (stateItems.length > 0 && rawProperty?.state) {
    const stateObj = stateItems.find(
      (s) => s.label.toLowerCase() === rawProperty.state.toLowerCase()
    );
    if (stateObj) setStateValue(stateObj.value); // isoCode
  }
}, [stateItems, rawProperty]);

// Prefill city once cityItems are derived (driven by stateValue change)
useEffect(() => {
  if (cityItems.length > 0 && rawProperty?.city) {
    const cityObj = cityItems.find(
      (c) => c.value.toLowerCase() === rawProperty.city.toLowerCase()
    );
    if (cityObj) setCityValue(cityObj.value);
  }
}, [cityItems, rawProperty]);

  const pickImage = async () => {
  const maxImages = user?.planType === "premium" ? 15 : 2;

  if (formData.images.length >= maxImages) {
    Alert.alert(
      "Upgrade Required",
      `Your current plan allows only ${maxImages} images. Upgrade to premium to add more.`
    );
    return;
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    allowsMultipleSelection: true,
    quality: 1,
    selectionLimit: maxImages - formData.images.length,
  });

  if (!result.canceled) {
    const newImages = result.assets.map((a) => a.uri);

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  }
};

  /* =========================
     SUBMIT (UPDATE)
  ========================= */
const [deletedImages, setDeletedImages] = useState([]);

const removeImage = (index) => {
  const img = formData.images[index];

  // track deleted server images
  if (img.startsWith("http")) {
    setDeletedImages((prev) => [...prev, img]);
  }

  const newImages = [...formData.images];
  newImages.splice(index, 1);

  setFormData((prev) => ({
    ...prev,
    images: newImages,
  }));
};

const handleSubmit = async () => {
  try {
    setLoading(true);

    const data = new FormData();

    data.append("propertyId", id); // ✅ IMPORTANT CHANGE

    Object.keys(formData).forEach((key) => {
      if (key !== "images") {
        data.append(key, formData[key]);
      }
    });

    // Existing & new images
    formData.images.forEach((uri) => {
      if (uri.startsWith("http")) {
        data.append("existing_images[]", uri);
      } else {
        const fileName = uri.split("/").pop();

        data.append("new_images[]", {
          uri,
          name: fileName,
          type: "image/jpeg",
        });
      }
    });

 

    deletedImages.forEach((img) => {
  const fileName = img.split("/").pop();
  data.append("delete_images[]", fileName);
});

    const token = await AsyncStorage.getItem("authToken");

    const response = await fetch(
      "https://insighthub.com.ng/NestifyAPI/update_property.php",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: data,
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      Alert.alert("Success", "Property updated successfully");
      router.back();
    } else {
      Alert.alert("Error", result.msg);
    }
  } catch (err) {
    Alert.alert("Error", err.message);
  } finally {
    setLoading(false);
  }
};

  if (loading && !property) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>


    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 ,justifyContent: "space-between"}}>
 <Text style={styles.title}>Edit Property</Text>
  
 <TouchableOpacity onPress={handleDelete}>
  <EvilIcons name="trash" size={29} color="red" />
</TouchableOpacity>

    </View>
     

         <Text style={styles.sectionTitle}>Property Name</Text>
      <TextInput
        style={styles.input}
        value={formData.propertyName}
        onChangeText={(text) => handleChange("propertyName", text)}
        placeholder="Property Name"
      />

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

   

 <Text style={styles.sectionTitle}>Sell Price</Text>
      <TextInput
        style={styles.input}
        value={formData.sellPrice}
        onChangeText={(text) => handleChange("sellPrice", text)}
        placeholder="Sell Price"
      />

<Text style={styles.sectionTitle}>Rent Price</Text>
         <TextInput
        style={styles.input}
        value={formData.rentPrice}
        onChangeText={(text) => handleChange("rentPrice", text)}
        placeholder="Rent Price"
      />

      <Text style={styles.sectionTitle}>Category</Text>

<DropDownPicker
 listMode="SCROLLVIEW"
  open={openCategory}
  value={categoryValue}
  items={categoryItems}
  setOpen={setOpenCategory}
  setValue={setCategoryValue}
  setItems={setCategoryItems}
  placeholder="Select Category"
  zIndex={3000}
  onChangeValue={(val) => {
    handleChange("propertyCategory", val);
  }}
/>

{subItems.length > 0 && (
  <>
    <Text style={styles.sectionTitle}>Subcategory</Text>

    <DropDownPicker
     listMode="SCROLLVIEW"
      open={openSub}
      value={subValue}
      items={subItems}
      setOpen={setOpenSub}
      setValue={setSubValue}
      setItems={setSubItems}
      placeholder="Select Subcategory"
      zIndex={2900}
      onChangeValue={(val) => {
        handleChange("propertySubCategory", val);
      }}
    />
  </>
)}

<Text style={styles.sectionTitle}>State</Text>

<DropDownPicker
 listMode="SCROLLVIEW"
  open={openState}
  value={stateValue}
  items={stateItems}
  setOpen={setOpenState}
  setValue={(callback) => {
    const val =
      typeof callback === "function" ? callback(stateValue) : callback;

    setStateValue(val);

    const selected = stateItems.find((i) => i.value === val);
    handleChange("state", selected?.label);
  }}
  setItems={setStateItems}
  placeholder="Select State"
  searchable
  zIndex={2800}
/>
<Text style={styles.sectionTitle}>City</Text>

<DropDownPicker
 listMode="SCROLLVIEW"
  open={openCity}
  value={cityValue}
  items={cityItems}
  setOpen={setOpenCity}
  setValue={(callback) => {
    const val =
      typeof callback === "function" ? callback(cityValue) : callback;

    setCityValue(val);

    const selected = cityItems.find((i) => i.value === val);
    handleChange("city", selected?.label);
  }}
  setItems={setCityItems}
  placeholder="Select City"
  searchable
  zIndex={2700}
/>

<Text style={styles.sectionTitle}>Document Type</Text>

<DropDownPicker
  listMode="SCROLLVIEW"
  open={openDoc}
  value={docValue}
  items={docItems}
  setOpen={setOpenDoc}
  setValue={(callback) => {
    const val =
      typeof callback === "function" ? callback(docValue) : callback;

    setDocValue(val);
    handleChange("documentType", val);
  }}
  setItems={setDocItems}
  placeholder="Select Document Type"
  zIndex={2600}
/>

    {!isLandCategory && (
              <>
<Text style={styles.sectionTitle}>Furnishing</Text>

<DropDownPicker
  listMode="SCROLLVIEW"
  open={openFurnishing}
  value={furnishingValue}
  items={furnishingItems}
  setOpen={setOpenFurnishing}
  setValue={(callback) => {
    const val =
      typeof callback === "function"
        ? callback(furnishingValue)
        : callback;

    setFurnishingValue(val);
    handleChange("Furnishing", val);
  }}
  setItems={setFurnishingItems}
  placeholder="Select Furnishing"
  zIndex={2500}
/>

<Text style={styles.sectionTitle}>Condition</Text>

<DropDownPicker
  listMode="SCROLLVIEW"
  open={openCondition}
  value={conditionValue}
  items={conditionItems}
  setOpen={setOpenCondition}
  setValue={(callback) => {
    const val =
      typeof callback === "function"
        ? callback(conditionValue)
        : callback;

    setConditionValue(val);
    handleChange("condition", val);
  }}
  setItems={setConditionItems}
  placeholder="Select Condition"
  zIndex={2400}
/>

  </>
            )}
<Text style={styles.sectionTitle}>Sales Type</Text>

<DropDownPicker
  listMode="SCROLLVIEW"
  open={openSales}
  value={salesValue}
  items={salesItems}
  setOpen={setOpenSales}
  setValue={(callback) => {
    const val =
      typeof callback === "function"
        ? callback(salesValue)
        : callback;

    setSalesValue(val);
    handleChange("salesType", val);
  }}
  setItems={setSalesItems}
  placeholder="Select Sales Type"
  zIndex={2300}
/>

<Text style={styles.sectionTitle}>Status</Text>

<DropDownPicker
  listMode="SCROLLVIEW"
  open={openStatus}
  value={statusValue}
  items={statusItems}
  setOpen={setOpenStatus}
  setValue={(callback) => {
    const val =
      typeof callback === "function"
        ? callback(statusValue)
        : callback;

    setStatusValue(val);
    handleChange("status", val);
  }}
  setItems={setStatusItems}
  placeholder="Select Status"
  zIndex={1500}
/>

<Text style={styles.sectionTitle}>Location</Text>
      <TextInput
        style={styles.input}
        value={formData.location}
        onChangeText={(text) => handleChange("location", text)}
        placeholder="Location"
      />

      
<Text style={styles.sectionTitle}>Description</Text>
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


      {/* IMAGES */}   

<Text style={{ marginBottom: 6, color: "#6B7280" }}>
  You can upload up to{" "}
  {user ? (user.planType === "premium" ? 15 : 2) : ""} images
</Text>

{user?.planType !== "premium" && (
  <Text style={{ color: "orange", marginBottom: 10 }}>
    Upgrade to Premium to upload more images
  </Text>
)}

      <Text style={styles.sectionTitle}>Property Images</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {formData.images.map((img, i) => (
          <View key={i}>
           <TouchableOpacity
  onPress={() => {
    setPreviewImage(img);
    setPreviewVisible(true);
  }}
>
  <Image source={{ uri: img }} style={styles.image} />
</TouchableOpacity>
            <TouchableOpacity onPress={() => removeImage(i)}>
              <Text>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

<TouchableOpacity
  onPress={pickImage}
  style={[
    styles.btn,
    formData.images.length >= (user?.planType === "premium" ? 15 : 2) && {
      backgroundColor: "#9CA3AF",
    },
  ]}
  disabled={
    formData.images.length >= (user?.planType === "premium" ? 15 : 2)
  }
>
  <Text style={{ color: "#fff" }}>Add Image</Text>
</TouchableOpacity>

      <TouchableOpacity onPress={handleSubmit} style={{...styles.btn, marginBottom: 50}}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff" }}>Update Property</Text>
        )}
      </TouchableOpacity>


      {previewVisible && (
  <View style={styles.previewContainer}>
    <TouchableOpacity
      style={styles.previewClose}
      onPress={() => setPreviewVisible(false)}
    >
      <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
    </TouchableOpacity>

    <Image
      source={{ uri: previewImage }}
      style={styles.previewImage}
      resizeMode="contain"
    />
  </View>
)}
    </ScrollView>
  );
};



export default EditProperty;



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: getStatusBarHeight(),
    padding: 20,
    paddingBottom: 20,
    
  },
  title: {
    fontSize: 20,
   
    fontWeight: "bold",
    
  },
  input: {
    backgroundColor: "#eee",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  btn: {
    backgroundColor: "blue",
    padding: 15,
    marginTop: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    margin: 5,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
    formField: {
    marginBottom: 16,
    position: "relative",
    alignContent: "center",
  },
    sectionTitle: {
    marginTop: 4,
    marginBottom: 4,
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
  previewContainer: {
  position: "absolute",
  top: '60%',
  left: 0,
  right: 0,
  bottom: '10%',
  backgroundColor: "rgba(0,0,0,0.9)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 3999,
},

previewImage: {
  width: "100%",
  height: "90%",
  
},

previewClose: {
  position: "absolute",
  top: 50,
  right: 20,
  zIndex: 1000,
},
});