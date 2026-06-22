import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colorWithAlpha } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  user?: any;
  unreadCount?: number;
  propertiesCount?: number;
  companiesCount?: number;
};

const cleanText = (value: any) => {
  if (value === null || value === undefined) return '';

  return String(value).trim();
};

const firstNonEmpty = (...values: any[]) => {
  for (const value of values) {
    const cleaned = cleanText(value);

    if (cleaned.length > 0) {
      return cleaned;
    }
  }

  return '';
};

export default function HomeHeader({
  user,
  unreadCount = 0,
  propertiesCount = 0,
  companiesCount = 0,
}: Props) {
  const router = useRouter();
  const navigatingRef = useRef(false);
  const { colors } = useTheme();

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? 'Good morning,'
      : hour < 17
        ? 'Good afternoon,'
        : 'Good evening,';

  const userDisplayName = useMemo(() => {
    return firstNonEmpty(
      user?.company_name,
      user?.companyName,
      user?.name,
      user?.full_name,
      user?.fullName,
      `${cleanText(user?.first_name)} ${cleanText(user?.last_name)}`,
      `${cleanText(user?.firstName)} ${cleanText(user?.lastName)}`,
      user?.email ? String(user.email).split('@')[0] : '',
      'Welcome back',
    );
  }, [user]);

  const nameParts = useMemo(() => {
    return userDisplayName
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
  }, [userDisplayName]);

  const firstName = useMemo(() => {
    if (nameParts.length <= 1) return userDisplayName;

    return nameParts.slice(0, -1).join(' ');
  }, [nameParts, userDisplayName]);

  const lastName = useMemo(() => {
    if (nameParts.length <= 1) return '';

    return nameParts[nameParts.length - 1];
  }, [nameParts]);

  const locationText = useMemo(() => {
    const city = firstNonEmpty(user?.city, 'Nigeria');
    const state = firstNonEmpty(user?.state, 'NG');

    return `${city}, ${state}`;
  }, [user]);

  const profileImage = useMemo(() => {
    return firstNonEmpty(
      user?.profile_image,
      user?.profileImage,
      user?.avatar,
      user?.image,
    );
  }, [user]);

  const avatarInitial = useMemo(() => {
    const source = firstNonEmpty(userDisplayName, user?.email, 'U');

    return source.charAt(0).toUpperCase();
  }, [userDisplayName, user]);

  const goToNotifications = useCallback(() => {
    if (navigatingRef.current) return;

    navigatingRef.current = true;

    router.push('/Home/Notifications');

    setTimeout(() => {
      navigatingRef.current = false;
    }, 700);
  }, [router]);

  const goToProfile = useCallback(() => {
    router.push('/(tabs)/Profile');
  }, [router]);

  return (
    <View style={[styles.hero, { backgroundColor: colors.cardBackground }]}>
      <View
        style={[
          styles.deco1,
          { backgroundColor: colorWithAlpha(colors.buttonBackground, 0.1) },
        ]}
      />
      <View
        style={[
          styles.deco2,
          { backgroundColor: colorWithAlpha(colors.buttonBackground, 0.06) },
        ]}
      />

      <View style={styles.topRow}>
        <View style={styles.locContainer}>
          <View
            style={[
              styles.locPill,
              {
                backgroundColor: colorWithAlpha(colors.text, 0.1),
                borderColor: colorWithAlpha(colors.text, 0.14),
              },
            ]}
          >
            <View
              style={[styles.locDot, { backgroundColor: colors.buttonBackground }]}
            />

            <Text
              style={[styles.locText, { color: colors.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {locationText}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[
              styles.bellButton,
              {
                backgroundColor: colorWithAlpha(colors.text, 0.08),
                borderColor: colorWithAlpha(colors.text, 0.12),
              },
            ]}
            onPress={goToNotifications}
            hitSlop={12}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.icon}
            />

            <View
              pointerEvents="none"
              style={[
                styles.bellDot,
                {
                  backgroundColor: colors.buttonBackground,
                  borderColor: colors.cardBackground,
                },
              ]}
            />

            {unreadCount > 0 && (
              <View
                pointerEvents="none"
                style={[styles.badge, { backgroundColor: colors.error }]}
              >
                <Text style={[styles.badgeText, { color: colors.background }]}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>

          <TouchableOpacity
            style={[
              styles.avatar,
              {
                backgroundColor: colorWithAlpha(colors.buttonBackground, 0.28),
                borderColor: colorWithAlpha(colors.buttonBackground, 0.4),
              },
            ]}
            onPress={goToProfile}
            activeOpacity={0.75}
            hitSlop={10}
          >
            {profileImage ? (
              <Image
                source={{
                  uri: profileImage,
                }}
                style={styles.avatarImg}
              />
            ) : (
              <Text
                style={[
                  styles.avatarInitial,
                  { color: colors.warning },
                ]}
              >
                {avatarInitial}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.greeting}>
        <Text style={[styles.hey, { color: colors.mutedText }]}>{greeting}</Text>

        <Text style={[styles.name, { color: colors.text }]}>
          {firstName}

          {lastName ? (
            <>
              {'\n'}

              <Text style={{ color: colors.warning }}>{lastName}!</Text>
            </>
          ) : (
            '!'
          )}
        </Text>

        <Text style={[styles.tagline, { color: colors.mutedText }]}>
          Your dream property awaits
        </Text>
      </View>

      <View style={styles.stats}>
        {[
          {
            val: propertiesCount > 0 ? `${propertiesCount}+` : '247+',
            lbl: 'Listings',
          },
          {
            val: companiesCount > 0 ? `${companiesCount}+` : '18+',
            lbl: 'Companies',
          },
          {
            val: '4.9\u2605',
            lbl: 'Rating',
          },
        ].map((s) => (
          <View
            key={s.lbl}
            style={[
              styles.statPill,
              {
                backgroundColor: colorWithAlpha(colors.text, 0.07),
                borderColor: colorWithAlpha(colors.text, 0.1),
              },
            ]}
          >
            <Text style={[styles.statVal, { color: colors.text }]}>{s.val}</Text>

            <Text style={[styles.statLbl, { color: colors.mutedText }]}>
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
  },

  deco2: {
    position: 'absolute',
    bottom: -40,
    left: -28,
    width: 130,
    height: 130,
    borderRadius: 65,
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
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: '100%',
  },

  locDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  locText: {
    fontSize: 12,
    flexShrink: 1,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },

  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
  },

  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 5,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
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
  },

  greeting: {
    zIndex: 2,
    marginBottom: 18,
  },

  hey: {
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 0.3,
    marginBottom: 3,
  },

  name: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: 0,
  },

  tagline: {
    fontSize: 11,
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
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },

  statVal: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },

  statLbl: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '300',
  },
});
