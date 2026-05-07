// pricing modal component for listing plans and features
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

const plans = [

  {
    key: 'monthly',
    title: 'Premium Monthly',
    subtitle: 'Monthly Subscription',
    price: '₦8,000/month',
    features: ['15 images', 'Featured + ad‑free', 'Advanced analytics'],
    cta: 'Subscribe Monthly',
  },
  {
    key: 'semi',
    title: 'Premium Semi‑Ann',
    subtitle: '6‑Month Subscription',
    price: '₦40,000/6 mo',
    features: ['20 images', 'All premium features', 'Priority support'],
    cta: 'Subscribe 6‑Mo',
  },
  {
    key: 'annual',
    title: 'Premium Annual',
    subtitle: 'Yearly Subscription',
    price: '₦70,000/yr',
    features: ['25 images', 'Full suite', 'Dedicated account'],
    cta: 'Subscribe Annual',
  },
];

export default function PricingModal({ visible, onSelectPlan, onClose }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.header}>Choose Your Plan</Text>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {plans.map(plan => (
              <View key={plan.key} style={styles.card}>
                <Text style={styles.title}>{plan.title}</Text>
                <Text style={styles.subtitle}>{plan.subtitle}</Text>
                <Text style={styles.price}>{plan.price}</Text>
                {plan.features.map((f, i) => (
                  <Text key={i} style={styles.feature}>• {f}</Text>
                ))}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => onSelectPlan(plan.key)}
                >
                  <Text style={styles.buttonText}>{plan.cta}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const CARD_WIDTH = width * 0.8;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: BACKDROP,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: CARD_WIDTH + 20,
    maxHeight: '80%',
    backgroundColor: SURFACE,
    borderRadius: 18,
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT,
    alignSelf: 'center',
    marginBottom: 14,
  },
  scroll: {
    alignItems: 'center',
    paddingBottom: 18,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: BORDER,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  subtitle: {
    fontSize: 14,
    color: SUBTEXT,
    marginTop: 4,
    marginBottom: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: GOLD,
    marginVertical: 10,
  },
  feature: {
    fontSize: 14,
    color: SUBTEXT,
    alignSelf: 'flex-start',
    marginLeft: 4,
    marginVertical: 4,
  },
  button: {
    marginTop: 16,
    backgroundColor: GOLD,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: SURFACE,
    fontWeight: '700',
    fontSize: 14,
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff10',
  },
  closeText: {
    fontSize: 20,
    color: SUBTEXT,
  },
});
