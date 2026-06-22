import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colorWithAlpha } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

const sellerPlans = [
  {
    key: 'seller_monthly',
    title: 'Seller Monthly',
    subtitle: 'For active real estate sellers',
    price: '\u20a68,000/month',
    badge: 'POPULAR',
    features: [
      'Upload up to 15 images',
      'Priority property visibility',
      'Featured listings',
      'Advanced analytics',
      'Company branding',
      'Ad-free dashboard',
    ],
    cta: 'Upgrade Seller Plan',
  },
  {
    key: 'seller_semi',
    title: 'Seller Semi-Annual',
    subtitle: '6 months seller package',
    price: '\u20a640,000/6 mo',
    badge: 'BEST VALUE',
    features: [
      'Upload up to 20 images',
      'Premium property ranking',
      'Lead insights',
      'Verified seller badge',
      'Priority support',
    ],
    cta: 'Choose Semi-Annual',
  },
  {
    key: 'seller_annual',
    title: 'Seller Annual',
    subtitle: 'Full business package',
    price: '\u20a670,000/year',
    badge: 'ENTERPRISE',
    features: [
      'Upload up to 25 images',
      'Dedicated account support',
      'Top homepage placement',
      'Unlimited visibility boost',
      'Full premium suite',
    ],
    cta: 'Go Annual',
  },
];

const buyerPlans = [
  {
    key: 'buyer_monthly',
    title: 'Buyer Premium',
    subtitle: 'Access premium buyer features',
    price: '\u20a65,000/month',
    badge: 'POPULAR',
    features: [
      'Chat directly with companies',
      'View company phone numbers',
      'Access exclusive listings',
      'Premium buyer badge',
      'Priority responses from sellers',
    ],
    cta: 'Become Premium',
  },
  {
    key: 'buyer_annual',
    title: 'Buyer Annual',
    subtitle: 'Best for serious investors',
    price: '\u20a650,000/year',
    badge: 'SAVE MORE',
    features: [
      'Unlimited company access',
      'Direct company contacts',
      'Priority buyer support',
      'Early access to new properties',
      'Investor-level features',
    ],
    cta: 'Go Annual',
  },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (planKey: string) => void;
  mode?: 'seller' | 'buyer';
};

export default function PricingModal({
  visible,
  onClose,
  onSelectPlan,
  mode = 'buyer',
}: Props) {
  const { colors } = useTheme();
  const plans = mode === 'seller' ? sellerPlans : buyerPlans;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.backdrop,
          { backgroundColor: colorWithAlpha(colors.shadow, 0.7) },
        ]}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.header, { color: colors.text }]}>
            {mode === 'seller' ? 'Seller Premium Plans' : 'Buyer Premium Plans'}
          </Text>

          <Text style={[styles.description, { color: colors.mutedText }]}>
            {mode === 'seller'
              ? 'Boost your listings, visibility and sales performance.'
              : 'Unlock premium access to companies, chats and exclusive listings.'}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            {plans.map((plan) => (
              <View
                key={plan.key}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.buttonBackground },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: colors.background }]}>
                    {plan.badge}
                  </Text>
                </View>

                <Text style={[styles.title, { color: colors.text }]}>
                  {plan.title}
                </Text>

                <Text style={[styles.subtitle, { color: colors.mutedText }]}>
                  {plan.subtitle}
                </Text>

                <Text style={[styles.price, { color: colors.buttonBackground }]}>
                  {plan.price}
                </Text>

                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />

                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Text style={[styles.check, { color: colors.buttonBackground }]}>
                      {'\u2713'}
                    </Text>

                    <Text style={[styles.feature, { color: colors.mutedText }]}>
                      {feature}
                    </Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: colors.buttonBackground },
                  ]}
                  onPress={() => onSelectPlan(plan.key)}
                >
                  <Text style={[styles.buttonText, { color: colors.background }]}>
                    {plan.cta}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.close,
              { backgroundColor: colorWithAlpha(colors.text, 0.08) },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.closeText, { color: colors.mutedText }]}>
              {'\u2715'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const CARD_WIDTH = width * 0.82;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: CARD_WIDTH + 25,
    maxHeight: '85%',
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
    lineHeight: 20,
  },
  scroll: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 10,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 14,
  },
  price: {
    fontSize: 30,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  check: {
    fontSize: 16,
    fontWeight: '800',
    marginRight: 10,
  },
  feature: {
    flex: 1,
    lineHeight: 20,
  },
  button: {
    marginTop: 22,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '800',
    fontSize: 15,
  },
  close: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
