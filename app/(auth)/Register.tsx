import { Entypo, Ionicons } from '@expo/vector-icons';
import { City, State } from 'country-state-city';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { AuthContext } from '../../store';

const { width: SW, height: SH } = Dimensions.get('window');

/* ─── Palette ────────────────────────────────────────────────── */
const NAVY2 = '#091530';
const NAVY  = '#0f2044';
const GOLD  = '#c9a84c';
const MUTED = '#8a8a9a';
const WHITE = '#ffffff';

/* ─── Floating label input ───────────────────────────────────── */
function FloatingInput({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  rightIcon,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
  rightIcon?: React.ReactNode;
}) {
  const anim    = useRef(new Animated.Value(value ? 1 : 0)).current;
  const [focused, setFocused] = useState(false);

  const onFocus = () => {
    setFocused(true);
    Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    if (!value) Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
  };

  const labelTop   = anim.interpolate({ inputRange: [0, 1], outputRange: [16, 4] });
  const labelSize  = anim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [MUTED, focused ? GOLD : MUTED],
  });

  return (
    <View style={[inp.wrap, focused && inp.wrapFocused]}>
      <Animated.Text style={[inp.label, { top: labelTop, fontSize: labelSize, color: labelColor }]}>
        {label}
      </Animated.Text>
      <TextInput
        style={inp.field}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="transparent"
      />
      {rightIcon ? <View style={inp.right}>{rightIcon}</View> : null}
    </View>
  );
}

const inp = StyleSheet.create({
  wrap: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 10,
    marginBottom: 14,
    position: 'relative',
  },
  wrapFocused: {
    borderColor: GOLD,
    backgroundColor: 'rgba(201,168,76,0.05)',
  },
  label: {
    position: 'absolute',
    left: 16,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  field: {
    fontSize: 15,
    color: WHITE,
    fontWeight: '400',
    paddingTop: 4,
  },
  right: {
    position: 'absolute',
    right: 14,
    top: 0, bottom: 0,
    justifyContent: 'center',
  },
});

/* ─── Section label ──────────────────────────────────────────── */
function SectionLabel({ text }: { text: string }) {
  return (
    <View style={sec.row}>
      <View style={sec.line} />
      <Text style={sec.text}>{text}</Text>
      <View style={sec.line} />
    </View>
  );
}
const sec = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 4 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  text: { fontSize: 11, color: MUTED, letterSpacing: 0.8, textTransform: 'uppercase' },
});

/* ─── Dropdown wrapper styled for dark theme ─────────────────── */
const dropStyle = {
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderColor: 'rgba(255,255,255,0.12)',
  borderRadius: 14,
  minHeight: 52,
  paddingHorizontal: 16,
  marginBottom: 14,
};
const dropContainerStyle = {
  backgroundColor: NAVY,
  borderColor: 'rgba(255,255,255,0.12)',
  borderRadius: 14,
  maxHeight: 280,
};
const dropTextStyle = { color: WHITE, fontSize: 14 };
const dropPlaceholderStyle = { color: MUTED, fontSize: 14 };
const dropSearchStyle = {
  backgroundColor: 'rgba(255,255,255,0.07)',
  borderColor: 'rgba(255,255,255,0.12)',
  color: WHITE,
  borderRadius: 10,
  marginBottom: 8,
};

/* ─── Register Screen ────────────────────────────────────────── */
export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useContext(AuthContext);

  /* ── your original state ── */
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const [CompanyName,    setCompanyName]    = useState('');
  const [licenseNumber,  setLicenseNumber]  = useState('');

  const [country]    = useState('NG');
  const [state,      setState]      = useState(null);
  const [city,       setCity]       = useState(null);
  const [stateItems, setStateItems] = useState([]);
  const [cityItems,  setCityItems]  = useState([]);
  const [openState,  setOpenState]  = useState(false);
  const [openCity,   setOpenCity]   = useState(false);

  /* ── your original effects ── */
  useEffect(() => {
    const states = State.getStatesOfCountry('NG').map((s) => ({
      label: s.name,
      value: s.isoCode,
    }));
    setStateItems(states);
    setState(null);
    setCity(null);
    setCityItems([]);
  }, []);

  useEffect(() => {
    if (state) {
      const cities = City.getCitiesOfState('NG', state).map((c) => ({
        label: c.name,
        value: c.name,
      }));
      setCityItems(cities);
      setCity(null);
    }
  }, [state]);

  /* ── your original handleRegister ── */
  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !state || !city) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const selectedState = stateItems.find((item: any) => item.value === state);
    const stateName     = selectedState ? selectedState.label : state;
    const form: any     = { name, email, phone, password, isSeller, state: stateName, city };
    if (isSeller) {
      form.companyName    = CompanyName;
      form.licenseNumber  = licenseNumber;
    }
    setLoading(true);
    const res = await signUp(form);
    setLoading(false);
    if (res.error) {
      Alert.alert('Registration failed', res.error);
    } else {
      Alert.alert('Registration Successful');
      router.replace('/(tabs)/Home');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={NAVY2} />

      {/* Background photo */}
      <Image
        source={{ uri: 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=800' }}
        style={styles.bgPhoto}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(9,21,48,0.45)', 'rgba(9,21,48,0.80)', NAVY2]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={WHITE} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoRing}>
              <Ionicons name="home" size={24} color={GOLD} />
            </View>
            <Text style={styles.logoText}>Nestify</Text>
          </View>

          {/* Hero */}
          <Text style={styles.headline}>Create{'\n'}Account.</Text>
          <Text style={styles.sub}>
            Join thousands finding their perfect home in Nigeria.
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* ── Personal info ── */}
          <View style={styles.card}>
            <SectionLabel text="Personal Information" />

            <FloatingInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <FloatingInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <FloatingInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <FloatingInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPw((p) => !p)}>
                  <Entypo
                    name={showPw ? 'eye' : 'eye-with-line'}
                    size={20}
                    color={MUTED}
                  />
                </TouchableOpacity>
              }
            />

            {/* ── Location ── */}
            <SectionLabel text="Location" />

            {/* State dropdown */}
            <DropDownPicker
              open={openState}
              value={state}
              items={stateItems}
              setOpen={setOpenState}
              listMode="SCROLLVIEW"
              setValue={(cb) => {
                const val = typeof cb === 'function' ? cb(state) : cb;
                setState(val);
              }}
              setItems={setStateItems}
              placeholder="Select State"
              searchable
              zIndex={3000}
              zIndexInverse={1000}
              style={dropStyle}
              dropDownContainerStyle={dropContainerStyle}
              textStyle={dropTextStyle}
              placeholderStyle={dropPlaceholderStyle}
              searchTextInputStyle={dropSearchStyle}
              searchContainerStyle={{ borderBottomColor: 'rgba(255,255,255,0.08)' }}
              ArrowDownIconComponent={() => (
                <Ionicons name="chevron-down" size={16} color={MUTED} />
              )}
              ArrowUpIconComponent={() => (
                <Ionicons name="chevron-up" size={16} color={GOLD} />
              )}
              listItemContainerStyle={{ backgroundColor: 'transparent' }}
              selectedItemContainerStyle={{ backgroundColor: 'rgba(201,168,76,0.12)' }}
              selectedItemLabelStyle={{ color: GOLD, fontWeight: '600' }}
            />

            {/* City dropdown */}
            <DropDownPicker
              open={openCity}
              value={city}
              items={cityItems}
              setOpen={setOpenCity}
              listMode="SCROLLVIEW"
              setValue={(cb) => {
                const val = typeof cb === 'function' ? cb(city) : cb;
                setCity(val);
              }}
              setItems={setCityItems}
              placeholder="Select City"
              searchable
              zIndex={2000}
              zIndexInverse={2000}
              style={dropStyle}
              dropDownContainerStyle={dropContainerStyle}
              textStyle={dropTextStyle}
              placeholderStyle={dropPlaceholderStyle}
              searchTextInputStyle={dropSearchStyle}
              searchContainerStyle={{ borderBottomColor: 'rgba(255,255,255,0.08)' }}
              ArrowDownIconComponent={() => (
                <Ionicons name="chevron-down" size={16} color={MUTED} />
              )}
              ArrowUpIconComponent={() => (
                <Ionicons name="chevron-up" size={16} color={GOLD} />
              )}
              listItemContainerStyle={{ backgroundColor: 'transparent' }}
              selectedItemContainerStyle={{ backgroundColor: 'rgba(201,168,76,0.12)' }}
              selectedItemLabelStyle={{ color: GOLD, fontWeight: '600' }}
            />
          </View>

          {/* ── Company/Agent toggle ── */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleLeft}>
              <View style={styles.toggleIcon}>
                <Ionicons name="business-outline" size={18} color={GOLD} />
              </View>
              <View>
                <Text style={styles.toggleLabel}>Company / Agent</Text>
                <Text style={styles.toggleSub}>Register as a real estate company or agent</Text>
              </View>
            </View>
            <Switch
              value={isSeller}
              onValueChange={setIsSeller}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(201,168,76,0.5)' }}
              thumbColor={isSeller ? GOLD : 'rgba(255,255,255,0.6)'}
            />
          </View>

          {/* ── Seller fields ── */}
          {isSeller && (
            <View style={[styles.card, { marginTop: 12 }]}>
              <SectionLabel text="Company Details" />
              <FloatingInput
                label="Company Name"
                value={CompanyName}
                onChangeText={setCompanyName}
                autoCapitalize="words"
              />
              <FloatingInput
                label="RC Number / NIN"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
              />
            </View>
          )}

          {/* ── Register button ── */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={NAVY2} size="small" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={18} color={NAVY2} />
              </>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => router.replace('./Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineBtnText}>
              Already have an account?{' '}
              <Text style={{ color: GOLD, fontWeight: '700' }}>Sign In</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            By registering you agree to our{' '}
            <Text style={{ color: GOLD }}>Terms of Service</Text>
            {' & '}
            <Text style={{ color: GOLD }}>Privacy Policy</Text>
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NAVY2 },

  bgPhoto: {
    position: 'absolute',
    width: SW, height: SH,
  },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: getStatusBarHeight() + 12,
    paddingBottom: 40,
  },

  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },

  /* Logo */
  logoWrap: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 30,
  },
  logoRing: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    fontSize: 20, fontWeight: '700',
    color: WHITE, letterSpacing: -0.3,
  },

  /* Hero */
  headline: {
    fontSize: 42, fontWeight: '800',
    color: WHITE, lineHeight: 46,
    letterSpacing: -1, marginBottom: 8,
  },
  sub: {
    fontSize: 14, color: 'rgba(255,255,255,0.48)',
    fontWeight: '300', lineHeight: 20,
  },

  divider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 24,
  },

  /* Cards */
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    marginBottom: 14,
  },

  /* Toggle */
  toggleCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  toggleIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(201,168,76,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: WHITE },
  toggleSub:   { fontSize: 11, color: MUTED, marginTop: 2, maxWidth: 200 },

  /* Buttons */
  primaryBtn: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    fontSize: 15, fontWeight: '700',
    color: NAVY2, letterSpacing: 0.3,
  },

  outlineBtn: {
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginBottom: 20,
  },
  outlineBtnText: {
    fontSize: 14, color: 'rgba(255,255,255,0.65)',
  },

  terms: {
    fontSize: 11, color: 'rgba(255,255,255,0.28)',
    textAlign: 'center', lineHeight: 17,
  },
});
