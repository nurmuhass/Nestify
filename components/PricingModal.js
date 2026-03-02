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

const plans = [
  {
    key: 'freemium',
    title: 'Freemium',
    subtitle: '2 Listings / 2 Images',
    price: 'Free',
    features: ['Up to 2 listings per month', '2 images per listing', 'Pay‑per‑lead ₦200'],
    cta: 'Continue Freemium',
  },
  {
    key: 'single',
    title: 'Premium Single',
    subtitle: 'One‑time Listing',
    price: '₦5,000',
    features: ['10 images', 'Featured placement', 'Basic analytics'],
    cta: 'Buy Single Listing',
  },
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: CARD_WIDTH + 20,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    alignSelf: 'center',
    marginBottom: 12,
  },
  scroll: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 8,
  },
  feature: {
    fontSize: 13,
    color: '#444',
    alignSelf: 'flex-start',
    marginLeft: 12,
    marginVertical: 2,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  close: {
    position: 'absolute',
    top: 8,
    right: 12,
  },
  closeText: {
    fontSize: 20,
    color: '#888',
  },
});
