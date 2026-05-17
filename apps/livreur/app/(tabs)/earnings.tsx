// CON-4 : Gains livreur — total jour, historique, paiement Mobile Money J+1
// TODO : remplacer MOCK_DATA par GET /api/deliveries/earnings quand backend prêt
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

type Period = 'jour' | 'semaine' | 'mois';

interface Delivery {
  id: string;
  from: string;
  to: string;
  amountXAF: number;
  distanceKm: number;
  completedAt: string;
}

interface PayoutMethod {
  id: string;
  number: string;
  operator: 'airtel' | 'orange' | 'mpesa';
}

const OPERATOR_COLOR: Record<PayoutMethod['operator'], string> = {
  airtel: '#EF4444',
  orange: '#E85D04',
  mpesa: '#22C55E',
};

const OPERATOR_LABEL: Record<PayoutMethod['operator'], string> = {
  airtel: 'Airtel Money',
  orange: 'Orange Money',
  mpesa: 'M-Pesa',
};

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_HISTORY: Delivery[] = [
  { id: 'd1', from: 'Gombe',      to: 'Lingwala',  amountXAF: 4500, distanceKm: 3.8, completedAt: new Date(Date.now() - 25 * 60000).toISOString() },
  { id: 'd2', from: 'Bandal',     to: 'Kintambo',  amountXAF: 3200, distanceKm: 2.6, completedAt: new Date(Date.now() - 80 * 60000).toISOString() },
  { id: 'd3', from: 'Ngiri-Ngiri', to: 'Gombe',    amountXAF: 5800, distanceKm: 5.1, completedAt: new Date(Date.now() - 140 * 60000).toISOString() },
  { id: 'd4', from: 'Masina',     to: 'Lemba',     amountXAF: 7200, distanceKm: 8.3, completedAt: new Date(Date.now() - 26 * 3600000).toISOString() },
  { id: 'd5', from: 'Limete',     to: 'Ngaba',     amountXAF: 4100, distanceKm: 3.4, completedAt: new Date(Date.now() - 28 * 3600000).toISOString() },
];

const MOCK_PAYOUT: PayoutMethod = {
  id: 'pm1',
  number: '+243 81 234 5678',
  operator: 'airtel',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function ageMs(iso: string) { return Date.now() - new Date(iso).getTime(); }

function formatTime(iso: string): string {
  const mins = Math.floor(ageMs(iso) / 60000);
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  return 'Hier';
}

function formatAmount(n: number): string {
  return n.toLocaleString('fr-FR') + ' FC';
}

function filterByPeriod(deliveries: Delivery[], period: Period): Delivery[] {
  const limits: Record<Period, number> = {
    jour: 24 * 3600 * 1000,
    semaine: 7 * 24 * 3600 * 1000,
    mois: 30 * 24 * 3600 * 1000,
  };
  return deliveries.filter((d) => ageMs(d.completedAt) < limits[period]);
}

// ────────────────────────────────────────────────────────────────────────────

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('jour');
  const [payoutRequested, setPayoutRequested] = useState(false);

  const todayList    = filterByPeriod(MOCK_HISTORY, 'jour');
  const periodList   = filterByPeriod(MOCK_HISTORY, period);
  const todayTotal   = todayList.reduce((a, d) => a + d.amountXAF, 0);
  const periodTotal  = periodList.reduce((a, d) => a + d.amountXAF, 0);
  const todayKm      = todayList.reduce((a, d) => a + d.distanceKm, 0);
  const avgPerCourse = todayList.length > 0 ? Math.round(todayTotal / todayList.length) : 0;

  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  function handlePayoutRequest() {
    // TODO : POST /api/earnings/payout { methodId: MOCK_PAYOUT.id }
    setPayoutRequested(true);
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Total du jour ── */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Gains aujourd'hui</Text>
        <Text style={styles.heroAmount}>{formatAmount(todayTotal)}</Text>
        <View style={styles.heroMeta}>
          <View style={styles.heroMetaItem}>
            <Text style={styles.heroMetaValue}>{todayList.length}</Text>
            <Text style={styles.heroMetaLabel}>courses</Text>
          </View>
          <View style={styles.heroMetaDivider} />
          <View style={styles.heroMetaItem}>
            <Text style={styles.heroMetaValue}>{todayKm.toFixed(1)} km</Text>
            <Text style={styles.heroMetaLabel}>parcourus</Text>
          </View>
          <View style={styles.heroMetaDivider} />
          <View style={styles.heroMetaItem}>
            <Text style={styles.heroMetaValue}>{avgPerCourse > 0 ? formatAmount(avgPerCourse) : '—'}</Text>
            <Text style={styles.heroMetaLabel}>/ course</Text>
          </View>
        </View>
      </View>

      {/* ── Historique ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Historique</Text>
          <View style={styles.periodSelector}>
            {(['jour', 'semaine', 'mois'] as Period[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                onPress={() => setPeriod(p)}
                activeOpacity={0.7}
              >
                <Text style={[styles.periodBtnText, period === p && styles.periodBtnTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {periodList.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyText}>Aucune course sur cette période</Text>
          </View>
        ) : (
          <>
            {periodList.map((delivery, idx) => (
              <View key={delivery.id}>
                <View style={styles.deliveryRow}>
                  <View style={styles.deliveryIcon}>
                    <Text style={styles.deliveryIconText}>🛵</Text>
                  </View>
                  <View style={styles.deliveryTrajet}>
                    <Text style={styles.deliveryRoute} numberOfLines={1}>
                      {delivery.from}
                      <Text style={styles.deliveryArrow}> → </Text>
                      {delivery.to}
                    </Text>
                    <Text style={styles.deliveryMeta}>
                      {delivery.distanceKm} km · {formatTime(delivery.completedAt)}
                    </Text>
                  </View>
                  <Text style={styles.deliveryAmount}>{formatAmount(delivery.amountXAF)}</Text>
                </View>
                {idx < periodList.length - 1 && <View style={styles.separator} />}
              </View>
            ))}

            <View style={styles.periodTotal}>
              <Text style={styles.periodTotalLabel}>
                Total ({period})
              </Text>
              <Text style={styles.periodTotalValue}>{formatAmount(periodTotal)}</Text>
            </View>
          </>
        )}
      </View>

      {/* ── Paiement Mobile Money J+1 ── */}
      <View style={styles.section}>
        <View>
          <Text style={styles.sectionTitle}>Paiement Mobile Money</Text>
          <Text style={styles.payoutSubtitle}>Virement automatique le lendemain (J+1)</Text>
        </View>

        {/* Compte lié */}
        <View style={styles.payoutAccount}>
          <View style={[styles.operatorDot, { backgroundColor: OPERATOR_COLOR[MOCK_PAYOUT.operator] }]} />
          <View style={styles.payoutAccountTexts}>
            <Text style={styles.payoutOperator}>{OPERATOR_LABEL[MOCK_PAYOUT.operator]}</Text>
            <Text style={styles.payoutNumber}>{MOCK_PAYOUT.number}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.changeLink}>Changer</Text>
          </TouchableOpacity>
        </View>

        {/* Montant en attente */}
        <View style={styles.pendingCard}>
          <View>
            <Text style={styles.pendingLabel}>En attente de virement</Text>
            <Text style={styles.pendingDate} numberOfLines={1}>
              Prévu {tomorrow}
            </Text>
          </View>
          <Text style={styles.pendingAmount}>{formatAmount(todayTotal)}</Text>
        </View>

        {/* Bouton virement immédiat */}
        {payoutRequested ? (
          <View style={styles.payoutConfirm}>
            <Text style={styles.payoutConfirmIcon}>✓</Text>
            <Text style={styles.payoutConfirmText}>
              Demande envoyée — traitement sous 24h
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.payoutBtn, todayTotal === 0 && styles.payoutBtnDisabled]}
            onPress={handlePayoutRequest}
            disabled={todayTotal === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.payoutBtnText}>Demander le virement maintenant</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.payoutNote}>
          Le virement automatique J+1 est gratuit. Le virement immédiat est soumis à
          la disponibilité du réseau Mobile Money.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.base,
    gap: Spacing.base,
  },

  // ── Hero ──
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.base,
  },
  heroLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  heroAmount: {
    fontSize: Typography.fontSize['4xl'],
    color: Colors.lime,
    fontWeight: '800',
    letterSpacing: -1,
  },
  heroMeta: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  heroMetaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  heroMetaDivider: {
    width: 1,
    backgroundColor: Colors.border,
    alignSelf: 'stretch',
  },
  heroMetaValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  heroMetaLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },

  // ── Sections communes ──
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    fontWeight: '700',
  },

  // Sélecteur période
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.sm,
    padding: 3,
    gap: 2,
  },
  periodBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  periodBtnActive: {
    backgroundColor: Colors.lime,
  },
  periodBtnText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  periodBtnTextActive: {
    color: Colors.textInverse,
  },

  // Lignes historique
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  deliveryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deliveryIconText: {
    fontSize: 16,
  },
  deliveryTrajet: {
    flex: 1,
    gap: 2,
  },
  deliveryRoute: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  deliveryArrow: {
    color: Colors.textMuted,
    fontWeight: '400',
  },
  deliveryMeta: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
  },
  deliveryAmount: {
    fontSize: Typography.fontSize.base,
    color: Colors.lime,
    fontWeight: '700',
    flexShrink: 0,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 36 + Spacing.sm,
  },
  periodTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
  },
  periodTotalLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  periodTotalValue: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  emptyBlock: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
  },

  // ── Paiement ──
  payoutSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  payoutAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  operatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  payoutAccountTexts: {
    flex: 1,
    gap: 2,
  },
  payoutOperator: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  payoutNumber: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  changeLink: {
    fontSize: Typography.fontSize.sm,
    color: Colors.lime,
    fontWeight: '600',
  },
  pendingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 255, 87, 0.07)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(200, 255, 87, 0.2)',
    gap: Spacing.sm,
  },
  pendingLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  pendingDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  pendingAmount: {
    fontSize: Typography.fontSize.lg,
    color: Colors.lime,
    fontWeight: '800',
    flexShrink: 0,
  },
  payoutBtn: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  payoutBtnDisabled: {
    opacity: 0.35,
  },
  payoutBtnText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },
  payoutConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  payoutConfirmIcon: {
    fontSize: 18,
    color: Colors.success,
  },
  payoutConfirmText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.success,
    fontWeight: '600',
    flex: 1,
  },
  payoutNote: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    lineHeight: Typography.fontSize.xs * Typography.lineHeight.relaxed,
    textAlign: 'center',
  },
});
