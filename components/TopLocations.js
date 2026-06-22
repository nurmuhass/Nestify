import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

const locations = [
  { name: 'Abuja', image: require('../assets/images/Abuja-City-Gate.jpg') },
  { name: 'Lagos', image: require('../assets/images/lagos.jpg') },
  { name: 'Rivers', image: require('../assets/images/rivers.jpg') },
    { name: 'Kano', image: require('../assets/images/kano.jpeg') },
];

export default function TopLocations() {
  const { colors } = useTheme();

  return (
    <View style={{ marginTop: 8, marginRight: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 ,color: colors.text}}>Top Locations</Text> 
        {/* <Text style={{ color: '#007bff' }}>explore</Text> */}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, paddingLeft: 20 }} contentContainerStyle={{ paddingRight: 20 }}>
        {locations.map((loc, index) => (
          <TouchableOpacity key={index} style={{ marginRight: 10, alignItems: 'center',padding: 8, borderRadius: 23, backgroundColor: colors.cardBackground,paddingRight:25,flexDirection:'row' }}>
            <Image source={loc.image} style={{ width: 40, height: 40, borderRadius: 30,marginRight:4 }} />
            <Text style={{ color: colors.text }}>{loc.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
