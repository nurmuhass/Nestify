import { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useToast } from '../../components/Toast';

const BASE_URL = 'https://insighthub.com.ng';
const GOLD = '#C9A84C';
const DARK = '#0F0F1A';

const PLAN_LABELS: Record<string, string> = {
  monthly: 'Monthly Premium — ₦8,000',
  semi: 'Semi-Annual — ₦40,000',
  annual: 'Annual Premium — ₦70,000',
};

export default function PaymentScreen() {
  const router = useRouter();
  const { show } = useToast();
  const params = useLocalSearchParams();
  const planKey = Array.isArray(params.plan) ? params.plan[0] : params.plan;

  const [autoRenew, setAutoRenew] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const initializePayment = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userJson = await AsyncStorage.getItem('authUser');
      let userEmail = '';
      
      if (userJson) {
        const userObj = JSON.parse(userJson);
        setUser(userObj);
        userEmail = userObj?.email || '';
      }
      
      const res = await fetch(`${BASE_URL}/NestifyAPI/initialize_payment.php`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_key: planKey, auto_renew: autoRenew, email: userEmail }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setReference(data.reference);
        setPaymentUrl(data.payment_url);
      } else {
        show({
          type: 'error',
          title: 'Error',
          message: data.msg || 'Could not start payment',
        });
      }
    } catch {
      show({
        type: 'error',
        title: 'Error',
        message: 'Network error',
      });
    } finally {
      setLoading(false);
    }
  };
    
  const handleWebViewNav = async (navState: any) => {
    const url: string = navState.url;

    // Paystack redirects to callback when done
    if (url.includes('payment_callback.php') || url.includes('paystack.co/close')) {
      setPaymentUrl(null);
      await verifyPayment();
    }
  };  

  const verifyPayment = async () => {
    if (!reference) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(
        `${BASE_URL}/NestifyAPI/verify_payment.php?reference=${reference}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      const data = await res.json();

      if (data.status === 'success') {
        // Update user data if provided in response, otherwise fetch fresh data
        if (data.user) {
          await AsyncStorage.setItem('authUser', JSON.stringify(data.user));
        } else {
          // Fetch updated user data from backend
          try {
            const userRes = await fetch(`${BASE_URL}/NestifyAPI/get_user_profile.php`, {
              headers: { Authorization: `Token ${token}` }
            });
            const userData = await userRes.json();
            if (userData.status === 'success' && userData.user) {
              await AsyncStorage.setItem('authUser', JSON.stringify(userData.user));
            }
          } catch (error) {
            console.log('Could not fetch updated user profile:', error);
          }
        }

        show({
          type: 'success',
          title: '🎉 Payment Successful',
          message: 'Your premium plan is now active!',
        });
        setTimeout(() => router.replace('../(tabs)/Profile'), 1500);
      } else {
        show({
          type: 'warning',
          title: 'Pending',
          message: 'Payment is still processing. Check back shortly.',
        });
        setTimeout(() => router.back(), 1500);
      }     
    } finally {
      setLoading(false);
    }
  };

  // Show WebView when payment URL is ready
  if (paymentUrl) {
    return (
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleWebViewNav}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Upgrade</Text>
      <Text style={styles.planLabel}>{PLAN_LABELS[planKey ?? ''] ?? planKey}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment via Paystack</Text>
        <Text style={styles.cardSub}>Card · Bank Transfer · Opay · Mobile Money</Text>
      </View>

      {/* Only show auto-renew for recurring plans */}
      {planKey !== 'single' && (
        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>Auto-Renew</Text>
            <Text style={styles.rowSub}>Automatically renew when plan expires</Text>
          </View>
          <Switch
            value={autoRenew}
            onValueChange={setAutoRenew}
            trackColor={{ true: GOLD }}
            thumbColor="#fff"
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={initializePayment}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={DARK} />
          : <Text style={styles.buttonText}>Proceed to Payment</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A', padding: 24, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  planLabel: { color: GOLD, fontSize: 16, marginBottom: 28 },
  card: {
    backgroundColor: '#1A1A2A', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#ffffff10', marginBottom: 24,
  },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardSub: { color: '#888', fontSize: 13 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1A1A2A', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#ffffff10', marginBottom: 24,
  },
  rowLabel: { color: '#fff', fontWeight: '600', marginBottom: 2 },
  rowSub: { color: '#888', fontSize: 12 },
  button: {
    backgroundColor: GOLD, paddingVertical: 16,
    borderRadius: 14, alignItems: 'center',
  },
  buttonText: { color: DARK, fontWeight: '800', fontSize: 16 },
});