import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { useCartStore } from '../store/cartStore';

export default function CartScreen() {
  const router = useRouter();
  const { items, total, currency, updateQty, removeItem } = useCartStore((s) => ({
    items: s.items,
    total: s.total(),
    currency: s.currency,
    updateQty: s.updateQty,
    removeItem: s.removeItem,
  }));

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Panier vide</Text>
        <Text style={styles.emptySubtitle}>Ajoutez des produits pour commander</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>
                {(item.unitPrice * item.qty).toLocaleString('fr-CD')} {currency}
              </Text>
            </View>
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
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {total.toLocaleString('fr-CD')} {currency}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => router.push('/checkout')}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutBtnText}>Commander</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: Spacing.base,
  },
  item: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  itemName: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemPrice: {
    fontSize: Typography.fontSize.base,
    color: Colors.orange,
    fontWeight: '600',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  qty: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginHorizontal: Spacing.md,
    minWidth: 24,
    textAlign: 'center',
  },
  separator: {
    height: Spacing.sm,
  },
  footer: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    padding: Spacing.base,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  totalLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  checkoutBtn: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  checkoutBtnText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textInverse,
    fontWeight: 'bold',
  },
  empty: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
