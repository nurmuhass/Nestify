import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TextInput, TouchableOpacity, View } from 'react-native';



export default function SearchBar() {
  const router = useRouter();

  return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/Home/Properties/AllPropertiesScreen",
                })
              }  style={{ marginHorizontal: 5, marginBottom: 15, backgroundColor: '#f0f0f0', borderRadius: 10,
     flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 ,borderColor:'#25B4F8',borderWidth:1,paddingVertical:10}}
            >

         
      <Ionicons name="search" size={20} color="black" />
      <TextInput placeholder="Search House, Apartment, etc" style={{ marginLeft: 10, flex: 1 }} editable={false} />
    
       </TouchableOpacity>
  );
}