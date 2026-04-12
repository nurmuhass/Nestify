// components/Header.js
import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function Header() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // 🔐 Load user info
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const userJson = await AsyncStorage.getItem('authUser');

      if (!token || !userJson) {
        console.log("Not authenticated");
        return;
      }

      const userObj = JSON.parse(userJson);
      setUser(userObj);
    };

    checkAuth();
  }, []);

  // 🔔 Fetch notifications (only unread count)
const fetchNotifications = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');

    if (!token) {
      console.log("No token");
      return;
    }

    const res = await fetch(
      'https://insighthub.com.ng/NestifyAPI/get_notifications.php',
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    const result = await res.json();



    if (result.status === 'success') {
      const data = result.data ?? [];

      const unread = data.filter((n) => {
        return n.is_read == 0 || n.is_read === false || n.is_read === '0';
      }).length;

      setUnreadCount(unread);
    }
  } catch (e) {
    console.error('Notification fetch error:', e);
  }
};
  // 🔁 Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  // ⏱️ Auto refresh every 5 seconds (real-time feel)
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={{
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 40,
      }}
    >
      {/* Location */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          padding: 10,
          paddingHorizontal: 8,
          borderRadius: 20,
          maxWidth: 180,
          flexShrink: 1,
          overflow: 'hidden',
        }}
      >
        <Ionicons name="location-outline" size={20} color="black" />

        <Text
          style={{
            marginLeft: 5,
            flexShrink: 1,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {user ? `${user.city}, ${user.state}` : ''}
        </Text>

        <AntDesign
          name="down"
          size={13}
          color="black"
          style={{ marginLeft: 10 }}
        />
      </TouchableOpacity>

      {/* 🔔 Notification Button with Badge */}
      <View style={{ position: 'relative' }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: 'grey',
          }}
          onPress={() => router.push('/Home/Notifications')}
        >
          <Ionicons name="notifications-outline" size={20} color="black" />
        </TouchableOpacity>

        {/* 🔴 Badge */}
        {unreadCount > 0 && (
          <View
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: '#e11d48',
              borderRadius: 10,
              minWidth: 18,
              height: 18,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* 👤 Profile */}
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          padding: 3,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: 'grey',
        }}
      >
        {user && user.profileImage ? (
          <Image
            source={{ uri: user.profileImage }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <Image
            source={require('@/assets/images/andrew.jpg')}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}