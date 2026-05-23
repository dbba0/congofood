// Écran checkout — adresse, méthode de paiement, confirmation commande
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { StorageService, STORAGE_KEYS } from '../lib/storage';
import { apiRequest } from '../lib/apiClient';
import { API } from '../constants/api';
import type { PaymentMethod } from '@wapi/types';

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  emoji: string;
  recommended?: boolean;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'airtel_money',  label: 'Airtel Money',  emoji: '📱', recommended: true },
  { id: 'orange_money',  label: 'Orange Money',  emoji: '🟠' },
  { id: 'mpesa',         label: 'M-Pesa',        emoji: '💚' },
  { id: 'cash',          label: 'Cash',          emoji: '💵' },
];

const LIVRAISON_FEE = 1500;

export default function CheckoutScreen() {
  const router = useRouter();
  const { note } = useLocalSearchParams<{ note?: string }>();
  const { user } = useAuthStore();
  const { items, total, currency, restaurantId, clearCart } = useCartStore((s) => ({
    items: s.items,
    total: s.total(),
    currency: s.currency,
    restaurantId: s.restaurantId,
    clearCart: s.clearCart,
  }));

  const [quartier, setQuartier] = useState('Gombe');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    StorageService.get(STORAGE_KEYS.QUARTER).then((q) => { if (q) setQuartier(q); });
  }, []);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('airtel_money');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const grandTotal = total + LIVRAISON_FEE;

  const handleConfirm = async () => {
    if (!restaurantId || items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const body = {
        restaurantId,
        items: items.map((i) => ({
          product:         i.product._id,
          name:            i.product.name,
          price:           i.unitPrice,
          qty:             i.qty,
          selectedOptions: i.selectedOptions,
        })),
        deliveryAddress: {
          label:        quartier,
          instructions: instructions || undefined,
          coords:       { lat: -4.3229, lng: 15.3222 }, // Coordonnées Kinshasa centre
        },
        paymentMethod,
        notes: note || undefined,
      };

      const data = await apiRequest<{ order: { _id: string } }>(API.orders, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      clearCart();
      router.replace(`/order/${data.order._id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Section adresse */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          <View style={styles.addressCard}>
            {/* Placeholder carte — MapLibre prévu phase 2 */}
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapEmoji}>🗺️</Text>
              <Text style={styles.mapLabel}>Kinshasa · {quartier}</Text>
            </View>
            <View style={styles.addressInfo}>
              <Ionicons name="location" size={16} color={Colors.orange} />
              <Text style={styles.addressText}>{quartier}, Kinshasa</Text>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() => router.push('/(auth)/select-quarter')}
              >
                <Text style={styles.adjustBtnText}>Ajuster</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TextInput
            style={styles.instructionsInput}
            placeholder="Instructions (portail bleu, 2e étage...)"
            placeholderTextColor={Colors.textMuted}
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Section paiement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          {PAYMENT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.paymentOption,
                paymentMethod === option.id && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod(option.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.paymentEmoji}>{option.emoji}</Text>
              <Text style={styles.paymentLabel}>{option.label}</Text>
              {option.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommandé</Text>
                </View>
              )}
              <View style={[
                styles.radio,
                paymentMethod === option.id && styles.radioSelected,
              ]}>
                {paymentMethod === option.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Récap commande */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>
          <View style={styles.recapCard}>
            {items.map((item) => (
              <View key={item.product._id} style={styles.recapItem}>
                <Text style={styles.recapQty}>{item.qty}×</Text>
                <Text style={styles.recapName} numberOfLines={1}>{item.product.name}</Text>
                <Text style={styles.recapPrice}>
                  {(item.unitPrice * item.qty).toLocaleString('fr-CD')}
                </Text>
              </View>
            ))}
            <View style={styles.separator} />
            <View style={styles.recapItem}>
              <Text style={[styles.recapName, { color: Colors.textSecondary }]}>
                Livraison
              </Text>
              <Text style={styles.recapPrice}>
                {LIVRAISON_FEE.toLocaleString('fr-CD')}
              </Text>
            </View>
            <View style={[styles.recapItem, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {grandTotal.toLocaleString('fr-CD')} {currency}
              </Text>
            </View>
          </View>
        </View>

        {/* Aide WhatsApp */}
        <TouchableOpacity
          style={styles.whatsappHelp}
          onPress={() =>
            Linking.openURL('https://wa.me/243000000000?text=Besoin+d%27aide+pour+ma+commande')
          }
        >
          <Text style={styles.whatsappText}>💬 Besoin d'aide ? WhatsApp</Text>
        </TouchableOpacity>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bouton confirmer sticky */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, loading && styles.ctaDisabled]}
          onPress={handleConfirm}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={Colors.textInverse} />
            : (
              <Text style={styles.ctaText}>
                Confirmer la commande · {grandTotal.toLocaleString('fr-CD')} {currency}
              </Text>
            )
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.base,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  addressCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  mapLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  addressText: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  adjustBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.orange,
  },
  adjustBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.orange,
  },
  instructionsInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    minHeight: 56,
  },
  paymentOptionSelected: {
    borderColor: Colors.orange,
    backgroundColor: `${Colors.orange}12`,
  },
  paymentEmoji: {
    fontSize: 22,
  },
  paymentLabel: {
    flex: 1,
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  recommendedBadge: {
    backgroundColor: `${Colors.orange}30`,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  recommendedText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.orange,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.orange,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.orange,
  },
  recapCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  recapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  recapQty: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    width: 24,
  },
  recapName: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  recapPrice: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  totalRow: {
    paddingTop: Spacing.sm,
  },
  totalLabel: {
    flex: 1,
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.md,
    color: Colors.lime,
  },
  whatsappHelp: {
    alignItems: 'center',
    paddingVertical: Spacing.base,
  },
  whatsappText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: '#25D366',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  footer: {
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cta: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.lg,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.textInverse,
    textAlign: 'center',
  },
} as const;
