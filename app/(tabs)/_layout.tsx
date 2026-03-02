import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#25B4F8',
          tabBarInactiveTintColor: '#648399',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}> 
      <Tabs.Screen
        name="Home"
        options={{
 tabBarLabel: '', // 👈 hides the title
          tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color={color}/>,
        }}
      />
      <Tabs.Screen
        name="Explore"
        options={{
           tabBarLabel: '', 
          tabBarIcon: ({ color }) => <AntDesign name="search1" size={24} color={color} />,
        }}
      />
            <Tabs.Screen
        name="Publish"
        options={{
         tabBarLabel: '', 
          tabBarIcon: ({ color }) => <Ionicons name="add-circle-sharp" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
      tabBarLabel: '', 
          tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
