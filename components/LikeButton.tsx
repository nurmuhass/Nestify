

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
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
  // 'full' = heart + count side by side (for detail page)
  // 'icon' = heart icon only, count below (for cards)
  // 'minimal' = just the heart, no count
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
  const { liked, likesCount, loading, toggleLike } = useLike(
    propertyId,
    initialLiked,
    initialCount
  );

  const handleToggle = async () => {
  await toggleLike();
  onToggle?.(); // ✅ call parent refresh
};

  if (variant === 'minimal') {
    return (
      <TouchableOpacity onPress={handleToggle} disabled={loading} style={styles.hitSlop}>
        {loading ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={size}
            color={liked ? color : '#aaa'}
          />
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'icon') {
    return (
      <TouchableOpacity onPress={handleToggle} disabled={loading} style={styles.iconVariant}>
        {loading ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={size}
            color={liked ? color : '#aaa'}
          />
        )}
        <Text style={[styles.countSmall, liked && { color }]}>{likesCount}</Text>
      </TouchableOpacity>
    );
  }

  // 'full' variant — used on details page
  return (
    <TouchableOpacity
      onPress={handleToggle}
      disabled={loading}
      style={[styles.fullBtn, liked && styles.fullBtnActive]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={liked ? '#fff' : color} />
      ) : (
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={size}
          color={liked ? '#fff' : color}
        />
      )}
      <Text style={[styles.fullText, liked && styles.fullTextActive]}>
        {likesCount} {liked ? 'Saved' : 'Save'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hitSlop: {
    padding: 6,
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
    borderRadius: 8,
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
    fontWeight: '600',
    color: '#e11d48',
  },
  fullTextActive: {
    color: '#fff',
  },
});
