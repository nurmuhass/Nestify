import { Entypo, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContext, useRef, useState } from 'react';
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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { AuthContext } from '../../store';

const { width: SW, height: SH } = Dimensions.get('window');

/* ─── Palette ────────────────────────────────────────────────── */
const NAVY   = '#0f2044';
const NAVY2  = '#091530';
const GOLD   = '#c9a84c';
const GOLDT  = '#f0d98a';
const CREAM  = '#faf8f4';
const MUTED  = '#8a8a9a';
const WHITE  = '#ffffff';
const ERR    = '#ef4444';

/* ─── Floating label input ───────────────────────────────────── */
function FloatingInput({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'none',
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
  const anim   = useRef(new Animated.Value(value ? 1 : 0)).current;
  const [focused, setFocused] = useState(false);

  const onFocus = () => {
    setFocused(true);
    Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    if (!value) Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
  };

  const labelTop  = anim.interpolate({ inputRange: [0, 1], outputRange: [16, 4] });
  const labelSize = anim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [MUTED, focused ? GOLD : MUTED],
  });

  return (
    <View style={[
      inp.wrap,
      focused && inp.wrapFocused,
    ]}>
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

/* ─── Login Screen ───────────────────────────────────────────── */
export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useContext(AuthContext);

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password,     setPassword]     = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [loading,      setLoading]      = useState(false);

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    const res = await signIn({ emailOrPhone, password });
    setLoading(false);
    if (res.error) {
      Alert.alert('Login failed', res.error);
    } else {
      router.replace('/(tabs)/Home');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={NAVY2} />

      {/* Background photo + dark overlay */}
      <Image
        source={{ uri: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800' }}
        style={styles.bgPhoto}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(9,21,48,0.55)', 'rgba(9,21,48,0.82)', NAVY2]}
        locations={[0, 0.45, 1]}
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
          {/* Logo mark */}
          <TouchableOpacity style={styles.logoWrap}  onPress={() => router.push('./Welcome')}>
            <View style={styles.logoRing}>
              <Ionicons name="home" size={26} color={GOLD} />
            </View>
            <Text style={styles.logoText}>Nestify</Text>
          </TouchableOpacity>

          {/* Hero copy */}
          <Text style={styles.headline}>Welcome{'\n'}back.</Text>
          <Text style={styles.sub}>Sign in to continue exploring premium properties.</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Form card */}
          <View style={styles.card}>
            <FloatingInput
              label="Email or Phone"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              keyboardType="email-address"
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

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={NAVY2} size="small" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color={NAVY2} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.orLine} />
            </View>

            {/* Register link */}
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => router.push('./Register')}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineBtnText}>Create an Account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By signing in you agree to our{' '}
            <Text style={{ color: GOLD }}>Terms of Service</Text>
            {' & '}
            <Text style={{ color: GOLD }}>Privacy Policy</Text>
          </Text>
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
    paddingTop: getStatusBarHeight() + 20,
    paddingBottom: 40,
  },

  /* Logo */
  logoWrap: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 40,
  },
  logoRing: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    fontSize: 22, fontWeight: '700',
    color: WHITE, letterSpacing: -0.3,
  },

  /* Hero */
  headline: {
    fontSize: 46, fontWeight: '800',
    color: WHITE, lineHeight: 50,
    letterSpacing: -1.2, marginBottom: 10,
  },
  sub: {
    fontSize: 14, color: 'rgba(255,255,255,0.50)',
    fontWeight: '300', lineHeight: 20, letterSpacing: 0.2,
  },

  divider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 28,
  },

  /* Form card */
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    marginBottom: 20,
  },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 },
  forgotText: { fontSize: 12, color: GOLD, fontWeight: '500' },

  /* Primary button */
  primaryBtn: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    fontSize: 15, fontWeight: '700',
    color: NAVY2, letterSpacing: 0.3,
  },

  /* OR row */
  orRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginBottom: 20,
  },
  orLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.10)' },
  orText: { fontSize: 12, color: MUTED },

  /* Outline button */
  outlineBtn: {
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center',
  },
  outlineBtnText: {
    fontSize: 14, color: WHITE, fontWeight: '600',
  },

  terms: {
    fontSize: 11, color: 'rgba(255,255,255,0.30)',
    textAlign: 'center', lineHeight: 17,
  },
});
