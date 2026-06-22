// app/(auth)/ForgotPassword.tsx
// 3-screen flow:
//   Screen 1: Enter email → request OTP
//   Screen 2: Enter 6-digit OTP
//   Screen 3: Set new password

import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useToast } from '../../components/Toast';
import { brandColors, colorWithAlpha } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const BASE = 'https://insighthub.com.ng/NestifyAPI';

type Screen = 'email' | 'otp' | 'password';

export default function ForgotPassword() {
  const router = useRouter();
  const { show } = useToast();
  const { colors } = useTheme();

  const [screen, setScreen] = useState<Screen>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Refs for OTP inputs
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // ── Step 1: Request OTP ───────────────────────────────────────────────────
  const handleRequestOTP = async () => {
    if (!email.trim()) {
      show({ type: 'warning', title: 'Required', message: 'Please enter your email address.' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      show({ type: 'warning', title: 'Invalid email', message: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/forgot_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const result = await res.json();

      if (result.status === 'success') {
        setScreen('otp');
        startResendTimer();
      } else {
        show({ type: 'error', title: 'Error', message: result.msg ?? 'Something went wrong' });
      }
    } catch (e: any) {
      show({ type: 'error', title: 'Error', message: e.message ?? 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      show({ type: 'warning', title: 'Required', message: 'Please enter the 6-digit code.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/verify_otp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: code }),
      });
      const result = await res.json();

      if (result.status === 'success') {
        setResetToken(result.reset_token);
        setScreen('password');
      } else {
        show({ type: 'error', title: 'Invalid code', message: result.msg ?? 'Code is incorrect or expired' });
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (e: any) {
      show({ type: 'error', title: 'Error', message: e.message ?? 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset password ────────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (!password || !confirm) {
      show({ type: 'warning', title: 'Required', message: 'Please fill in both password fields.' });
      return;
    }
    if (password !== confirm) {
      show({ type: 'warning', title: 'Mismatch', message: 'Passwords do not match.' });
      return;
    }
    if (password.length < 8) {
      show({ type: 'warning', title: 'Too short', message: 'Password must be at least 8 characters.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/reset_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          reset_token: resetToken,
          password,
          password_confirmation: confirm,
        }),
      });
      const result = await res.json();

      if (result.status === 'success') {
        show({
          type: 'success',
          title: 'Password Reset',
          message: 'Your password has been updated successfully. Please log in.',
          action: {
            label: 'Log In',
            onPress: () => router.replace('/(auth)/Login'),
          },
        });
        router.replace('/(auth)/Login');
      } else {
        show({ type: 'error', title: 'Error', message: result.msg ?? 'Something went wrong' });
      }
    } catch (e: any) {
      show({ type: 'error', title: 'Error', message: e.message ?? 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    await handleRequestOTP();
  };

  // ── OTP input handler ─────────────────────────────────────────────────────
  const handleOtpChange = (text: string, index: number) => {
    const val = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) otpRefs.current[index + 1]?.focus();
    if (!val && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ── Password strength indicator ───────────────────────────────────────────
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: colors.border };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
      { level: 1, label: 'Weak', color: colors.error },
      { level: 2, label: 'Fair', color: colors.warning },
      { level: 3, label: 'Good', color: colors.tint },
      { level: 4, label: 'Strong', color: colors.success },
    ];
    return levels[score - 1] ?? { level: 1, label: 'Weak', color: colors.error };
  };

  const strength = getStrength();

  // ── Back handler ──────────────────────────────────────────────────────────
  const handleBack = () => {
    if (screen === 'otp') { setScreen('email'); setOtp(['', '', '', '', '', '']); return; }
    if (screen === 'password') { setScreen('otp'); return; }
    router.back();
  };

  // ── Step indicator ────────────────────────────────────────────────────────
  const STEPS: Screen[] = ['email', 'otp', 'password'];
  const stepIndex = STEPS.indexOf(screen);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>

          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.inputBackground }]} onPress={handleBack}>
              <Ionicons name="chevron-back" size={22} color={colors.icon} />
            </TouchableOpacity>
            {/* Step dots */}
            <View style={styles.stepDots}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.stepDot,
                    { backgroundColor: i <= stepIndex ? colorWithAlpha(colors.tint, 0.35) : colors.border },
                    i === stepIndex && { backgroundColor: colors.buttonBackground },
                  ]}
                />
              ))}
            </View>
            <View style={{ width: 38 }} />
          </View>

          {/* ── SCREEN 1: Email ── */}
          {screen === 'email' && (
            <View style={styles.body}>
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: colorWithAlpha(colors.tint, 0.08),
                    borderColor: colorWithAlpha(colors.buttonBackground, 0.22),
                  },
                ]}
              >
                <MaterialIcons name="lock-reset" size={36} color={colors.buttonBackground} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
              <Text style={[styles.subtitle, { color: colors.mutedText }]}>
                Enter your registered email and we will send you a 6-digit reset code.
              </Text>

              <Text style={[styles.label, { color: colors.text }]}>Email address</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <MaterialIcons name="email" size={20} color={colors.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.mutedText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleRequestOTP}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.btn,
                  { backgroundColor: colors.tint },
                  loading && { backgroundColor: colors.mutedText },
                ]}
                onPress={handleRequestOTP}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={colors.background} />
                  : <Text style={[styles.btnText, { color: colors.background }]}>Send Reset Code</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.back()} style={styles.linkRow}>
                <Text style={[styles.link, { color: colors.tint }]}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── SCREEN 2: OTP ── */}
          {screen === 'otp' && (
            <View style={styles.body}>
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: colorWithAlpha(colors.tint, 0.08),
                    borderColor: colorWithAlpha(colors.buttonBackground, 0.22),
                  },
                ]}
              >
                <MaterialIcons name="mark-email-read" size={36} color={colors.buttonBackground} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Check Your Email</Text>
              <Text style={[styles.subtitle, { color: colors.mutedText }]}>
                We sent a 6-digit code to{'\n'}
                <Text style={[styles.emailHighlight, { color: colors.tint }]}>{email}</Text>
              </Text>

              {/* OTP boxes */}
              <View style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={ref => { otpRefs.current[i] = ref; }}
                    style={[
                      styles.otpBox,
                      { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      digit && { borderColor: colors.buttonBackground, backgroundColor: colorWithAlpha(colors.buttonBackground, 0.08) },
                    ]}
                    value={digit}
                    onChangeText={text => handleOtpChange(text, i)}
                    onKeyPress={e => handleOtpKeyPress(e, i)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.btn,
                  { backgroundColor: colors.tint },
                  loading && { backgroundColor: colors.mutedText },
                ]}
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={colors.background} />
                  : <Text style={[styles.btnText, { color: colors.background }]}>Verify Code</Text>
                }
              </TouchableOpacity>

              {/* Resend */}
              <View style={styles.resendRow}>
                <Text style={[styles.resendLabel, { color: colors.mutedText }]}>Did not receive the code? </Text>
                <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
                  <Text style={[styles.resendBtn, { color: colors.buttonBackground }, resendTimer > 0 && { color: colors.mutedText }]}>
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => { setScreen('email'); setOtp(['', '', '', '', '', '']); }}
                style={styles.linkRow}
              >
                <Text style={[styles.link, { color: colors.tint }]}>Change email address</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── SCREEN 3: New Password ── */}
          {screen === 'password' && (
            <View style={styles.body}>
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: colorWithAlpha(colors.tint, 0.08),
                    borderColor: colorWithAlpha(colors.buttonBackground, 0.22),
                  },
                ]}
              >
                <MaterialIcons name="lock-open" size={36} color={colors.buttonBackground} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Create New Password</Text>
              <Text style={[styles.subtitle, { color: colors.mutedText }]}>
                Your new password must be at least 8 characters and contain letters and numbers.
              </Text>

              {/* Password field */}
              <Text style={[styles.label, { color: colors.text }]}>New password</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <MaterialIcons name="lock" size={20} color={colors.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 44, color: colors.text }]}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.mutedText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPass(p => !p)}
                >
                  <Ionicons
                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.icon}
                  />
                </TouchableOpacity>
              </View>

              {/* Strength bar */}
              {password.length > 0 && (
                <View style={styles.strengthWrap}>
                  <View style={[styles.strengthBarBg, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.strengthBarFill,
                        {
                          width: `${(strength.level / 4) * 100}%` as any,
                          backgroundColor: strength.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                </View>
              )}

              {/* Confirm password */}
              <Text style={[styles.label, { color: colors.text }]}>Confirm password</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <MaterialIcons name="lock" size={20} color={colors.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 44, color: colors.text }]}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.mutedText}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirm(p => !p)}
                >
                  <Ionicons
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.icon}
                  />
                </TouchableOpacity>
              </View>

              {/* Match indicator */}
              {confirm.length > 0 && (
                <View style={styles.matchRow}>
                  <MaterialIcons
                    name={password === confirm ? 'check-circle' : 'cancel'}
                    size={15}
                    color={password === confirm ? colors.success : colors.error}
                  />
                  <Text style={{ fontSize: 12, color: password === confirm ? colors.success : colors.error, marginLeft: 4 }}>
                    {password === confirm ? 'Passwords match' : 'Passwords do not match'}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.btn,
                  { backgroundColor: colors.tint },
                  loading && { backgroundColor: colors.mutedText },
                ]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={colors.background} />
                  : <Text style={[styles.btnText, { color: colors.background }]}>Reset Password</Text>
                }
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FB' },
  container: { flex: 1, paddingTop: getStatusBarHeight() },
  scrollContent: { flexGrow: 1, paddingBottom: 30 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
  },
  stepDots: { flexDirection: 'row', gap: 8 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e5e7eb' },
  stepDotActive: { backgroundColor: brandColors.primaryNavy + '55' },
  stepDotCurrent: { backgroundColor: brandColors.goldCta, width: 22, borderRadius: 4 },

  // Body
  body: { flex: 1, padding: 24 },

  iconWrap: {
    width: 70, height: 70, borderRadius: 22,
    backgroundColor: brandColors.primaryNavy + '12',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1, borderColor: brandColors.goldCta + '33',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', lineHeight: 21, marginBottom: 28 },
  emailHighlight: { fontWeight: '700', color: brandColors.primaryNavy },

  label: {
    fontSize: 13, fontWeight: '700', color: '#374151',
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4,
  },

  // Input
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    position: 'relative',
  },
  inputIcon: { marginLeft: 14 },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111',
  },
  eyeBtn: {
    position: 'absolute', right: 14,
    height: '100%', justifyContent: 'center',
  },

  // OTP
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 28,
  },
  otpBox: {
    flex: 1,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    fontSize: 24,
    fontWeight: '800',
    color: brandColors.primaryNavy,
  },
  otpBoxFilled: {
    borderColor: brandColors.goldCta,
    backgroundColor: brandColors.goldCta + '0D',
  },

  // Strength
  strengthWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: -8 },
  strengthBarBg: { flex: 1, height: 5, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  strengthBarFill: { height: '100%', borderRadius: 3 },
  strengthLabel: { fontSize: 12, fontWeight: '700', width: 44 },

  // Match
  matchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: -8 },

  // Button
  btn: {
    backgroundColor: brandColors.primaryNavy,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: { backgroundColor: '#9ca3af' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Links
  linkRow: { alignItems: 'center', marginTop: 18 },
  link: { color: brandColors.primaryNavy, fontWeight: '700', fontSize: 14 },

  // Resend
  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  resendLabel: { fontSize: 13, color: '#888' },
  resendBtn: { fontSize: 13, fontWeight: '700', color: brandColors.goldCta },
  resendBtnDisabled: { color: '#aaa' },
});
