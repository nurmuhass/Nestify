import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function registerPushToken() {
    try {

        console.log('START registerPushToken');

        // WEB
        if (Platform.OS === 'web') {
            console.log('Push notifications skipped on web');
            return null;
        }

        // REAL DEVICE
        if (!Device.isDevice) {
            // Alert.alert('Error', 'Must use physical device');
            return null;
        }

        // ANDROID CHANNEL
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#C9A84C',
            });
        }

        // PERMISSIONS
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } =
                await Notifications.requestPermissionsAsync();

            finalStatus = status;
        }

        console.log('Permission status:', finalStatus);

        if (finalStatus !== 'granted') {
            // Alert.alert(
            //     'Permission Required',
            //     'Notification permission not granted'
            // );

            return null;
        }

        // IMPORTANT FIX
        const projectId =
            Constants.easConfig?.projectId ??
            Constants.expoConfig?.extra?.eas?.projectId;

        console.log('PROJECT ID:', projectId);

        if (!projectId) {
            // Alert.alert(
            //     'Error',
            //     'Project ID not found'
            // );

            return null;
        }

        // GET TOKEN
        const pushToken =
            await Notifications.getExpoPushTokenAsync({
                projectId,
            });

        const token = pushToken.data;

        console.log('EXPO PUSH TOKEN:', token);

        // Alert.alert(
        //     'Push Token Generated',
        //     token
        // );

        return token;

    } catch (e: any) {

        console.log(
            'registerPushToken ERROR:',
            JSON.stringify(e, null, 2)
        );

        // Alert.alert(
        //     'Push Error',
        //     JSON.stringify(e)
        // );

        return null;
    }
}

export async function savePushToken(expoToken: string) {
    try {

        const authToken =
            await AsyncStorage.getItem('authToken');

        console.log('Saving token:', expoToken);

        const response = await fetch(
            'https://insighthub.com.ng/NestifyAPI/save_push_token.php',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${authToken}`,
                },
                body: JSON.stringify({
                    expo_token: expoToken,
                    platform: Platform.OS,
                }),
            }
        );

        const result = await response.json();

        console.log('SAVE TOKEN RESPONSE:', result);

        // Alert.alert(
        //     'Save Token Response',
        //     JSON.stringify(result)
        // );

    } catch (e: any) {

        console.log(
            'savePushToken ERROR:',
            JSON.stringify(e, null, 2)
        );

        // Alert.alert(
        //     'Save Error',
        //     JSON.stringify(e)
        // );
    }
}