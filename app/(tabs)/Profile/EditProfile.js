import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { City, State } from "country-state-city";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { AuthContext } from '../../../store';


const EditProfile = () => {
const router = useRouter();
  const [user, setUser] = useState(null);
const [name, setName] = useState('');
const [phone, setPhone] = useState('');
const [email, setEmail] = useState('');
const [profileImage, setProfileImage] = useState(null);
const { isLoggedIn,  signOut } = useContext(AuthContext);
const [country, setCountry] = useState('NG');
    const [state, setState] = useState(null);
  const [city, setCity] = useState(null);


  const [stateItems, setStateItems] = useState([]);
  const [cityItems, setCityItems] = useState([]);

  const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
  const [openState, setOpenState] = useState(false);
  const [openCity, setOpenCity] = useState(false);





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

useEffect(() => {
  const initializeProfile = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const userJson = await AsyncStorage.getItem('authUser');
    if (!token || !userJson) {
      console.log("Error", "Not authenticated");
      return;
    }

    const userObj = JSON.parse(userJson);
    setUser(userObj);
    setName(userObj.name || '');
    setPhone(userObj.phone || '');
    setEmail(userObj.email || '');
    setProfileImage(userObj.profileImage || null);

    // Load states first
    const allStates = State.getStatesOfCountry('NG');
    const mappedStates = allStates.map(s => ({
      label: s.name,
      value: s.isoCode,
    }));
    setStateItems(mappedStates);

    // Match state from user
    const foundState = allStates.find(
      s => s.name.toLowerCase() === userObj.state?.toLowerCase()
    );

    if (foundState) {
      setState(foundState.isoCode);

      // Load cities for that state
      const allCities = City.getCitiesOfState('NG', foundState.isoCode);
      const mappedCities = allCities.map(c => ({
        label: c.name,
        value: c.name,
      }));
      setCityItems(mappedCities);

      // Match city from user
      const foundCity = allCities.find(
        c => c.name.toLowerCase() === userObj.city?.toLowerCase()
      );
      if (foundCity) {
        setCity(foundCity.name);
      }
    }
  };

  initializeProfile();
}, []);

useEffect(() => {
  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const userJson = await AsyncStorage.getItem('authUser');
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

const handlePickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permission.granted === false) {
    alert("Permission to access gallery is required!");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaType,
    allowsEditing: true,
    quality: 0.5,
  });

  if (!result.canceled) {
    setProfileImage(result.assets[0].uri);
  }
};
const handleUpdateProfile = async () => {
  // 1) Validate required fields:

  setUpdating(true);
  if (!name.trim() || !email.trim() || !phone.trim()) {
    Alert.alert('Error', 'Name, email, and phone are required.');
    return;
  }
  // If image is compulsory:
  // if (!profileImage) {
  //   Alert.alert('Error', 'Please select a profile image.');
  //   return;
  // }

  // 2) Build FormData correctly
  const formData = new FormData();
  formData.append('name', name.trim());
  formData.append('email', email.trim());
  formData.append('phone', phone.trim());

  // For state: if you store ISO code in `state`, but backend expects name:
  // find the label from stateItems
  let stateValue = state;
  if (state && stateItems.length) {
    const found = stateItems.find(item => item.value === state);
    if (found) {
      stateValue = found.label; // pass the state name if your backend expects the name
    }
  }
  if (stateValue) {
    formData.append('state', stateValue);
  }

  // For city: assume `city` holds the city name already
  if (city) {
    formData.append('city', city);
  }

  // 3) Append image file
  // Extract filename from URI
  let uri = profileImage; // e.g. "file:///..."
  // Extract name:
  const segments = uri.split('/');
  const fileName = segments[segments.length - 1];
  // Guess mime type from extension:
  let match = /\.(\w+)$/.exec(fileName);
  let ext = match ? match[1].toLowerCase() : '';
  let mimeType = 'image/jpeg';
  if (ext === 'png') mimeType = 'image/png';
  else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
  // Append
  formData.append('profile_image', {
    uri,
    name: fileName,
    type: mimeType,
  });

  // 4) Fetch token
  const token = await AsyncStorage.getItem('authToken');
  if (!token) {
    Alert.alert('Error', 'Not authenticated.');
    return;
  }

  // 5) Send request
  try {
    console.log('Sending update-profile request...');
    const response = await fetch('https://insighthub.com.ng/NestifyAPI/update_profile.php', {
      method: 'POST',
      headers: {
        // Do NOT set 'Content-Type'; fetch sets it automatically for FormData
        'Authorization': `Token ${token}`, // or 'Bearer ' if your backend expects Bearer
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.log('Response not JSON:', text);
      Alert.alert('Error', 'Unexpected server response');
      return;
    }

    if (response.ok && result.status === 'success') {
      Alert.alert('Success', 'Profile updated successfully!');
      // Update AsyncStorage authUser with returned user data if provided
      if (result.user) {
        await AsyncStorage.setItem('authUser', JSON.stringify(result.user));
      }

      setUpdating(false);
    
  handleLogout(); // Log out after successful update
    } else {
        setUpdating(false);
      console.log('Update failed response:', result);
      Alert.alert('Update failed', result.msg || 'Unknown error');
    }
  } catch (err) {
      setUpdating(false);
    console.error('Error updating profile:', err);
    Alert.alert('Error', 'Network or server error');
  }
};


  const handleLogout = async () => {
  await signOut();
  // After clearing AsyncStorage, redirect to login:
  router.replace("../../(auth)/Login");
}


if (loading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007BFF" />
    </View>
  );
}

  return (                                              
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Edit Profile</Text>

<View style={{ position: 'relative', marginBottom: 20 }}>
  <Image
    source={profileImage ? { uri: profileImage } : require('@/assets/images/andrew.jpg')}
    style={styles.profileImage}
  />
  <TouchableOpacity onPress={handlePickImage} style={styles.penIcon}>
    <Ionicons name="pencil" size={20} color="white" />
  </TouchableOpacity>
</View>
 

      <View style={styles.inputWrapper}>
        <TextInput value={name} onChangeText={setName} style={styles.input} />
        <Ionicons name="person" size={20} color="#aaa" style={styles.icon} />
       
      </View>

      <View style={styles.inputWrapper}>
        <TextInput value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
        <Ionicons name="call" size={20} color="#aaa" style={styles.icon} />
      </View>

      <View style={styles.inputWrapper}>
        <TextInput value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
        <Ionicons name="mail" size={20} color="#aaa" style={styles.icon} />
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
    setState(value);
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
      <View style={styles.socialButtons}>
        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#4285F4' }]} onPress={handleLogout}>
         
          <Text style={styles.socialText}>Logout</Text>
          
        </TouchableOpacity>
      
      </View>

<TouchableOpacity style={styles.locationButton} onPress={handleUpdateProfile} disabled={updating}>
  <Text style={styles.locationText}>{updating ? 'Update Profile...' : ' Update Profile' }</Text>

  
</TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f2044', alignItems: 'center',paddingTop:getStatusBarHeight() },
  backButton: { alignSelf: 'flex-start', marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 20,borderColor: '#007BFF', borderWidth: 2 },
  inputWrapper: {
    width: '100%', marginBottom: 15, padding: 10, borderRadius: 10,
    backgroundColor: '#f5f6fa', flexDirection: 'row', alignItems: 'center'
  },
  input: { flex: 1, fontSize: 16 },
  icon: { marginLeft: 10 },
  socialButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginVertical: 20 },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#f0f0f0', flex: 1, justifyContent: 'center', marginHorizontal: 5,
  },
  socialText: { marginLeft: 10, fontWeight: '600', color: 'white' },
  locationButton: {
    backgroundColor: '#00bfff', padding: 15, width: '100%',
    borderRadius: 10, alignItems: 'center'
  },
  locationText: { color: '#fff', fontWeight: 'bold' },
  penIcon: {
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: '#00bfff',
  borderRadius: 15,
  padding: 4,
},
});

export default EditProfile;
