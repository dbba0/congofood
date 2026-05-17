import { useState } from 'react';
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
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

export default function LivreurLoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = phone.replace(/\D/g, '').length >= 9;

  async function handleSend() {
    if (!isValid || loading) return;
    setLoading(true);

    // TODO : appeler POST /api/auth/otp/send { phone: fullPhone }
    await new Promise((r) => setTimeout(r, 600)); // simulation réseau

    setLoading(false);
    router.push({
      pathname: '/(auth)/otp-verify',
      params: { phone: `+243${phone.replace(/\D/g, '')}` },
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <Text style={styles.logoTitle}>CongoFood</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Espace Livreur</Text>
            </View>
          </View>
          <Text style={styles.tagline}>Livrez plus vite, gagnez plus.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Connexion</Text>
          <Text style={styles.formSubtitle}>
            Entrez votre numéro pour recevoir un code de vérification
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>🇨🇩 +243</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="81 234 5678"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={13}
              returnKeyType="done"
              onSubmitEditing={handleSend}
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.cta, !isValid && styles.ctaDisabled]}
            onPress={handleSend}
            disabled={!isValid || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textInverse} size="small" />
            ) : (
              <Text style={styles.ctaText}>Recevoir le code</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.terms}>
          En continuant, vous acceptez les{' '}
          <Text style={styles.termsLink}>Conditions d'utilisation</Text> et la{' '}
          <Text style={styles.termsLink}>Politique de confidentialité</Text>
        </Text>
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
    justifyContent: 'space-between',
    paddingTop: Spacing['4xl'],
    paddingBottom: Spacing['2xl'],
  },
  logoArea: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoTitle: {
    fontSize: Typography.fontSize['3xl'],
    color: Colors.orange,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  badgeText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    gap: Spacing.base,
  },
  formTitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  formSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
    marginTop: -Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  prefix: {
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
  },
  prefixText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.base,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  cta: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base + 2,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
  },
  terms: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.fontSize.xs * Typography.lineHeight.relaxed,
  },
  termsLink: {
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
