// Écran panier — liste articles, contrôles quantité, note, récap CDF
import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { useCartStore } from '../store/cartStore';
import { EmptyState } from '@congofood/ui';

const LIVRAISON_FEE = 1500; // CDF

export default function CartScreen() {
  const router = useRouter();
  const { items, total, currency, updateQty, removeItem, clearCart } = useCartStore((s) => ({
    items: s.items,
    total: s.total(),
    currency: s.currency,
    updateQty: s.updateQty,
    removeItem: s.removeItem,
    clearCart: s.clearCart,
  }));
  const [note, setNote] = useState('');

  const subtotal = total;
  const grandTotal = subtotal + LIVRAISON_FEE;

  if (items.length === 0) {
    return (
      <View style={styles.emptyRoot}>
        <EmptyState
          emoji="🛒"
          title="Panier vide"
          subtitle="Ajoutez des produits pour passer commande"
          actionLabel="Explorer les restaurants"
          onAction={() => router.replace('/(tabs)/home')}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Mon panier · <Text style={styles.headerCount}>{items.length} article{items.length > 1 ? 's' : ''}</Text>
        </Text>
        <TouchableOpacity onPress={clearCart} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.clearText}>Vider</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <>
            {/* Note pour le restaurant */}
            <View style={styles.noteSection}>
              <Text style={styles.noteLabel}>Note pour le restaurant</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Pas de piment, sans oignon..."
                placeholderTextColor={Colors.textMuted}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Récap financier */}
            <View style={styles.recap}>
              <View style={styles.recapRow}>
                <Text style={styles.recapLabel}>Sous-total</Text>
                <Text style={styles.recapValue}>
                  {subtotal.toLocaleString('fr-CD')} {currency}
                </Text>
              </View>
              <View style={styles.recapRow}>
                <Text style={styles.recapLabel}>Livraison</Text>
                <Text style={styles.recapValue}>
                  {LIVRAISON_FEE.toLocaleString('fr-CD')} {currency}
                </Text>
              </View>
              <View style={[styles.recapRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {grandTotal.toLocaleString('fr-CD')} {currency}
                </Text>
              </View>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
            <View style={styles.itemCard}>
              {/* Image produit */}
              {item.product.image ? (
                <Image
                  source={{ uri: item.product.image }}
                  style={styles.itemImage}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                  <Text style={styles.itemImageEmoji}>🍽️</Text>
                </View>
              )}

              <View style={styles.itemContent}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={styles.itemUnitPrice}>
                  {item.unitPrice.toLocaleString('fr-CD')} {currency}
                </Text>

                <View style={styles.itemFooter}>
                  {/* Contrôles quantité */}
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQty(item.product._id, item.qty - 1)}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qty}>{item.qty}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQty(item.product._id, item.qty + 1)}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Prix total ligne */}
                  <Text style={styles.itemTotal}>
                    {(item.unitPrice * item.qty).toLocaleString('fr-CD')} {currency}
                  </Text>

                  {/* Supprimer */}
                  <TouchableOpacity
                    onPress={() => removeItem(item.product._id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />

      {/* Footer sticky */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push({ pathname: '/checkout', params: { note } })}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            Commander · {grandTotal.toLocaleString('fr-CD')} {currency}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = {
  emptyRoot: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  headerCount: {
    color: Colors.textSecondary,
    fontFamily: 'DMSans_400Regular',
  },
  clearText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
  },
  list: {
    padding: Spacing.base,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.sm,
  },
  itemImagePlaceholder: {
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImageEmoji: {
    fontSize: 24,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  itemUnitPrice: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  qty: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    minWidth: 28,
    textAlign: 'center',
  },
  itemTotal: {
    flex: 1,
    fontFamily: 'Syne_600SemiBold',
    fontSize: Typography.fontSize.sm,
    color: Colors.lime,
    textAlign: 'right',
  },
  noteSection: {
    marginTop: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  noteInput: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  recap: {
    marginTop: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recapLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  recapValue: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  totalRow: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.md,
    color: Colors.lime,
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
  },
  ctaText: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.textInverse,
  },
} as const;
