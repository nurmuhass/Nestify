import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const GOLD = '#C9A84C';
const BACKDROP = 'rgba(0,0,0,0.7)';
const SURFACE = '#0F0F1A';
const CARD = '#161821';
const TEXT = '#F7F7FA';
const SUBTEXT = '#B5B5C3';
const BORDER = '#ffffff14';
const NAVY = '#1A1A2E';

const sellerPlans = [
  {
    key: 'seller_monthly',
    title: 'Seller Monthly',
    subtitle: 'For active real estate sellers',
    price: '₦8,000/month',
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
    price: '₦40,000/6 mo',
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
    price: '₦70,000/year',
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
    price: '₦5,000/month',
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
    price: '₦50,000/year',
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

  const plans = mode === 'seller'
    ? sellerPlans
    : buyerPlans;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>

          <Text style={styles.header}>
            {mode === 'seller'
              ? 'Seller Premium Plans'
              : 'Buyer Premium Plans'}
          </Text>

          <Text style={styles.description}>
            {mode === 'seller'
              ? 'Boost your listings, visibility and sales performance.'
              : 'Unlock premium access to companies, chats and exclusive listings.'}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >

            {plans.map((plan) => (
              <View key={plan.key} style={styles.card}>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {plan.badge}
                  </Text>
                </View>

                <Text style={styles.title}>
                  {plan.title}
                </Text>

                <Text style={styles.subtitle}>
                  {plan.subtitle}
                </Text>

                <Text style={styles.price}>
                  {plan.price}
                </Text>

                <View style={styles.divider} />

                {plan.features.map((feature, index) => (
                  <View
                    key={index}
                    style={styles.featureRow}
                  >
                    <Text style={styles.check}>
                      ✓
                    </Text>

                    <Text style={styles.feature}>
                      {feature}
                    </Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => onSelectPlan(plan.key)}
                >
                  <Text style={styles.buttonText}>
                    {plan.cta}
                  </Text>
                </TouchableOpacity>

              </View>
            ))}

          </ScrollView>

          <TouchableOpacity
            style={styles.close}
            onPress={onClose}
          >
            <Text style={styles.closeText}>
              ✕
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
    backgroundColor: BACKDROP,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    width: CARD_WIDTH + 25,
    maxHeight: '85%',
    backgroundColor: SURFACE,
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },

  header: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT,
    textAlign: 'center',
  },

  description: {
    color: SUBTEXT,
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
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },

  badge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: GOLD,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    color: NAVY,
    fontSize: 11,
    fontWeight: '800',
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT,
    marginTop: 10,
  },

  subtitle: {
    color: SUBTEXT,
    marginTop: 4,
    marginBottom: 14,
  },

  price: {
    fontSize: 30,
    fontWeight: '900',
    color: GOLD,
  },

  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 18,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  check: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '800',
    marginRight: 10,
  },

  feature: {
    color: SUBTEXT,
    flex: 1,
    lineHeight: 20,
  },

  button: {
    marginTop: 22,
    backgroundColor: GOLD,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },

  buttonText: {
    color: NAVY,
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
    backgroundColor: '#ffffff12',
  },

  closeText: {
    color: SUBTEXT,
    fontSize: 18,
    fontWeight: '700',
  },
});