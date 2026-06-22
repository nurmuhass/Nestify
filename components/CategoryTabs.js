import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

export default function CategoryTabs() {
  const tabs = ['All', 'For Rent', 'For sell', 'Land', 'Shortlet'];
  const [active, setActive] = useState('All');
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ paddingHorizontal: 10, marginBottom: 10 }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab;

        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setActive(tab)}
            style={{
              marginRight: 10,
              paddingVertical: 6,
              paddingHorizontal: 16,
              backgroundColor: isActive
                ? colors.buttonBackground
                : colors.inputBackground,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: isActive ? colors.background : colors.text }}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
