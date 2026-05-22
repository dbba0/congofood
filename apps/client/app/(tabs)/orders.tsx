// Écran commandes — onglets "En cours" / "Passées"
import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { apiRequest } from '../../lib/apiClient';
import { API } from '../../constants/api';
import { OrderStatusBadge, EmptyState } from '@congofood/ui';
import type { Order, OrderStatus } from '@congofood/types';

const ACTIVE_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'ready', 'picking_up', 'on_the_way',
];

export default function OrdersScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'active' | 'past'>('active');

  const { data: orders, isLoading, refetch } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => apiRequest<Order[]>(API.orders),
    refetchInterval: tab === 'active' ? 15000 : false,
  });

  const activeOrders = orders?.filter((o) => ACTIVE_STATUSES.includes(o.status)) ?? [];
  const pastOrders   = orders?.filter((o) => !ACTIVE_STATUSES.includes(o.status)) ?? [];
  const displayed    = tab === 'active' ? activeOrders : pastOrders;

  return (
    <SafeAreaView style={styles.root}>
      {/* Onglets */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'active' && styles.tabActive]}
          onPress={() => setTab('active')}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>
            En cours{activeOrders.length > 0 ? ` (${activeOrders.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'past' && styles.tabActive]}
          onPress={() => setTab('past')}
        >
          <Text style={[styles.tabText, tab === 'past' && styles.tabTextActive]}>
            Passées
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.orange} size="large" />
        </View>
      ) : displayed.length === 0 ? (
        <EmptyState
          emoji={tab === 'active' ? '🛵' : '📋'}
          title={tab === 'active' ? 'Aucune commande en cours' : 'Aucun historique'}
          subtitle={
            tab === 'active'
              ? "Passez une commande depuis l'accueil !"
              : 'Vos commandes passées apparaîtront ici'
          }
          actionLabel="Explorer les restaurants"
          onAction={() => router.replace('/(tabs)/home')}
        />
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(o) => o._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
              {tab === 'active'
                ? <ActiveOrderCard order={item} onPress={() => router.push(`/order/${item._id}`)} />
                : <PastOrderCard order={item} onPress={() => router.push(`/order/${item._id}`)} />
              }
            </Animated.View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

function ActiveOrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.activeCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.activeHeader}>
        <View>
          <Text style={styles.orderCode}>#{order._id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleTimeString('fr-CD', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <OrderStatusBadge status={order.status} size="md" />
      </View>
      <View style={styles.itemsPreview}>
        <Text style={styles.itemsText} numberOfLines={1}>
          {order.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
        </Text>
      </View>
      <View style={styles.activeFooter}>
        <Text style={styles.totalText}>{order.total.toLocaleString('fr-CD')} {order.currency}</Text>
        <View style={styles.trackBtn}>
          <Text style={styles.trackBtnText}>Suivre →</Text>
          <View style={styles.activeDot} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PastOrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const isDelivered = order.status === 'delivered';
  return (
    <TouchableOpacity style={styles.pastCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.pastHeader}>
        <Text style={styles.orderCode}>#{order._id.slice(-6).toUpperCase()}</Text>
        <OrderStatusBadge status={order.status} size="sm" />
      </View>
      <Text style={styles.orderDate}>
        {new Date(order.createdAt).toLocaleDateString('fr-CD', {
          day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
        })}
      </Text>
      <Text style={styles.itemsText} numberOfLines={1}>
        {order.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
      </Text>
      <View style={styles.pastFooter}>
        <Text style={styles.totalText}>{order.total.toLocaleString('fr-CD')} {order.currency}</Text>
        {isDelivered && (
          <View style={styles.reorderBtn}>
            <Ionicons name="refresh-outline" size={14} color={Colors.lime} />
            <Text style={styles.reorderText}>Commander à nouveau</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = {
  root: { flex: 1, backgroundColor: Colors.background },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.success },
  tabText: { fontFamily: 'DMSans_500Medium', fontSize: Typography.fontSize.base, color: Colors.textMuted },
  tabTextActive: { color: Colors.success, fontFamily: 'Syne_700Bold' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.base },
  activeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: `${Colors.success}60`,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderCode: { fontFamily: 'Syne_700Bold', fontSize: Typography.fontSize.base, color: Colors.textPrimary, letterSpacing: 0.5 },
  orderDate: { fontFamily: 'DMSans_400Regular', fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  itemsPreview: { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.sm, padding: Spacing.sm },
  itemsText: { fontFamily: 'DMSans_400Regular', fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  activeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalText: { fontFamily: 'Syne_600SemiBold', fontSize: Typography.fontSize.base, color: Colors.lime },
  trackBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  trackBtnText: { fontFamily: 'Syne_600SemiBold', fontSize: Typography.fontSize.sm, color: Colors.success },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  pastCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  pastHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  pastFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.lime,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  reorderText: { fontFamily: 'DMSans_500Medium', fontSize: Typography.fontSize.sm, color: Colors.lime },
} as const;
