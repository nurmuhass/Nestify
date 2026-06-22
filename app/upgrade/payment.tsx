import { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useToast } from '../../components/Toast';
import { brandColors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const BASE_URL = 'https://insighthub.com.ng';

const GOLD = brandColors.goldCta;
const DARK = brandColors.primaryNavy;

const PLAN_DETAILS: Record<string, any> = {

  // SELLER PLANS
  seller_monthly: {
    label: 'Seller Monthly Premium',
    amount: '₦8,000',
    type: 'seller',
  },

  seller_semi: {
    label: 'Seller Semi-Annual',
    amount: '₦40,000',
    type: 'seller',
  },

  seller_annual: {
    label: 'Seller Annual Premium',
    amount: '₦70,000',
    type: 'seller',
  },

  // BUYER PLANS
  buyer_monthly: {
    label: 'Buyer Monthly Premium',
    amount: '₦5,000',
    type: 'buyer',
  },

  property_boost: {
    label: 'Property Boost',
    amount: '₦5,000',
    type: 'boost',
  },

  buyer_annual: {
    label: 'Buyer Annual Premium',
    amount: '₦50,000',
    type: 'buyer',
  },
};

export default function PaymentScreen() {

  const router = useRouter();
  const { show } = useToast();
  const { colors } = useTheme();

  const params = useLocalSearchParams();

  const planKey = Array.isArray(params.plan)
    ? params.plan[0]
    : params.plan;

  const plan = PLAN_DETAILS[planKey ?? ''];

  const [autoRenew, setAutoRenew] = useState(false);

  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const [reference, setReference] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const initializePayment = async () => {

    setLoading(true);

    try {

      const token = await AsyncStorage.getItem('authToken');
      const userJson = await AsyncStorage.getItem('authUser');

      let userEmail = '';
      if (userJson) {
        const userObj = JSON.parse(userJson);
        userEmail = userObj?.email || '';
      }

      // ── Pull propertyId from params ──────────────────────────
      const propertyId = Array.isArray(params.propertyId)
        ? params.propertyId[0]
        : params.propertyId ?? null;

      const response = await fetch(
        `${BASE_URL}/NestifyAPI/initialize_payment.php`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan_key: planKey,
            auto_renew: autoRenew,
            email: userEmail,
            property_id: propertyId,   // <-- send it
          }),
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        setReference(data.reference);
        setPaymentUrl(data.payment_url);
      } else {
        show({
          type: 'error',
          title: 'Payment Error',
          message: data.msg || 'Could not initialize payment',
        });
      }

    } catch (e) {
      show({
        type: 'error',
        title: 'Network Error',
        message: 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleWebViewNav = async (navState: any) => {

    const url = navState.url;

    if (
      url.includes('payment_callback.php') ||
      url.includes('paystack.co/close')
    ) {

      setPaymentUrl(null);

      await verifyPayment();
    }
  };



  const verifyPayment = async () => {

    if (!reference) return;

    setLoading(true);

    try {

      const token = await AsyncStorage.getItem('authToken');

      const response = await fetch(
        `${BASE_URL}/NestifyAPI/verify_payment.php?reference=${reference}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      // Read raw response first
      const text = await response.text();


      console.log(
        'VERIFY RESPONSE RAW:',
        JSON.stringify(text)
      );

      let data;

      try {
        data = JSON.parse(text);
      } catch (jsonError) {

        console.log('JSON PARSE ERROR:', jsonError);

        show({
          type: 'error',
          title: 'Server Error',
          message: 'Invalid server response',
        });

        return;
      }

      console.log('VERIFY DATA:', data);

      if (data.status === 'success') {

        /**
         * Store updated user
         */
        if (data.user) {

          try {

            await AsyncStorage.setItem(
              'authUser',
              JSON.stringify(data.user)
            );

          } catch (storageError) {

            console.log(
              'ASYNC STORAGE ERROR:',
              storageError
            );
          }
        }

        show({
          type: 'success',
          title: 'Payment Successful',
          message:
            plan?.type === 'seller'
              ? 'Seller premium activated successfully'
              : plan?.type === 'buyer'
                ? 'Buyer premium activated successfully'
                : 'Property boost activated successfully',
        });

        setTimeout(() => {
          router.replace('../(tabs)/Profile');
        }, 1500);

      } else {

        show({
          type: 'warning',
          title: 'Pending',
          message: data.msg || 'Payment still processing',
        });

        setTimeout(() => {
          router.back();
        }, 1500);
      }

    } catch (err) {

      console.log('VERIFY ERROR:', err);

      show({
        type: 'error',
        title: 'Verification Failed',
        message: 'Could not verify payment',
      });

    } finally {

      setLoading(false);
    }
  };

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

      <Text style={[styles.title, { color: colors.text }]}>
        Complete Upgrade
      </Text>

      <Text style={[styles.planLabel, { color: colors.buttonBackground }]}>
        {plan?.label}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>

        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {plan?.type === 'seller'
            ? 'Seller Premium Access'
            : plan?.type === 'boost'
              ? 'Boost Your Property'
              : 'Buyer Premium Access'}
        </Text>

        <Text style={[styles.cardSub, { color: colors.mutedText }]}>
          {plan?.type === 'seller'
            ? 'Boost listings and increase visibility'
            : plan?.type === 'boost'
              ? 'Get more visibility and reach more buyers'
              : 'Unlock chats and company contact access'}
        </Text>

      </View>

      <View style={[styles.featuresCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>

        {plan?.type === 'seller' ? (
          <>
            <Text style={[styles.feature, { color: colors.text }]}>✓ More property uploads</Text>
            <Text style={[styles.feature, { color: colors.text }]}>✓ Featured listings</Text>
            <Text style={[styles.feature, { color: colors.text }]}>✓ Better visibility</Text>
            <Text style={[styles.feature, { color: colors.text }]}>✓ Analytics dashboard</Text>
          </>
        ) : plan?.type === 'boost' ? (
          <>
            <Text style={[styles.feature, { color: colors.text }]}>✓ Increased property visibility</Text>
            <Text style={[styles.feature, { color: colors.text }]}>✓ Higher search rankings</Text>
            <Text style={[styles.feature, { color: colors.text }]}>✓ Featured placement</Text>
            <Text style={[styles.feature, { color: colors.text }]}>✓ 30-day boost duration</Text>
          </>
        ) : (
          <>
            <Text style={[styles.feature, { color: colors.text }]}>✓ Chat companies directly</Text>
            <Text style={[styles.feature, { color: colors.text }]}>✓ View company contacts</Text>
            <Text style={[styles.feature, { color: colors.text }]}>✓ Access premium listings</Text>
            <Text style={[styles.feature, { color: colors.text }]}>✓ Priority buyer access</Text>
          </>
        )}

      </View>

      {/* BOOST PLAN INFO */}
      {plan?.type === 'boost' && (
        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderLeftColor: colors.buttonBackground }]}>
          <Text style={[styles.infoTitle, { color: colors.buttonBackground }]}>💡 Why Consider Premium Plans?</Text>
          <Text style={[styles.infoText, { color: colors.mutedText }]}>
            <Text style={{ fontWeight: '700', color: colors.buttonBackground }}>Seller Premium: </Text>
            Unlock unlimited property uploads, featured listings, and detailed analytics to maximize your reach and close deals faster.
          </Text>
          <Text style={[styles.infoText, { color: colors.mutedText }]}>
            <Text style={{ fontWeight: '700', color: colors.buttonBackground }}>Buyer Premium: </Text>
            Chat directly with sellers and companies, access contact information, and get priority access to new premium listings.
          </Text>
        </View>
      )}

      {/* ONLY SELLER PLANS CAN AUTO RENEW */}
      {plan?.type === 'seller' && plan?.type !== 'boost' && (

        <View style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>

          <View>

            <Text style={[styles.rowLabel, { color: colors.text }]}>
              Auto Renew
            </Text>

            <Text style={[styles.rowSub, { color: colors.mutedText }]}>
              Automatically renew subscription
            </Text>

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

        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.background }]}>
            Proceed to Payment
          </Text>
        )}

      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    padding: 24,
    justifyContent: 'center',
  },

  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },

  planLabel: {
    color: GOLD,
    fontSize: 17,
    marginBottom: 28,
    fontWeight: '700',
  },

  card: {
    backgroundColor: '#1A1A2A',
    borderRadius: 18,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },

  cardTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 5,
  },

  cardSub: {
    color: '#aaa',
    fontSize: 13,
  },

  featuresCard: {
    backgroundColor: '#1A1A2A',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },

  feature: {
    color: '#ddd',
    marginBottom: 10,
    fontSize: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A2A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffffff10',
    marginBottom: 24,
  },

  rowLabel: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },

  rowSub: {
    color: '#888',
    fontSize: 12,
  },

  button: {
    backgroundColor: GOLD,
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
  },

  buttonText: {
    color: DARK,
    fontWeight: '800',
    fontSize: 16,
  },

  infoCard: {
    backgroundColor: '#1A1A2A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffffff10',
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
  },

  infoTitle: {
    color: GOLD,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 12,
  },

  infoText: {
    color: '#ccc',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
});
