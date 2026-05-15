import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';
import { useCartStore } from '../store/cartStore';

export default function CheckoutScreen() {
  const { items, total, currency } = useCartStore((s) => ({
    items: s.items,
    total: s.total(),
    currency: s.currency,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Ma commande</Text>
      <Text style={styles.itemCount}>{items.length} article(s)</Text>
      <Text style={styles.total}>
        Total : {total.toLocaleString('fr-CD')} {currency}
      </Text>
      {/* TODO : récap produits, sélection adresse, choix paiement, bouton confirmer */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.base,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  itemCount: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  total: {
    fontSize: Typography.fontSize.lg,
    color: Colors.lime,
    fontWeight: 'bold',
  },
});
