import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeSearchBar() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.bar}
      activeOpacity={0.85}
       onPress={() =>
                router.push({
                  pathname: "/Home/Searchscreen",
                })
              }
    >
      <Ionicons name="search-outline" size={18} color="#8a8a9a" />
      <Text style={styles.placeholder}>Search house, apartment…</Text>
      <View style={styles.filterBtn}>
        <Ionicons name="options-outline" size={13} color="#fff" />
        <Text style={styles.filterText}>Filter</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e8e4dd',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    gap: 10,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  placeholder: {
    flex: 1, fontSize: 14,
    color: '#8a8a9a', fontWeight: '400',
  },
  filterBtn: {
    backgroundColor: '#0f2044',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: { fontSize: 11, color: '#fff', fontWeight: '500' },
});
