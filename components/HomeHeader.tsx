import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const BASE_URL = 'https://insighthub.com.ng/';

type Props = {
  propertiesCount?: number;
  companiesCount?: number;
};

export default function HomeHeader({ propertiesCount = 0, companiesCount = 0 }: Props) {
  const router = useRouter();

 const [user, setUser] = useState<any>(null);
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
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';

  const displayName = user?.company_name ?? user?.name ?? 'Welcome back';
  const parts     = displayName.trim().split(' ');
  const firstName = parts.slice(0, -1).join(' ') || displayName;
  const lastName  = parts.length > 1 ? parts[parts.length - 1] : '';

  return (
    <View style={styles.hero}>
      {/* Decorative blobs */}
      <View style={styles.deco1} />
      <View style={styles.deco2} />

      {/* Top row */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.locPill}>
          <View style={styles.locDot} />
          <Text style={styles.locText}>
            {user?.city ?? 'Nigeria'}, {user?.state ?? 'NG'}
          </Text>
          <Text style={styles.locCaret}>▾</Text>
        </TouchableOpacity>

        <View style={styles.actions}>

             {/* 🔔 Notification Button with Badge */}
      <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={styles.bellWrap}
            onPress={() => router.push('/Home/Notifications')}
          >
            <Ionicons name="notifications-outline" size={19} color="rgba(255,255,255,0.68)" />
            <View style={styles.bellDot} />
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

          <TouchableOpacity style={styles.avatar}>
            {user?.profileImage ? (
              <Image
              source={{ uri: user.profileImage }}
                style={styles.avatarImg}
              />
            ) : (
              <Text style={styles.avatarInitial}>
                {(displayName[0] ?? 'U').toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.hey}>{greeting}</Text>
        <Text style={styles.name}>
          {firstName}
          {lastName ? (
            <>
              {'\n'}
              <Text style={styles.nameGold}>{lastName}!</Text>
            </>
          ) : '!'}
        </Text>
        <Text style={styles.tagline}>Your dream property awaits</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        {[
          { val: propertiesCount > 0 ? `${propertiesCount}+` : '247+', lbl: 'Listings'   },
          { val: companiesCount  > 0 ? `${companiesCount}+`  : '18+',  lbl: 'Companies'  },
          { val: '4.9★',                                                 lbl: 'Rating'     },
        ].map((s) => (
          <View key={s.lbl} style={styles.statPill}>
            <Text style={styles.statVal}>{s.val}</Text>
            <Text style={styles.statLbl}>{s.lbl}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#0f2044',
    borderRadius: 24,
    padding: 22,
    overflow: 'hidden',
  },
  deco1: {
    position: 'absolute', top: -50, right: -50,
    width: 170, height: 170, borderRadius: 85,
    backgroundColor: 'rgba(201,168,76,0.10)',
  },
  deco2: {
    position: 'absolute', bottom: -40, left: -28,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(201,168,76,0.06)',
  },

  topRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 18, zIndex: 2,
  },
  locPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  locDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#c9a84c',
  },
  locText: { fontSize: 12, color: 'rgba(255,255,255,0.82)' },
  locCaret: { fontSize: 9, color: '#c9a84c', marginLeft: 2 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bellWrap: { position: 'relative' },
  bellDot: {
    position: 'absolute', top: -1, right: -1,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#c9a84c',
    borderWidth: 1.5, borderColor: '#0f2044',
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(201,168,76,0.28)',
    borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.4)',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitial: { fontSize: 15, fontWeight: '600', color: '#f0d98a' },

  greeting: { zIndex: 2, marginBottom: 18 },
  hey: {
    fontSize: 12, color: 'rgba(255,255,255,0.45)',
    fontWeight: '300', letterSpacing: 0.3, marginBottom: 3,
  },
  name: {
    fontSize: 26, fontWeight: '700', color: '#ffffff',
    lineHeight: 30, letterSpacing: -0.3,
  },
  nameGold: { color: '#f0d98a' },
  tagline: {
    fontSize: 11, color: 'rgba(255,255,255,0.35)',
    marginTop: 5, fontWeight: '300', letterSpacing: 0.5,
  },

  stats: { flexDirection: 'row', gap: 9, zIndex: 2 },
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 12, padding: 10,
  },
  statVal: { fontSize: 18, fontWeight: '700', color: '#fff', lineHeight: 20 },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 2, fontWeight: '300' },
});
