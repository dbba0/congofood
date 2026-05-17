import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { saveSession } from '../../lib/storage';
import type { AuthUser, AuthTokens } from '@congofood/types';

const OTP_LENGTH = 6;

export default function OtpVerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  const { setUser } = useAuthStore();

  const fullCode = code.join('');
  const isComplete = fullCode.length === OTP_LENGTH;

  function handleChange(text: string, index: number) {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setError('');

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !code[index] && index > 0) {
      const next = [...code];
      next[index - 1] = '';
      setCode(next);
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    if (!isComplete || loading) return;
    setLoading(true);
    setError('');

    // TODO : appeler POST /api/auth/otp/verify { phone, code: fullCode }
    await new Promise((r) => setTimeout(r, 800)); // simulation réseau

    // Mock : tout code à 6 chiffres est accepté en dev
    const mockUser: AuthUser = {
      _id: `livreur_${phone?.replace(/\D/g, '') ?? 'unknown'}`,
      phone: phone ?? '',
      name: 'Livreur CongoFood',
      role: 'livreur',
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    const mockTokens: AuthTokens = {
      accessToken: `mock_access_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      expiresIn: 3600,
    };

    await saveSession(mockUser, mockTokens);
    setUser(mockUser, mockTokens);
    // La redirection vers /(tabs)/dashboard est gérée par (auth)/_layout.tsx
  }

  async function handleResend() {
    // TODO : rappeler POST /api/auth/otp/send { phone }
    setCode(Array(OTP_LENGTH).fill(''));
    setError('');
    inputRefs.current[0]?.focus();
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* Header */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Vérification</Text>
          <Text style={styles.subtitle}>
            Code envoyé au{'\n'}
            <Text style={styles.phoneHighlight}>{phone}</Text>
          </Text>

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <TextInput
                key={i}
                ref={(ref) => {
                  inputRefs.current[i] = ref;
                }}
                style={[
                  styles.otpBox,
                  code[i] ? styles.otpBoxFilled : null,
                  error ? styles.otpBoxError : null,
                ]}
                value={code[i]}
                onChangeText={(text) => handleChange(text, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
                autoFocus={i === 0}
              />
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Verify button */}
          <TouchableOpacity
            style={[styles.cta, !isComplete && styles.ctaDisabled]}
            onPress={handleVerify}
            disabled={!isComplete || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textInverse} size="small" />
            ) : (
              <Text style={styles.ctaText}>Vérifier</Text>
            )}
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Vous n'avez pas reçu le code ? </Text>
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Renvoyer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: Spacing['2xl'],
  },
  backText: {
    color: Colors.lime,
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  content: {
    gap: Spacing.base,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  phoneHighlight: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  otpRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
  },
  otpBox: {
    flex: 1,
    height: 58,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  otpBoxFilled: {
    borderColor: Colors.lime,
    backgroundColor: Colors.surfaceElevated,
  },
  otpBoxError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    textAlign: 'center',
  },
  cta: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base + 2,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  resendLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  resendLink: {
    fontSize: Typography.fontSize.sm,
    color: Colors.lime,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
