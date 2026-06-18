import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ratings = ['All', '1', '2', '3'];

interface Props {
  selected: string;
  onSelect: (rating: string) => void;
}

const RatingFilterBar: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      {ratings.map((rate) => (
        <TouchableOpacity
          key={rate}
          style={[styles.button, selected === rate && styles.active]}
          onPress={() => onSelect(rate)}
        >
          <Text style={[styles.text, selected === rate && styles.activeText]}>
            {rate === 'All' ? '⭐ All' : `⭐ ${rate}`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default RatingFilterBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
  },
  active: {
    backgroundColor: '#3C8AFF',
  },
  text: {
    fontSize: 12,
    color: '#333',
  },
  activeText: {
    color: '#fff',
  },
});
