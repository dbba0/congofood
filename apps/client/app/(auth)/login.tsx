// Écran de connexion — saisie numéro congolais + envoi OTP
import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { API, DEV_MODE } from '../../constants/api';

export default function LoginScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fullPhone = `+243${phone}`;
  const canSubmit = phone.replace(/\s/g, '').length >= 9 && !loading;

  const handleSendOtp = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      // TODO : appeler POST /api/auth/otp/send en production
      if (!DEV_MODE) {
        const res = await fetch(API.sendOtp, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: fullPhone }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Erreur réseau');
      }
      router.push({ pathname: '/(auth)/otp-verify', params: { phone: fullPhone } });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Impossible d'envoyer le code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🍔</Text>
          </View>
        </Animated.View>

        {/* Titre */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={styles.title}>Bienvenue sur{'\n'}CongoFood</Text>
          <Text style={styles.subtitle}>
            Commandez vos plats préférés,{'\n'}livrés chez vous à Kinshasa
          </Text>
        </Animated.View>

        {DEV_MODE && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.devBanner}>
            <Text style={styles.devText}>⚙️ Mode dev — OTP ignoré · code: 000000</Text>
          </Animated.View>
        )}

        {/* Champ téléphone */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.fieldWrap}>
          <Text style={styles.label}>NUMÉRO DE TÉLÉPHONE</Text>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.inputRow, focused && styles.inputRowFocused, error ? styles.inputRowError : undefined]}
            onPress={() => inputRef.current?.focus()}
          >
            <Text style={styles.flag}>🇨🇩</Text>
            <Text style={styles.prefix}>+243</Text>
            <View style={styles.divider} />
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={phone}
              onChangeText={(t) => {
                setError('');
                setPhone(t.replace(/[^0-9\s]/g, ''));
              }}
              placeholder="8X XXX XXXX"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={12}
            />
          </TouchableOpacity>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </Animated.View>

        {/* Bouton CTA */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.btnWrap}>
          <TouchableOpacity
            style={[styles.cta, !canSubmit && styles.ctaDisabled]}
            onPress={handleSendOtp}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={Colors.textInverse} />
              : <Text style={styles.ctaText}>Recevoir le code →</Text>
            }
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.hint}>
            Vous avez déjà un compte ?{' '}
            <Text style={styles.hintLink} onPress={handleSendOtp}>
              Connexion
            </Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
    paddingBottom: Spacing['2xl'],
  },
  logoWrap: {
    alignItems: 'center' as const,
    marginBottom: Spacing['2xl'],
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.orange,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.textPrimary,
    textAlign: 'center' as const,
    lineHeight: 36,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: Spacing['3xl'],
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
  fieldWrap: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 56,
  },
  inputRowFocused: {
    borderColor: Colors.orange,
  },
  inputRowError: {
    borderColor: Colors.error,
  },
  flag: {
    fontSize: 20,
    marginRight: Spacing.xs,
  },
  prefix: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    height: '100%' as const,
  },
  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  btnWrap: {
    marginBottom: Spacing.xl,
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
  hint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  hintLink: {
    color: Colors.orange,
    fontFamily: 'DMSans_500Medium',
  },
};
