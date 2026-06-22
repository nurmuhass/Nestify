import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { brandColors, colorWithAlpha } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const { width: SW, height: SH } = Dimensions.get('window');

/* ─── Palette ────────────────────────────────────────────────── */
const NAVY2 = brandColors.primaryNavy;
const NAVY  = brandColors.secondaryText;
const GOLD  = brandColors.goldCta;
const GOLDT = brandColors.softGold;
const WHITE = '#ffffff';
const MUTED = 'rgba(255,255,255,0.50)';

/* ─── Slides ─────────────────────────────────────────────────── */
const SLIDES = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    tag:       'Find Your Home',
    headline:  'Discover Premium\nProperties',
    body:      'Browse thousands of verified listings across Nigeria — estates, duplexes, apartments and more.',
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=800',
    tag:       'Top Companies',
    headline:  'Connect With\nTrusted Agents',
    body:      'Work directly with Nigeria\'s top real estate companies and verified independent agents.',
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
    tag:       'List & Sell',
    headline:  'Sell or Rent\nWith Ease',
    body:      'List your property in minutes, reach thousands of serious buyers and tenants instantly.',
  },
];

/* ─── Dot indicator ──────────────────────────────────────────── */
function Dots({ total, active }: { total: number; active: number }) {
  const { colors } = useTheme();

  return (
    <View style={dot.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            dot.base,
            i === active
              ? [dot.active, { backgroundColor: colors.buttonBackground }]
              : [dot.inactive, { backgroundColor: colorWithAlpha(colors.text, 0.25) }],
          ]}
        />
      ))}
    </View>
  );
}
const dot = StyleSheet.create({
  row:      { flexDirection: 'row', gap: 6, alignItems: 'center' },
  base:     { borderRadius: 10, height: 6 },
  active:   { width: 22, backgroundColor: GOLD },
  inactive: { width: 6,  backgroundColor: 'rgba(255,255,255,0.25)' },
});

/* ─── Main Screen ────────────────────────────────────────────── */
export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [current, setCurrent] = useState(0);

  /* Animations */
  const imgAnim     = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const tagAnim     = useRef(new Animated.Value(0)).current;
  const btnAnim     = useRef(new Animated.Value(0)).current;

  /* Slide auto-advance */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  /* Animate on slide change */
  useEffect(() => {
    imgAnim.setValue(0);
    contentAnim.setValue(0);
    tagAnim.setValue(0);

    Animated.stagger(80, [
      Animated.timing(imgAnim,     { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(tagAnim,     { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [current]);

  /* Buttons fade in once on mount */
  useEffect(() => {
    Animated.timing(btnAnim, {
      toValue: 1,
      duration: 700,
      delay: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const slide = SLIDES[current];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* ── Background photo (fades on change) ── */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: imgAnim }]}>
        <Image
          source={{ uri: slide.image }}
          style={styles.bgPhoto}
          resizeMode="cover"
        />
      </Animated.View>

      {/* ── Gradient overlay ── */}
      <LinearGradient
        colors={[
          colorWithAlpha(brandColors.primaryNavy, 0.20),
          colorWithAlpha(brandColors.primaryNavy, 0.55),
          colorWithAlpha(colors.background, 0.88),
          colors.background,
        ]}
        locations={[0, 0.35, 0.65, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <View
            style={[
              styles.logoRing,
              {
                backgroundColor: colorWithAlpha(colors.buttonBackground, 0.18),
                borderColor: colorWithAlpha(colors.buttonBackground, 0.45),
              },
            ]}
          >
            <Ionicons name="home" size={18} color={colors.buttonBackground} />
          </View>
          <Text style={[styles.logoText, { color: colors.text }]}>Nestify</Text>
        </View>

        {/* Skip */}
        <TouchableOpacity
          style={[
            styles.skipBtn,
            {
              backgroundColor: colorWithAlpha(colors.cardBackground, 0.35),
              borderColor: colorWithAlpha(colors.border, 0.55),
            },
          ]}
          onPress={() => router.push('/Login')}
        >
          <Text style={[styles.skipText, { color: colors.mutedText }]}>Skip</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.mutedText} />
        </TouchableOpacity>
      </View>

      {/* ── Floating stat cards ── */}
      <View style={styles.statsRow}>
        {[
          { val: '10k+',  lbl: 'Properties' },
          { val: '4.9★',  lbl: 'Rating'     },
          { val: '2k+',   lbl: 'Agents'     },
        ].map((s) => (
          <View
            key={s.lbl}
            style={[
              styles.statCard,
              {
                backgroundColor: colorWithAlpha(colors.cardBackground, 0.35),
                borderColor: colorWithAlpha(colors.border, 0.55),
              },
            ]}
          >
            <Text style={[styles.statVal, { color: colors.text }]}>{s.val}</Text>
            <Text style={[styles.statLbl, { color: colors.mutedText }]}>{s.lbl}</Text>
          </View>
        ))}
      </View>

      {/* ── Slide content ── */}
      <View style={styles.content}>
        {/* Tag pill */}
        <Animated.View
          style={[
            styles.tagPill,
            {
              backgroundColor: colorWithAlpha(colors.buttonBackground, 0.15),
              borderColor: colorWithAlpha(colors.buttonBackground, 0.35),
            },
            {
              opacity: tagAnim,
              transform: [{
                translateY: tagAnim.interpolate({
                  inputRange: [0, 1], outputRange: [10, 0],
                }),
              }],
            },
          ]}
        >
          <View style={[styles.tagDot, { backgroundColor: colors.buttonBackground }]} />
          <Text style={[styles.tagText, { color: colors.warning }]}>{slide.tag}</Text>
        </Animated.View>

        {/* Headline */}
        <Animated.Text
          style={[
            styles.headline,
            { color: colors.text },
            {
              opacity: contentAnim,
              transform: [{
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1], outputRange: [20, 0],
                }),
              }],
            },
          ]}
        >
          {slide.headline}
        </Animated.Text>

        {/* Body */}
        <Animated.Text
          style={[
            styles.body,
            { color: colors.mutedText },
            {
              opacity: contentAnim,
              transform: [{
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1], outputRange: [14, 0],
                }),
              }],
            },
          ]}
        >
          {slide.body}
        </Animated.Text>

        {/* Dots */}
        <View style={styles.dotsRow}>
          <Dots total={SLIDES.length} active={current} />

          {/* Manual next */}
          <TouchableOpacity
            style={[styles.nextDot, { backgroundColor: colors.buttonBackground }]}
            onPress={() => setCurrent((p) => (p + 1) % SLIDES.length)}
          >
            <Ionicons name="arrow-forward" size={16} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── CTA buttons ── */}
      <Animated.View
        style={[
          styles.btns,
          {
            opacity: btnAnim,
            transform: [{
              translateY: btnAnim.interpolate({
                inputRange: [0, 1], outputRange: [30, 0],
              }),
            }],
          },
        ]}
      >
        {/* Primary — Get Started */}
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, shadowColor: colors.buttonBackground }]}
          activeOpacity={0.85}
          onPress={() => router.push('/Register')}
        >
          <Text style={[styles.primaryText, { color: colors.background }]}>Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.background} />
        </TouchableOpacity>

        {/* Secondary — Sign In */}
        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colorWithAlpha(colors.border, 0.65) }]}
          activeOpacity={0.8}
          onPress={() => router.push('/Login')}
        >
          <Text style={[styles.secondaryText, { color: colors.mutedText }]}>
            Already have an account?{' '}
            <Text style={[styles.secondaryTextGold, { color: colors.buttonBackground }]}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NAVY2,
  },

  bgPhoto: {
    width: SW,
    height: SH,
    position: 'absolute',
  },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: getStatusBarHeight() + 12,
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoRing: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(201,168,76,0.18)',
    borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    fontSize: 18, fontWeight: '700',
    color: WHITE, letterSpacing: -0.2,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  skipText: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '500',
  },

  /* Floating stats */
  statsRow: {
    position: 'absolute',
    top: getStatusBarHeight() + 80,
    right: 22,
    gap: 10,
    alignItems: 'flex-end',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 72,
  },
  statVal: {
    fontSize: 16, fontWeight: '700',
    color: WHITE, lineHeight: 18,
  },
  statLbl: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
    fontWeight: '300',
  },

  /* Slide content */
  content: {
    position: 'absolute',
    bottom: 210,
    left: 0, right: 0,
    paddingHorizontal: 26,
  },

  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.35)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  tagDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: GOLD,
  },
  tagText: {
    fontSize: 11, color: GOLDT,
    fontWeight: '600', letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  headline: {
    fontSize: 40, fontWeight: '800',
    color: WHITE, lineHeight: 44,
    letterSpacing: -1, marginBottom: 12,
  },
  body: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 21,
    fontWeight: '300',
    marginBottom: 24,
    maxWidth: '85%',
  },

  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextDot: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: GOLD,
    alignItems: 'center', justifyContent: 'center',
  },

  /* CTA Buttons */
  btns: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 28,
    left: 24, right: 24,
    gap: 12,
  },

  primaryBtn: {
    backgroundColor: GOLD,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: GOLD,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  primaryText: {
    fontSize: 15, fontWeight: '700',
    color: NAVY2, letterSpacing: 0.3,
  },

  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '400',
  },
  secondaryTextGold: {
    color: GOLD,
    fontWeight: '700',
  },
});
