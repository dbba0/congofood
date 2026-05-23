// Suivi de commande en temps réel — timeline 5 étapes + card livreur
import { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { apiRequest } from '../../lib/apiClient';
import { API } from '../../constants/api';
import { OrderStatusBadge, Avatar } from '@wapi/ui';
import type { Order, OrderStatus } from '@wapi/types';

interface OrderWithLivreur extends Order {
  livreurDetails?: {
    name: string;
    phone: string;
    rating?: number;
    avatar?: string;
  };
}

interface TimelineStep {
  status: OrderStatus;
  label: string;
  emoji: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { status: 'pending',    label: 'Commande reçue',        emoji: '📋' },
  { status: 'confirmed',  label: 'Confirmée',             emoji: '✅' },
  { status: 'preparing',  label: 'En préparation',        emoji: '👨‍🍳' },
  { status: 'picking_up', label: 'Livreur en chemin',     emoji: '🛵' },
  { status: 'delivered',  label: 'Livré',                 emoji: '🎉' },
];

const STATUS_ORDER: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'picking_up', 'on_the_way', 'delivered',
];

function getStepState(stepStatus: OrderStatus, currentStatus: OrderStatus): 'done' | 'active' | 'pending' {
  const stepIdx    = STATUS_ORDER.indexOf(stepStatus);
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading } = useQuery<OrderWithLivreur>({
    queryKey: ['order', id],
    queryFn: () => apiRequest<OrderWithLivreur>(`${API.orders}/${id}`),
    refetchInterval: 15000, // polling toutes les 15 secondes
    enabled: !!id,
  });

  const openWhatsApp = useCallback((phone: string, name: string) => {
    const msg = `Bonjour ${name}, je vous contacte pour ma commande Wapi #WP-${id?.slice(-6).toUpperCase()}`;
    Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
  }, [id]);

  if (isLoading || !order) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.orange} size="large" />
        <Text style={styles.loadingText}>Chargement de votre commande...</Text>
      </View>
    );
  }

  const orderCode = `CF-${order._id.slice(-6).toUpperCase()}`;
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/orders')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerCode}>{orderCode}</Text>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL('https://wa.me/243000000000?text=Aide+commande+' + orderCode)
          }
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card estimation */}
        {!isDelivered && !isCancelled && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.estimationCard}>
            <Text style={styles.estimationLabel}>Estimation d'arrivée</Text>
            <Text style={styles.estimationTime}>
              {order.estimatedDelivery
                ? new Date(order.estimatedDelivery).toLocaleTimeString('fr-CD', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '25 – 40 min'
              }
            </Text>
            <OrderStatusBadge status={order.status} size="md" />
          </Animated.View>
        )}

        {isDelivered && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.deliveredCard}>
            <Text style={styles.deliveredEmoji}>🎉</Text>
            <Text style={styles.deliveredTitle}>Commande livrée !</Text>
            <Text style={styles.deliveredSub}>Bon appétit 😊</Text>
          </Animated.View>
        )}

        {isCancelled && (
          <View style={styles.cancelledCard}>
            <Text style={styles.cancelledText}>Commande annulée</Text>
          </View>
        )}

        {/* Timeline */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.timeline}>
          <Text style={styles.timelineTitle}>Suivi</Text>
          {TIMELINE_STEPS.map((step, index) => {
            const state = getStepState(step.status, order.status);
            const isLast = index === TIMELINE_STEPS.length - 1;
            return (
              <View key={step.status} style={styles.timelineRow}>
                {/* Indicateur vertical */}
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    state === 'done'   && styles.timelineDotDone,
                    state === 'active' && styles.timelineDotActive,
                  ]}>
                    {state === 'done' && (
                      <Ionicons name="checkmark" size={12} color={Colors.textPrimary} />
                    )}
                    {state === 'active' && (
                      <ActivityIndicator size="small" color={Colors.orange} />
                    )}
                    {state === 'pending' && (
                      <View style={styles.timelineDotInner} />
                    )}
                  </View>
                  {!isLast && (
                    <View style={[
                      styles.timelineLine,
                      state === 'done' && styles.timelineLineDone,
                    ]} />
                  )}
                </View>

                {/* Contenu étape */}
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineEmoji}>{step.emoji}</Text>
                  <View>
                    <Text style={[
                      styles.timelineLabel,
                      state === 'pending' && styles.timelineLabelPending,
                    ]}>
                      {step.label}
                    </Text>
                    {order.timeline?.find((t) => t.status === step.status) && (
                      <Text style={styles.timelineTime}>
                        {new Date(
                          order.timeline.find((t) => t.status === step.status)!.timestamp
                        ).toLocaleTimeString('fr-CD', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </Animated.View>

        {/* Card livreur */}
        {order.livreurDetails && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.livreurCard}>
            <Avatar
              name={order.livreurDetails.name}
              imageUrl={order.livreurDetails.avatar}
              size={48}
              online
            />
            <View style={styles.livreurInfo}>
              <Text style={styles.livreurName}>{order.livreurDetails.name}</Text>
              {order.livreurDetails.rating && (
                <Text style={styles.livreurRating}>
                  ⭐ {order.livreurDetails.rating.toFixed(1)}
                </Text>
              )}
            </View>
            <View style={styles.livreurActions}>
              <TouchableOpacity
                style={styles.livreurBtn}
                onPress={() =>
                  Linking.openURL(`tel:${order.livreurDetails!.phone}`)
                }
              >
                <Ionicons name="call-outline" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.livreurBtn, styles.whatsappBtn]}
                onPress={() =>
                  openWhatsApp(order.livreurDetails!.phone, order.livreurDetails!.name)
                }
              >
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Récap commande */}
        <View style={styles.recapSection}>
          <Text style={styles.recapTitle}>Détails commande</Text>
          {order.items.map((item, i) => (
            <View key={i} style={styles.recapItem}>
              <Text style={styles.recapQty}>{item.qty}×</Text>
              <Text style={styles.recapName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.recapPrice}>
                {(item.price * item.qty).toLocaleString('fr-CD')}
              </Text>
            </View>
          ))}
          <View style={styles.recapTotal}>
            <Text style={styles.recapTotalLabel}>Total payé</Text>
            <Text style={styles.recapTotalValue}>
              {order.total.toLocaleString('fr-CD')} {order.currency}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  loadingText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
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
  headerCode: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.base,
  },
  estimationCard: {
    backgroundColor: `${Colors.orange}20`,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.orange,
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  estimationLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  estimationTime: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.orange,
  },
  deliveredCard: {
    backgroundColor: `${Colors.success}18`,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.success,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deliveredEmoji: {
    fontSize: 40,
  },
  deliveredTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.success,
  },
  deliveredSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  cancelledCard: {
    backgroundColor: `${Colors.error}18`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
  },
  cancelledText: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.error,
  },
  timeline: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timelineTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timelineLeft: {
    width: 28,
    alignItems: 'center',
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  timelineDotActive: {
    borderColor: Colors.orange,
    backgroundColor: `${Colors.orange}20`,
  },
  timelineDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
    minHeight: 20,
  },
  timelineLineDone: {
    backgroundColor: Colors.success,
  },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingBottom: Spacing.base,
  },
  timelineEmoji: {
    fontSize: 18,
    lineHeight: 28,
  },
  timelineLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  timelineLabelPending: {
    color: Colors.textMuted,
  },
  timelineTime: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  livreurCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  livreurInfo: {
    flex: 1,
  },
  livreurName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  livreurRating: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  livreurActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  livreurBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  whatsappBtn: {
    borderColor: '#25D366',
  },
  recapSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  recapTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
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
  recapTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
  },
  recapTotalLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  recapTotalValue: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.md,
    color: Colors.lime,
  },
} as const;
