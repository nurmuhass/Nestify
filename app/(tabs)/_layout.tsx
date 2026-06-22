import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/context/ThemeContext';

function AddButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.addWrap}
    >
      <View
        style={[
          styles.addBtn,
          {
            backgroundColor: colors.buttonBackground,
            shadowColor: colors.buttonBackground,
          },
        ]}
      >
        <Ionicons name="add" size={26} color={colors.background} />
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.cardBackground,
            borderTopColor: colors.border,
            shadowColor: colors.shadow,
          },
        ],
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.tabItem,
        tabBarBackground: () => (
          <View
            style={[
              styles.tabBarBg,
              { backgroundColor: colors.cardBackground },
            ]}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Search"
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color }) => (
            <AntDesign name="search1" size={21} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Publish"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <AddButton onPress={() => (props.onPress as any)?.()} />
          ),
        }}
      />

      <Tabs.Screen
        name="Explore"
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => (
            <Feather name="map-pin" size={21} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={21} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const TAB_HEIGHT = Platform.OS === 'ios' ? 82 : 64;

const styles = StyleSheet.create({
  tabBar: {
    height: TAB_HEIGHT,
    borderTopWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  tabBarBg: {
    flex: 1,
  },

  tabItem: {
    paddingTop: 2,
  },

  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },

  addWrap: {
    top: -18,
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
