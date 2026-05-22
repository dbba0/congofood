// Écran vérification OTP — 6 cases avec auto-focus et shake sur erreur
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { API, DEV_MODE } from '../../constants/api';
import { StorageService, STORAGE_KEYS } from '../../lib/storage';
import { useAuthStore } from '../../store/authStore';
import type { AuthUser, AuthTokens } from '@congofood/types';

const OTP_LENGTH = 6;
const TIMER_SECONDS = 45;
const DEV_CODE = '000000';

export default function OtpVerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { setUser } = useAuthStore();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  }, [shakeX]);

  const handleVerify = useCallback(async (code: string) => {
    if (code.length < OTP_LENGTH) return;
    setLoading(true);
    setError('');
    try {
      let user: AuthUser;
      let tokens: AuthTokens;
      let isNewUser: boolean;

      if (DEV_MODE) {
        // TODO : appeler POST /api/auth/otp/verify en production
        if (code !== DEV_CODE) throw new Error(`Code dev: ${DEV_CODE}`);
        user = {
          _id: 'dev-user-001',
          phone: phone ?? '+243800000000',
          name: 'Utilisateur Dev',
          role: 'client',
          isVerified: true,
          createdAt: new Date().toISOString(),
        };
        tokens = {
          accessToken: 'dev-access-token',
          refreshToken: 'dev-refresh-token',
          expiresIn: 900,
        };
        isNewUser = false;
      } else {
        const res = await fetch(API.verifyOtp, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, code }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Code incorrect');
        ({ user, tokens, isNewUser } = data.data as {
          user: AuthUser;
          tokens: AuthTokens;
          isNewUser: boolean;
        });
      }

      await StorageService.set(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      await StorageService.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      await StorageService.setJSON(STORAGE_KEYS.USER, user);

      setUser(user, tokens);

      if (isNewUser) {
        router.replace('/(auth)/select-quarter');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Code incorrect';
      setError(msg);
      triggerShake();
      setDigits(Array(OTP_LENGTH).fill(''));
      setActiveIndex(0);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  }, [phone, setUser, router, triggerShake]);

  const handleDigitChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...digits];
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const newDigits = [...Array(OTP_LENGTH).fill('')];
      pasted.split('').forEach((c, i) => { newDigits[i] = c; });
      setDigits(newDigits);
      const next = Math.min(pasted.length, OTP_LENGTH - 1);
      setActiveIndex(next);
      inputRefs.current[next]?.focus();
      if (pasted.length === OTP_LENGTH) handleVerify(pasted);
      return;
    }
    updated[index] = value;
    setDigits(updated);
    if (value && index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
    const code = updated.join('');
    if (code.length === OTP_LENGTH) handleVerify(code);
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const updated = [...digits];
      updated[index - 1] = '';
      setDigits(updated);
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    try {
      if (!DEV_MODE) {
        await fetch(API.sendOtp, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });
      }
      setTimer(TIMER_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(''));
      setActiveIndex(0);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setResending(false);
    }
  };

  const timerLabel = timer > 0 ? `0:${String(timer).padStart(2, '0')}` : null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.back}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <Animated.View entering={FadeInDown.duration(400)} style={styles.content}>
        <Text style={styles.title}>Code de vérification</Text>
        <Text style={styles.subtitle}>
          Code envoyé au{' '}
          <Text style={styles.phoneHighlight}>{phone}</Text>
        </Text>

        {DEV_MODE && (
          <View style={styles.devBanner}>
            <Text style={styles.devText}>⚙️ Mode dev — saisir <Text style={styles.devCode}>{DEV_CODE}</Text></Text>
          </View>
        )}

        <Animated.View style={[styles.otpRow, shakeStyle]}>
          {digits.map((digit, i) => (
            <Pressable
              key={i}
              onPress={() => { setActiveIndex(i); inputRefs.current[i]?.focus(); }}
            >
              <TextInput
                ref={(r) => { inputRefs.current[i] = r; }}
                style={[
                  styles.otpBox,
                  activeIndex === i && styles.otpBoxActive,
                  !!digit && styles.otpBoxFilled,
                  !!error && styles.otpBoxError,
                ]}
                value={digit}
                onChangeText={(v) => handleDigitChange(v, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                onFocus={() => setActiveIndex(i)}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                selectTextOnFocus
                caretHidden
                autoFocus={i === 0}
              />
            </Pressable>
          ))}
        </Animated.View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.resendRow}>
          {timerLabel
            ? (
              <Text style={styles.timerText}>
                Renvoyer dans{' '}
                <Text style={styles.timerHighlight}>{timerLabel}</Text>
              </Text>
            )
            : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                <Text style={styles.resendLink}>
                  {resending ? 'Envoi...' : 'Renvoyer le code'}
                </Text>
              </TouchableOpacity>
            )
          }
        </View>

        <TouchableOpacity
          style={[styles.cta, digits.join('').length < OTP_LENGTH && styles.ctaDisabled]}
          onPress={() => handleVerify(digits.join(''))}
          disabled={digits.join('').length < OTP_LENGTH || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={Colors.textInverse} />
            : <Text style={styles.ctaText}>Confirmer</Text>
          }
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  back: {
    marginTop: 48,
    marginBottom: Spacing.xl,
    width: 44,
    height: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing['2xl'],
    lineHeight: 22,
  },
  phoneHighlight: {
    color: Colors.orange,
    fontFamily: 'DMSans_500Medium',
  },
  devBanner: {
    backgroundColor: '#1A2E1A',
    borderWidth: 1,
    borderColor: '#2D5A2D',
    borderRadius: BorderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: Spacing.xl,
  },
  devText: {
    fontSize: 12,
    color: '#22C55E',
    textAlign: 'center' as const,
    fontFamily: 'DMSans_400Regular',
  },
  devCode: {
    fontFamily: 'DMSans_500Medium' as const,
    color: Colors.lime,
  },
  otpRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: Spacing.base,
  },
  otpBox: {
    width: 52,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    textAlign: 'center' as const,
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    fontFamily: 'Syne_700Bold',
  },
  otpBoxActive: {
    borderColor: Colors.orange,
    backgroundColor: Colors.surface,
  },
  otpBoxFilled: {
    borderColor: Colors.orange,
  },
  otpBoxError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    marginBottom: Spacing.base,
    textAlign: 'center' as const,
  },
  resendRow: {
    alignItems: 'center' as const,
    marginBottom: Spacing['2xl'],
  },
  timerText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  timerHighlight: {
    color: Colors.orange,
    fontFamily: 'DMSans_500Medium',
  },
  resendLink: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.orange,
    textDecorationLine: 'underline' as const,
  },
  cta: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.lg,
    height: 56,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.textInverse,
  },
};
