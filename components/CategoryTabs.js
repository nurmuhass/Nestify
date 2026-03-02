import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

export default function CategoryTabs() {
  const tabs = ['All', 'For Rent', 'For sell', 'Land','Shortlet'];
  const [active, setActive] = useState('All');

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 10, marginBottom: 10 }}>
      {tabs.map(tab => (
        <TouchableOpacity key={tab} onPress={() => setActive(tab)} style={{ marginRight: 10, paddingVertical: 6, paddingHorizontal: 16, backgroundColor: active === tab ? '#007bff' : '#eee', borderRadius: 20 }}>
          <Text style={{ color: active === tab ? 'white' : 'black' }}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}