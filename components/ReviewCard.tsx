import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface Props {
  name: string;
  avatar: any;
  rating: number;
  comment: string;
  time: string;
  images?: any[];
}

const ReviewCard: React.FC<Props> = ({ name, avatar, rating, comment, time, images }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={avatar} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.ratingRow}>
            {[...Array(rating)].map((_, i) => (
              <MaterialIcons key={i} name="star" size={14} color="#FFB800" />
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.comment}>{comment}</Text>
      {images && (
        <View style={styles.imagesRow}>
          {images.map((img, i) => (
            <Image key={i} source={img} style={styles.reviewImage} />
          ))}
        </View>
      )}
      <Text style={styles.time}>{time}</Text>
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F6F7FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
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
    color: '#333',
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
    color: '#888',
  },
});
