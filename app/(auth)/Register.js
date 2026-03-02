// register.js
import { Entypo } from "@expo/vector-icons";
import { City, State } from "country-state-city";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { AuthContext } from "../../store";


export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSeller, setIsSeller] = useState(false);
const { signUp } = useContext(AuthContext);

const [country, setCountry] = useState('NG');
    const [state, setState] = useState(null);
  const [city, setCity] = useState(null);


  const [stateItems, setStateItems] = useState([]);
  const [cityItems, setCityItems] = useState([]);


  const [openState, setOpenState] = useState(false);
  const [openCity, setOpenCity] = useState(false);




  useEffect(() => {
  // Always use 'NG' for Nigeria
  const states = State.getStatesOfCountry('NG').map(s => ({
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
    const cities = City.getCitiesOfState('NG', state).map(c => ({
      label: c.name,
      value: c.name,
    }));
    setCityItems(cities);
    setCity(null);
  }
}, [state]);

  // Extra fields for seller
  const [CompanyName, setCompanyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");


  const [loading, setLoading] = useState(false);

const handleRegister = async () => {
  if (!name || !email || !phone || !password || !state || !city) {
    Alert.alert("Error", "Please fill all required fields");
    return;
  }

  // Find the full state name from stateItems
  const selectedState = stateItems.find(item => item.value === state);
  const stateName = selectedState ? selectedState.label : state;

  const form = { name, email, phone, password, isSeller, state: stateName, city };
  if (isSeller) {
    form.companyName = CompanyName;
    form.licenseNumber = licenseNumber;
  }

  setLoading(true);
const res = await signUp(form); 
  setLoading(false);
  if (res.error) {
    Alert.alert("Registration failed", res.error);
  } else {
    Alert.alert("Registration Successful");
        router.replace("/(tabs)/Home");
  }
};


// Add state for password visibility
const [showPassword, setShowPassword] = useState(false);


return (
    <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <TextInput
            style={styles.input}
            placeholder="Username"
            value={name}
            onChangeText={setName}
        />
        <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
        />
        <TextInput
            style={styles.input}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
        />

        {/* Password Field with Eye Icon */}
        <View style={{ position: "relative" }}>
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity
                style={{
                    position: "absolute",
                    right: 16,
                    top: 12,
                    zIndex: 1,
              
                }}
                onPress={() => setShowPassword((prev) => !prev)}
            >
               {showPassword ? <Entypo name="eye" size={22} color="black" /> : 
                <Entypo name="eye-with-line" size={22} color="black" />}
            </TouchableOpacity>
        </View>

<View style={{ padding: 5 ,}}>
    

<DropDownPicker
  open={openState}
  value={state}
  items={stateItems}
  setOpen={setOpenState}
  listMode="SCROLLVIEW"
  setValue={(callback) => {
    const value = typeof callback === 'function' ? callback(state) : callback;
    setState(value); // Store ISO code
  }}
  setItems={setStateItems}
  placeholder="Select a state"
  searchable={true}
  zIndex={2000}
  zIndexInverse={2000}
  dropDownContainerStyle={{
    maxHeight: 300, 
    maxWidth: '90%',
    marginHorizontal: 'auto',
  }}
/>

<Text style={{  marginBottom: 1 }}> </Text>
<DropDownPicker
  open={openCity}
  value={city}
  items={cityItems}
  setOpen={setOpenCity}
  listMode="SCROLLVIEW"
setValue={(callback) => {
  const value = typeof callback === 'function' ? callback(city) : callback;
  setCity(value);
}}
  setItems={setCityItems}
  placeholder="Select City"
  searchable={true}
  zIndex={1000}
  zIndexInverse={3000}
/>

    </View>

        <View style={styles.sellerRow}>
            <Text style={styles.label}>Register as Company/Agent</Text>
            <Switch value={isSeller} onValueChange={setIsSeller} />
        </View>

        {isSeller && (
            <>
                <TextInput
                    style={styles.input}
                    placeholder="Company Name"
                    value={CompanyName}
                    onChangeText={setCompanyName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="RC Number/NIN"
                    value={licenseNumber}
                    onChangeText={setLicenseNumber}
                />
            </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Registering..." : "Register"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace("./Login")}>
            <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
    </ScrollView>
);
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 12,
  },
  sellerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 12,
  },
  label: { fontSize: 16 },
  button: {
    backgroundColor: "#28a745", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  link: { color: "#007bff", textAlign: "center", marginTop: 12 },
});
