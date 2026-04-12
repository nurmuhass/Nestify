// parent
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import FeaturedEstates from '../../../components/FeaturedEstates';
import Header from '../../../components/Header';
import NearbyProperties from '../../../components/NearbyProperties';
import PromoSlider from '../../../components/PromoSlider';
import SearchBar from '../../../components/SearchBar';
import TopCompanies from '../../../components/TopCompanies';
import TopLocations from '../../../components/TopLocations';

const { width } = Dimensions.get('window');

const index = () => {

const { width } = Dimensions.get('window');
const [user, setUser] = useState(null);

useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const userJson = await AsyncStorage.getItem('authUser');
      if (!token || !userJson) {
        console.log("Error", "Not authenticated");
        return;
      }
      const userObj = JSON.parse(userJson); 
      setUser(userObj); 
      console.log("User data:", userObj);
    };
    checkAuth();
  }, []);

  return (
 <FlatList
  data={[]} // empty because header handles top content
  keyExtractor={(item, index) => index.toString()}
  showsVerticalScrollIndicator={false}
style={ styles.headerWrapper}
  ListHeaderComponent={
    <>
      <Header />

      <View style={styles.eclipse} />

      <View style={styles.content}>
        <Text style={styles.greeting}>
          Hey, <Text style={styles.username}>{user ? user.name : ''}!</Text>
        </Text>
        <Text style={styles.subtitle}>Let's start exploring</Text>
      </View>

      <SearchBar />
      <PromoSlider />
      <TopLocations />
      <FeaturedEstates />
      <TopCompanies />

      {/* 👇 IMPORTANT: keep NearbyProperties here */}
      <NearbyProperties />
    </>
  }

  ListFooterComponent={<View style={{ }} />}
/>
  )
}

export default index


const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#fff',
    padding: 10,
    position: 'relative',
    overflow: 'hidden',
    paddingTop:getStatusBarHeight()
  },
  eclipse: {
    position: 'absolute',
    top: -80,
    left: -100,
    width: width * 0.9,
    height: width * 0.8,
    borderRadius: width,
    backgroundColor: '#D8F1FD', // soft blue tint
    zIndex: 0,
  },
  content: {
    zIndex: 1,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    color: '#444',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#234F68',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginTop: 4,
  },
});


