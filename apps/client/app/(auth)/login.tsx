// Écran de connexion — saisie numéro multi-pays + envoi OTP
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
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { API, DEV_MODE } from '../../constants/api';

// --- Données pays ---
interface Country {
  code: string;       // ISO 2
  flag: string;
  name: string;
  dialCode: string;   // avec +
  digits: number;     // longueur attendue du numéro local
  placeholder: string;
}

const COUNTRIES: Country[] = [
  { code: 'CD', flag: '🇨🇩', name: 'Congo (RDC)',        dialCode: '+243', digits: 9,  placeholder: '8X XXX XXXX' },
  { code: 'CG', flag: '🇨🇬', name: 'Congo (Brazzaville)',dialCode: '+242', digits: 9,  placeholder: '0X XXX XXXX' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada',             dialCode: '+1',   digits: 10, placeholder: '438 555 1234' },
  { code: 'SN', flag: '🇸🇳', name: 'Sénégal',            dialCode: '+221', digits: 9,  placeholder: '7X XXX XXXX' },
  { code: 'CI', flag: '🇨🇮', name: 'Côte d\'Ivoire',     dialCode: '+225', digits: 10, placeholder: '07 XX XX XXXX' },
  { code: 'CM', flag: '🇨🇲', name: 'Cameroun',           dialCode: '+237', digits: 9,  placeholder: '6X XXX XXXX' },
];

export default function LoginScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = `${country.dialCode}${cleanPhone}`;
  const canSubmit = cleanPhone.length >= country.digits && !loading;

  const handleSendOtp = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(API.sendOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      console.log('[Login] send-otp réponse:', JSON.stringify(data).slice(0, 150));
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur réseau');
      }
      router.push({ pathname: '/(auth)/otp-verify', params: { phone: fullPhone } });
    } catch (e: unknown) {
      clearTimeout(timeoutId);
      if (e instanceof Error && e.name === 'AbortError') {
        setError('Serveur en démarrage... Réessaie dans 30 secondes');
      } else {
        setError(e instanceof Error ? e.message : "Impossible d'envoyer le code");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectCountry = (c: Country) => {
    setCountry(c);
    setShowPicker(false);
    setPhone('');
    setError('');
    setTimeout(() => inputRef.current?.focus(), 150);
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
          <Text style={styles.title}>Bienvenue sur{'\n'}Wapi</Text>
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
          <View
            style={[
              styles.inputRow,
              focused && styles.inputRowFocused,
              error ? styles.inputRowError : undefined,
            ]}
          >
            {/* Sélecteur pays */}
            <TouchableOpacity
              style={styles.countryBtn}
              onPress={() => setShowPicker(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Text style={styles.flag}>{country.flag}</Text>
              <Text style={styles.prefix}>{country.dialCode}</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TextInput
              ref={inputRef}
              style={styles.input}
              value={phone}
              onChangeText={(t) => {
                setError('');
                setPhone(t.replace(/[^0-9\s]/g, ''));
              }}
              placeholder={country.placeholder}
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={country.digits + 3}
            />
          </View>
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

      {/* Modal sélection pays */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choisir un pays</Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(c) => c.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isActive = item.code === country.code;
                return (
                  <TouchableOpacity
                    style={[styles.countryRow, isActive && styles.countryRowActive]}
                    onPress={() => selectCountry(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.countryFlag}>{item.flag}</Text>
                    <View style={styles.countryInfo}>
                      <Text style={styles.countryName}>{item.name}</Text>
                      <Text style={styles.countryDial}>{item.dialCode}</Text>
                    </View>
                    {isActive && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.orange} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  countryBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingRight: Spacing.sm,
  },
  flag: {
    fontSize: 20,
  },
  prefix: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
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
  // --- Modal pays ---
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end' as const,
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: 40,
    maxHeight: '60%' as const,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center' as const,
    marginTop: Spacing.sm,
    marginBottom: Spacing.base,
  },
  modalTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
  },
  countryRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  countryRowActive: {
    backgroundColor: Colors.surfaceElevated,
  },
  countryFlag: {
    fontSize: 28,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  countryDial: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
};
