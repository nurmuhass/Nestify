import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useLike } from '../hooks/useLike';

interface Props {
  propertyId: number;
  initialLiked?: boolean;
  initialCount?: number;
  variant?: 'full' | 'icon' | 'minimal';
  onToggle?: () => void;
  size?: number;
  color?: string;
}

export default function LikeButton({
  propertyId,
  initialLiked = false,
  initialCount = 0,
  variant = 'full',
  size = 22,
  color = '#e11d48',
  onToggle,
}: Props) {
  const { liked, likesCount, toggleLike } = useLike(
    propertyId,
    initialLiked,
    initialCount
  );

  // ─────────────────────────────
  // ANIMATIONS
  // ─────────────────────────────
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (liked) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.35,
          friction: 3,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [liked]);

  const handleToggle = async () => {
    toggleLike();
    onToggle?.();
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.1],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  // ─────────────────────────────
  // MINIMAL
  // ─────────────────────────────
  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.8}
        style={styles.hitSlop}
      >
        <View style={styles.animWrap}>
          {/* Pulse */}
          {liked && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pulse,
                {
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                  backgroundColor: color,
                },
              ]}
            />
          )}

          {/* Heart */}
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
            }}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={size}
              color={liked ? color : '#cbd5e1'}
            />
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  }

  // ─────────────────────────────
  // ICON
  // ─────────────────────────────
  if (variant === 'icon') {
    return (
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.85}
        style={styles.iconVariant}
      >
        <View style={styles.animWrap}>
          {liked && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pulse,
                {
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                  backgroundColor: color,
                },
              ]}
            />
          )}

          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
            }}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={size}
              color={liked ? color : '#cbd5e1'}
            />
          </Animated.View>
        </View>

        <Text
          style={[
            styles.countSmall,
            liked && { color },
          ]}
        >
          {likesCount}
        </Text>
      </TouchableOpacity>
    );
  }

  // ─────────────────────────────
  // FULL BUTTON
  // ─────────────────────────────
  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.9}
      style={[
        styles.fullBtn,
        liked && styles.fullBtnActive,
      ]}
    >
      <View style={styles.animWrap}>
        {liked && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulse,
              {
                opacity: pulseOpacity,
                transform: [{ scale: pulseScale }],
                backgroundColor: '#fff',
              },
            ]}
          />
        )}

        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={size}
            color={liked ? '#fff' : color}
          />
        </Animated.View>
      </View>

      <Text
        style={[
          styles.fullText,
          liked && styles.fullTextActive,
        ]}
      >
        {likesCount} {liked ? 'Saved' : 'Save'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hitSlop: {
    padding: 6,
  },

  animWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  pulse: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 999,
  },

  iconVariant: {
    alignItems: 'center',
    gap: 2,
    padding: 4,
  },

  countSmall: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '600',
  },

  fullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e11d48',
    backgroundColor: '#fff',
  },

  fullBtnActive: {
    backgroundColor: '#e11d48',
    borderColor: '#e11d48',
  },

  fullText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e11d48',
  },

  fullTextActive: {
    color: '#fff',
  },
});