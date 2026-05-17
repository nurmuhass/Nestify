import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  user?: any;
  unreadCount?: number;
  propertiesCount?: number;
  companiesCount?: number;
};

export default function HomeHeader({
  user,
  unreadCount = 0,
  propertiesCount = 0,
  companiesCount = 0,
}: Props) {
  const router = useRouter();

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? 'Good morning,'
      : hour < 17
        ? 'Good afternoon,'
        : 'Good evening,';

  const displayName =
    user?.company_name ??
    user?.name ??
    'Welcome back';

  const parts = displayName.trim().split(' ');

  const firstName =
    parts.slice(0, -1).join(' ') ||
    displayName;

  const lastName =
    parts.length > 1
      ? parts[parts.length - 1]
      : '';

  const locationText = `${user?.city ?? 'Nigeria'
    }, ${user?.state ?? 'NG'}`;

  return (
    <View style={styles.hero}>
      {/* Decorative blobs */}
      <View style={styles.deco1} />
      <View style={styles.deco2} />

      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.locContainer}>
          <View style={styles.locPill}>
            <View style={styles.locDot} />

            <Text
              style={styles.locText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {locationText}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          {/* Notifications */}
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              style={styles.bellWrap}
              onPress={() =>
                router.push('/Home/Notifications')
              }
            >
              <Ionicons
                name="notifications-outline"
                size={19}
                color="rgba(255,255,255,0.68)"
              />

              <View style={styles.bellDot} />
            </TouchableOpacity>

            {/* Badge */}
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99
                    ? '99+'
                    : unreadCount}
                </Text>
              </View>
            )}
          </View>

          {/* Avatar */}
          <TouchableOpacity
            style={styles.avatar}
            onPress={() =>
              router.push('/(tabs)/Profile')
            }
          >
            {user?.profileImage ? (
              <Image
                source={{
                  uri: user.profileImage,
                }}
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
        <Text style={styles.hey}>
          {greeting}
        </Text>

        <Text style={styles.name}>
          {firstName}

          {lastName ? (
            <>
              {'\n'}

              <Text style={styles.nameGold}>
                {lastName}!
              </Text>
            </>
          ) : (
            '!'
          )}
        </Text>

        <Text style={styles.tagline}>
          Your dream property awaits
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        {[
          {
            val:
              propertiesCount > 0
                ? `${propertiesCount}+`
                : '247+',

            lbl: 'Listings',
          },

          {
            val:
              companiesCount > 0
                ? `${companiesCount}+`
                : '18+',

            lbl: 'Companies',
          },

          {
            val: '4.9★',
            lbl: 'Rating',
          },
        ].map((s) => (
          <View
            key={s.lbl}
            style={styles.statPill}
          >
            <Text style={styles.statVal}>
              {s.val}
            </Text>

            <Text style={styles.statLbl}>
              {s.lbl}
            </Text>
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
    padding: 10,
    overflow: 'hidden',
  },

  deco1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor:
      'rgba(201,168,76,0.10)',
  },

  deco2: {
    position: 'absolute',
    bottom: -40,
    left: -28,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor:
      'rgba(201,168,76,0.06)',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    zIndex: 2,
  },

  locContainer: {
    flex: 1,
    marginRight: 100,
  },

  locPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor:
      'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.14)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: '100%',
  },

  locDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#c9a84c',
  },

  locText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    flexShrink: 1,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },

  bellWrap: {
    position: 'relative',
  },

  bellDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#c9a84c',
    borderWidth: 1.5,
    borderColor: '#0f2044',
  },

  badge: {
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
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor:
      'rgba(201,168,76,0.28)',
    borderWidth: 1.5,
    borderColor:
      'rgba(201,168,76,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  avatarImg: {
    width: '100%',
    height: '100%',
  },

  avatarInitial: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f0d98a',
  },

  greeting: {
    zIndex: 2,
    marginBottom: 18,
  },

  hey: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '300',
    letterSpacing: 0.3,
    marginBottom: 3,
  },

  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 30,
    letterSpacing: -0.3,
  },

  nameGold: {
    color: '#f0d98a',
  },

  tagline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 5,
    fontWeight: '300',
    letterSpacing: 0.5,
  },

  stats: {
    flexDirection: 'row',
    gap: 9,
    zIndex: 2,
  },

  statPill: {
    flex: 1,
    backgroundColor:
      'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.10)',
    borderRadius: 12,
    padding: 10,
  },

  statVal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 20,
  },

  statLbl: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 2,
    fontWeight: '300',
  },
});