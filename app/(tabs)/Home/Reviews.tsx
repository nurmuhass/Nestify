import PropertySummaryCard from '@/components/PropertySummaryCard';
import RatingFilterBar from '@/components/RatingFilterBar';
import ReviewCard from '@/components/ReviewCard';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useTheme } from '@/context/ThemeContext';

const ReviewsScreen = () => {
  const [selectedRating, setSelectedRating] = useState('All');
  const { colors } = useTheme();

  return (
    <ScrollView style={{ backgroundColor: colors.background,paddingTop:getStatusBarHeight() }}>
    
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, height: 50 }}>
  <Ionicons name="arrow-back-circle-outline" size={29} color={colors.icon} style={{ marginLeft: 10 }} />
  
  <Text style={{
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
     fontWeight: "bold",
    fontSize: 22,
    color: colors.text
  }}>
    Reviews
  </Text>
</View>


      <PropertySummaryCard />
      <RatingFilterBar selected={selectedRating} onSelect={setSelectedRating} />

      <Text style={{ fontSize: 16, fontWeight: '600', marginHorizontal: 16, marginBottom: 8, color: colors.text }}>
        User reviews
      </Text>

      <ReviewCard
        name="Kurt Mullins"
        avatar={require('@/assets/images/amanda.jpg')}
        rating={5}
        comment="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
        time="10 mins ago"
      />

      <ReviewCard
        name="Samuel Ella"
        avatar={require('@/assets/images/anderson.jpg')}
        rating={5}
        comment="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
        time="10 mins ago"
        images={[
          require('@/assets/images/nearby1.jpg'),
          require('@/assets/images/nearby2.jpg'),
          require('@/assets/images/nearby3.jpg'),
        ]}
      />

      <ReviewCard
        name="Kay Swanson"
        avatar={require('@/assets/images/andrew.jpg')}
        rating={5}
        comment="Sed ut perspiciatis unde omnis iste natus error..."
        time="15 mins ago"
      />
    </ScrollView>
  );
};

export default ReviewsScreen;
