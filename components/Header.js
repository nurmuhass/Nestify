// components/Header.js
import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function Header() {

  const router = useRouter()

  const [user, setUser] = useState(null);

useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const userJson = await AsyncStorage.getItem('authUser');
      if (!token || !userJson) {
        console.log("Error", "Not authenticated");
        return;
      }
      const userObj = JSON.parse(userJson); 
      setUser(userObj); 
      console.log("User data:", userObj);
    };
    checkAuth();
  }, []);

  return (
    <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',zIndex: 40 }}>
<TouchableOpacity
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
    maxWidth: 180, // Set your desired max width here
    flexShrink: 1, // Allow shrinking if needed
    overflow: 'hidden', // Ensures content doesn't overflow
  }}
>
  <Ionicons name="location-outline" size={20} color="black" />
  <Text
    style={{
      marginLeft: 5,
      flexShrink: 1,
      numberOfLines: 1,
      ellipsizeMode: 'tail',
    }}
    numberOfLines={1}
    ellipsizeMode="tail"
  >
    {user ? user.city + ',' + user.state : ''}
  </Text>
  <AntDesign name="down" size={13} color="black" style={{ marginLeft: 15 }} />
</TouchableOpacity>

{/* <TouchableOpacity style={{ backgroundColor: '#fff', padding: 10, borderRadius: 22,borderWidth:1,borderColor:'#8BC83F' }} onPress={() => router.push('/search')}>
        <Ionicons name="search-outline" size={20} color="black" />
      </TouchableOpacity> */}

<TouchableOpacity style={{ backgroundColor: '#fff', padding: 10, borderRadius: 22,borderWidth:1,borderColor:'grey' }} onPress={() => router.push('/Home/Notifications')}>
           <Ionicons name="notifications-outline" size={20} color="black" />
</TouchableOpacity>

      <TouchableOpacity style={{ backgroundColor: '#fff', padding: 3, borderRadius: 22,borderWidth:1,borderColor:'grey'}}>
      
         

         {user && user.profileImage != null ? (
           <Image source={{ uri: user.profileImage }}  style={{ width: 40, height: 40, borderRadius: 20 }}/>
         ) : (
           <Image source={require('@/assets/images/andrew.jpg')}  style={{ width: 40, height: 40, borderRadius: 20 }} />
         )} 
      </TouchableOpacity>
    </View>
  );
}