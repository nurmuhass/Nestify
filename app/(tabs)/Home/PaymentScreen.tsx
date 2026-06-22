import { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { brandColors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const BASE_URL = 'https://insighthub.com.ng';

const PLAN_LABELS: Record<string, string> = {
  single: 'Single Listing — ₦500',
  monthly: 'Monthly Premium — ₦1,500',
  semi: 'Semi-Annual — ₦7,500',
  annual: 'Annual Premium — ₦12,000',
};

export default function PaymentScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const planKey = Array.isArray(params.plan) ? params.plan[0] : params.plan;

  const [autoRenew, setAutoRenew] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initializePayment = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userEmail = await AsyncStorage.getItem('userEmail');

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
        Alert.alert('Error', data.msg || 'Could not start payment');
      }
    } catch {
      Alert.alert('Error', 'Network error');
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
        Alert.alert('🎉 Payment Successful', 'Your premium plan is now active!', [
          { text: 'OK', onPress: () => router.replace('/dashboard') },
        ]);
      } else {
        Alert.alert('Pending', 'Payment is still processing. Check back shortly.');
        router.back();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Complete Upgrade</Text>
      <Text style={[styles.planLabel, { color: colors.buttonBackground }]}>{PLAN_LABELS[planKey ?? ''] ?? planKey}</Text>

      <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Payment via Paystack</Text>
        <Text style={[styles.cardSub, { color: colors.mutedText }]}>Card · Bank Transfer · Opay · Mobile Money</Text>
      </View>

      {/* Only show auto-renew for recurring plans */}
      {planKey !== 'single' && (
        <View style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Auto-Renew</Text>
            <Text style={[styles.rowSub, { color: colors.mutedText }]}>Automatically renew when plan expires</Text>
          </View>
          <Switch
            value={autoRenew}
            onValueChange={setAutoRenew}
            trackColor={{ false: colors.border, true: colors.buttonBackground }}
            thumbColor={colors.cardBackground}
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.buttonBackground }]}
        onPress={initializePayment}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={colors.background} />
          : <Text style={[styles.buttonText, { color: colors.background }]}>Proceed to Payment</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A', padding: 24, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  planLabel: { color: brandColors.goldCta, fontSize: 16, marginBottom: 28 },
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
    backgroundColor: brandColors.goldCta, paddingVertical: 16,
    borderRadius: 14, alignItems: 'center',
  },
  buttonText: { color: brandColors.primaryNavy, fontWeight: '800', fontSize: 16 },
});
