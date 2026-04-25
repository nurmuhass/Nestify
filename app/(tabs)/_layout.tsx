import { Tabs } from 'expo-router';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';

/* ─── Palette (matches the home screen) ─────────────────────── */
const NAVY = '#0f2044';
const GOLD = '#c9a84c';
const MUTED = '#8a8a9a';
const WHITE = '#ffffff';
const BG = '#ffffff';
const BORDER = '#f0ece6';

/* ─── Custom centre "+" button ───────────────────────────────── */
function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.addWrap}
    >
      <View style={styles.addBtn}>
        <Ionicons name="add" size={26} color={WHITE} />
      </View>
    </TouchableOpacity>
  );
}

/* ─── Layout ─────────────────────────────────────────────────── */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: NAVY,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.tabItem,
        // remove the default top border
        tabBarBackground: () => <View style={styles.tabBarBg} />,
      }}
    >
      {/* 1 ── Home */}
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

      {/* 2 ── Search */}
      <Tabs.Screen
        name="Search"
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <AntDesign
              name="search1"
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* 3 ── Publish (centre raised button) */}
      <Tabs.Screen
        name="Publish"
        options={{
          tabBarLabel: () => null,          // no label under the + button
          tabBarIcon: () => null,           // icon handled by tabBarButton
          tabBarButton: (props) => (
            <AddButton onPress={() => props.onPress?.()} />
          ),
        }}
      />

      {/* 4 ── Explore */}
      <Tabs.Screen
        name="Explore"
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="map-pin"
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* 5 ── Profile */}
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="user"
              size={21}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const TAB_HEIGHT = Platform.OS === 'ios' ? 82 : 64;

const styles = StyleSheet.create({
  tabBar: {
    height: TAB_HEIGHT,
    backgroundColor: BG,
    borderTopWidth: 0,
    borderTopColor: BORDER,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    // subtle shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    backgroundColor: BG,
  },

  tabItem: {
    paddingTop: 2,
  },

  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },

  /* Centre "+" button */
  addWrap: {
    // pull the button up above the tab bar
    top: -18,
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    // glow shadow
    ...Platform.select({
      ios: {
        shadowColor: NAVY,
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
