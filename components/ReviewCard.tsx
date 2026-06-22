import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

interface Props {
  name: string;
  avatar: any;
  rating: number;
  comment: string;
  time: string;
  images?: any[];
}

const ReviewCard: React.FC<Props> = ({
  name,
  avatar,
  rating,
  comment,
  time,
  images,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <Image source={avatar} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          <View style={styles.ratingRow}>
            {[...Array(rating)].map((_, i) => (
              <MaterialIcons
                key={i}
                name="star"
                size={14}
                color={colors.buttonBackground}
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={[styles.comment, { color: colors.text }]}>{comment}</Text>
      {images && (
        <View style={styles.imagesRow}>
          {images.map((img, i) => (
            <Image key={i} source={img} style={styles.reviewImage} />
          ))}
        </View>
      )}
      <Text style={[styles.time, { color: colors.mutedText }]}>{time}</Text>
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  comment: {
    fontSize: 13,
    marginVertical: 8,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  reviewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  time: {
    fontSize: 11,
  },
});
