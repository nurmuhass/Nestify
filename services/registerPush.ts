import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const BASE = 'https://insighthub.com.ng/NestifyAPI';

export async function registerPushToken(): Promise<string | null> {
    if (!Device.isDevice) {
        console.log('Push notifications require a real device.');
        return null;
    }

    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } =
            await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Push permission not granted');
        return null;
    }

    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId;

    const token = (
        await Notifications.getExpoPushTokenAsync({
            projectId,
        })
    ).data;

    return token;
}

export async function savePushToken(expoToken: string): Promise<boolean> {
    try {
        const authToken = await AsyncStorage.getItem('authToken');

        if (!authToken || !expoToken) return false;

        const res = await fetch(`${BASE}/save_push_token.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${authToken}`,
            },
            body: JSON.stringify({
                expo_token: expoToken,
                platform: Platform.OS,
            }),
        });

        const json = await res.json();

        return res.ok && json.status === 'success';
    } catch (e) {
        console.log('savePushToken error:', e);
        return false;
    }
}