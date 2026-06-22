import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

const ratings = ['All', '1', '2', '3'];

interface Props {
  selected: string;
  onSelect: (rating: string) => void;
}

const RatingFilterBar: React.FC<Props> = ({ selected, onSelect }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {ratings.map((rate) => {
        const isActive = selected === rate;

        return (
          <TouchableOpacity
            key={rate}
            style={[
              styles.button,
              {
                backgroundColor: isActive
                  ? colors.buttonBackground
                  : colors.inputBackground,
              },
            ]}
            onPress={() => onSelect(rate)}
          >
            <Text
              style={[
                styles.text,
                { color: isActive ? colors.background : colors.text },
              ]}
            >
              {rate === 'All' ? '\u2b50 All' : `\u2b50 ${rate}`}
            </Text>
          </TouchableOpacity>
        );
      })}
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
  },
  text: {
    fontSize: 12,
  },
});
