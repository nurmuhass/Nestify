import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const { width: SW } = Dimensions.get('window');

/* ─── Types ──────────────────────────────────────────────────── */
type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastConfig = {
  type:     ToastType;
  title:    string;
  message?: string;
  duration?: number;         // ms — default 3500
  action?: {
    label:   string;
    onPress: () => void;
  };
};

type ToastContextValue = {
  show: (config: ToastConfig) => void;
};

/* ─── Context ────────────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue>({ show: () => {} });

/* ─── Theme per type ─────────────────────────────────────────── */
const THEME: Record<ToastType, {
  bg:       string;
  border:   string;
  icon:     string;
  iconBg:   string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
}> = {
  success: {
    bg:       '#0a1f0f',
    border:   'rgba(34,197,94,0.25)',
    icon:     '#22c55e',
    iconBg:   'rgba(34,197,94,0.12)',
    iconName: 'checkmark-circle',
  },
  error: {
    bg:       '#1a0a0a',
    border:   'rgba(239,68,68,0.25)',
    icon:     '#ef4444',
    iconBg:   'rgba(239,68,68,0.12)',
    iconName: 'close-circle',
  },
  warning: {
    bg:       '#1a1200',
    border:   'rgba(201,168,76,0.30)',
    icon:     '#c9a84c',
    iconBg:   'rgba(201,168,76,0.12)',
    iconName: 'warning',
  },
  info: {
    bg:       '#091530',
    border:   'rgba(59,130,246,0.25)',
    icon:     '#3b82f6',
    iconBg:   'rgba(59,130,246,0.12)',
    iconName: 'information-circle',
  },
};

/* ─── Single Toast ───────────────────────────────────────────── */
type ToastItem = ToastConfig & { id: number };

function Toast({
  item,
  onDismiss,
}: {
  item:      ToastItem;
  onDismiss: (id: number) => void;
}) {
  const theme     = THEME[item.type];
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.92)).current;
  const progress   = useRef(new Animated.Value(1)).current;
  const timer      = useRef<ReturnType<typeof setTimeout>>();

  const dismiss = useCallback(() => {
    clearTimeout(timer.current);
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 280, useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 0,    duration: 280, useNativeDriver: true }),
      Animated.timing(scale,      { toValue: 0.92, duration: 280, useNativeDriver: true }),
    ]).start(() => onDismiss(item.id));
  }, [item.id, onDismiss]);

  React.useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0,  useNativeDriver: true, damping: 18, stiffness: 200 }),
      Animated.timing(opacity,    { toValue: 1,  duration: 260, useNativeDriver: true }),
      Animated.spring(scale,      { toValue: 1,  useNativeDriver: true, damping: 18, stiffness: 200 }),
    ]).start();

    // Progress bar drain
    const dur = item.duration ?? 3500;
    Animated.timing(progress, {
      toValue: 0,
      duration: dur,
      useNativeDriver: false,
    }).start();

    // Auto dismiss
    timer.current = setTimeout(dismiss, dur);
    return () => clearTimeout(timer.current);
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: theme.bg,
          borderColor:      theme.border,
          transform:        [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      {/* Left accent line */}
      <View style={[styles.accentLine, { backgroundColor: theme.icon }]} />

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: theme.iconBg }]}>
        <Ionicons name={theme.iconName} size={20} color={theme.icon} />
      </View>

      {/* Text */}
      <View style={styles.textWrap}>
        <Text style={styles.toastTitle}>{item.title}</Text>
        {item.message ? (
          <Text style={styles.toastMsg} numberOfLines={2}>{item.message}</Text>
        ) : null}

        {/* Action button */}
        {item.action ? (
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: theme.icon }]}
            onPress={() => { item.action!.onPress(); dismiss(); }}
            activeOpacity={0.75}
          >
            <Text style={[styles.actionText, { color: theme.icon }]}>
              {item.action.label}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Close */}
      <TouchableOpacity style={styles.closeBtn} onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close" size={16} color="rgba(255,255,255,0.35)" />
      </TouchableOpacity>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[styles.progressBar, { width: progressWidth, backgroundColor: theme.icon }]}
        />
      </View>
    </Animated.View>
  );
}

/* ─── Provider ───────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const show = useCallback((config: ToastConfig) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev.slice(-2), { ...config, id }]); // max 3 at once
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((t) => (
          <Toast key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────────────────── */
export function useToast() {
  return useContext(ToastContext);
}

/* ─── Convenience helpers (mirrors Alert.alert API feel) ─────── */
export const Toast$ = {
  success: (title: string, message?: string, action?: ToastConfig['action']) =>
    ({ show }: ToastContextValue) =>
      show({ type: 'success', title, message, action }),

  error: (title: string, message?: string, action?: ToastConfig['action']) =>
    ({ show }: ToastContextValue) =>
      show({ type: 'error', title, message, action }),

  warning: (title: string, message?: string) =>
    ({ show }: ToastContextValue) =>
      show({ type: 'warning', title, message }),

  info: (title: string, message?: string) =>
    ({ show }: ToastContextValue) =>
      show({ type: 'info', title, message }),
};

/* ─── Styles ─────────────────────────────────────────────────── */
const SB = getStatusBarHeight();

const styles = StyleSheet.create({
  container: {
    position:  'absolute',
    top:       SB + (Platform.OS === 'ios' ? 8 : 12),
    left:      16,
    right:     16,
    zIndex:    9999,
    gap:       10,
    pointerEvents: 'box-none',
  },

  toast: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    borderRadius:   18,
    borderWidth:    1,
    paddingVertical: 14,
    paddingRight:   14,
    paddingLeft:    0,
    overflow:       'hidden',
    gap:            12,
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: 8 },
        shadowOpacity: 0.40,
        shadowRadius:  20,
      },
      android: { elevation: 14 },
    }),
  },

  accentLine: {
    width:        3,
    alignSelf:    'stretch',
    borderRadius: 0,
    marginLeft:   0,
    flexShrink:   0,
  },

  iconWrap: {
    width:          36,
    height:         36,
    borderRadius:   10,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    marginLeft:     10,
  },

  textWrap: {
    flex:     1,
    gap:      3,
    paddingTop: 1,
  },

  toastTitle: {
    fontSize:   14,
    fontWeight: '600',
    color:      '#ffffff',
    lineHeight: 18,
  },
  toastMsg: {
    fontSize:   12,
    color:      'rgba(255,255,255,0.52)',
    lineHeight: 17,
    fontWeight: '300',
  },

  actionBtn: {
    alignSelf:      'flex-start',
    marginTop:      6,
    borderWidth:    1,
    borderRadius:   8,
    paddingHorizontal: 10,
    paddingVertical:    4,
  },
  actionText: {
    fontSize:   12,
    fontWeight: '600',
  },

  closeBtn: {
    paddingTop: 2,
    flexShrink: 0,
  },

  progressTrack: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    height:          2,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  progressBar: {
    height:       '100%',
    borderRadius: 1,
  },
});
