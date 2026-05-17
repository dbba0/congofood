import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useMissionStore } from '../../store/missionStore';
import { useSocket, type IncomingSocketMission } from '../../hooks/useSocket';

// Durée du timer avant refus automatique (secondes)
const MISSION_TIMEOUT = 30;

interface DayStats {
  courses: number;
  gainsXAF: number;
  distanceKm: number;
}

const MOCK_STATS: DayStats = { courses: 3, gainsXAF: 12500, distanceKm: 14.2 };

const MOCK_MISSION: IncomingSocketMission = {
  id: 'mission_dev_001',
  restaurantName: 'Poulet Ya Biso',
  restaurantAddress: 'Av. de la Paix, Gombe',
  deliveryAddress: 'Av. Kasa-Vubu 42, Lingwala',
  distanceKm: 3.8,
  estimatedMinutes: 18,
  earningsAmount: 4500,
  timeoutSeconds: MISSION_TIMEOUT,
};

export default function DashboardScreen() {
  const { user, tokens } = useAuthStore();
  const { isOnline, setOnline, setActiveMission } = useMissionStore();

  const [stats, setStats] = useState<DayStats>({ courses: 0, gainsXAF: 0, distanceKm: 0 });
  const [incomingMission, setIncomingMission] = useState<IncomingSocketMission | null>(null);
  const [countdown, setCountdown] = useState(MISSION_TIMEOUT);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerBarAnim = useRef(new Animated.Value(1)).current;

  // Charger les stats du jour (TODO : GET /api/deliveries/stats/today)
  useEffect(() => {
    if (__DEV__) {
      setStats(MOCK_STATS);
    }
  }, []);

  // Animation pulsation sur la card mission
  useEffect(() => {
    if (!incomingMission) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.015, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [incomingMission, pulseAnim]);

  // Barre de progression du timer
  useEffect(() => {
    if (!incomingMission) {
      timerBarAnim.setValue(1);
      return;
    }
    timerBarAnim.setValue(1);
    Animated.timing(timerBarAnim, {
      toValue: 0,
      duration: incomingMission.timeoutSeconds * 1000,
      useNativeDriver: false,
    }).start();
  }, [incomingMission, timerBarAnim]);

  // Countdown numérique
  function startCountdown(seconds: number) {
    setCountdown(seconds);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopCountdown();
          handleAutoRefuse();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stopCountdown() {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }

  const handleMissionIncoming = useCallback((mission: IncomingSocketMission) => {
    setIncomingMission(mission);
    startCountdown(mission.timeoutSeconds);
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 400, 200, 400]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMissionCancelled = useCallback(() => {
    stopCountdown();
    setIncomingMission(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAutoRefuse() {
    setIncomingMission(null);
  }

  const { acceptMission, refuseMission } = useSocket({
    token: tokens?.accessToken ?? null,
    enabled: isOnline,
    onMissionIncoming: handleMissionIncoming,
    onMissionCancelled: handleMissionCancelled,
  });

  function handleAccept() {
    if (!incomingMission) return;
    stopCountdown();
    acceptMission(incomingMission.id);
    // TODO : mapper IncomingSocketMission → Delivery complet quand backend prêt
    setIncomingMission(null);
    router.push(`/mission/${incomingMission.id}`);
  }

  function handleRefuse() {
    if (!incomingMission) return;
    stopCountdown();
    refuseMission(incomingMission.id);
    setIncomingMission(null);
  }

  function handleToggleOnline() {
    const next = !isOnline;
    setOnline(next);
    if (!next) {
      stopCountdown();
      setIncomingMission(null);
    }
  }

  const countdownColor =
    countdown > 15 ? Colors.lime : countdown > 8 ? Colors.warning : Colors.error;

  const timerBarWidth = timerBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.userName}>{user?.name ?? 'Livreur'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.toggleBtn, isOnline && styles.toggleBtnActive]}
          onPress={handleToggleOnline}
          activeOpacity={0.8}
        >
          <View style={[styles.toggleDot, isOnline && styles.toggleDotActive]} />
          <Text style={[styles.toggleLabel, isOnline && styles.toggleLabelActive]}>
            {isOnline ? 'Disponible' : 'Hors ligne'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Statut en ligne ── */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            Activez votre disponibilité pour recevoir des missions
          </Text>
        </View>
      )}

      {/* ── Mission entrante ── */}
      {incomingMission && (
        <Animated.View style={[styles.missionCard, { transform: [{ scale: pulseAnim }] }]}>
          {/* Barre timer */}
          <View style={styles.timerTrack}>
            <Animated.View
              style={[styles.timerBar, { width: timerBarWidth, backgroundColor: countdownColor }]}
            />
          </View>

          <View style={styles.missionCardInner}>
            {/* En-tête mission */}
            <View style={styles.missionHeader}>
              <View style={styles.missionBadge}>
                <Text style={styles.missionBadgeText}>Nouvelle mission</Text>
              </View>
              <Text style={[styles.countdown, { color: countdownColor }]}>{countdown}s</Text>
            </View>

            {/* Trajet */}
            <View style={styles.routeBlock}>
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, styles.routeDotPickup]} />
                <View style={styles.routeTextCol}>
                  <Text style={styles.routeLabel}>Retrait</Text>
                  <Text style={styles.routeMain}>{incomingMission.restaurantName}</Text>
                  <Text style={styles.routeSub}>{incomingMission.restaurantAddress}</Text>
                </View>
              </View>
              <View style={styles.routeConnector} />
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, styles.routeDotDelivery]} />
                <View style={styles.routeTextCol}>
                  <Text style={styles.routeLabel}>Livraison</Text>
                  <Text style={styles.routeMain}>{incomingMission.deliveryAddress}</Text>
                </View>
              </View>
            </View>

            {/* Métriques mission */}
            <View style={styles.missionMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaValue}>{incomingMission.distanceKm} km</Text>
                <Text style={styles.metaLabel}>Distance</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Text style={styles.metaValue}>~{incomingMission.estimatedMinutes} min</Text>
                <Text style={styles.metaLabel}>Durée</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Text style={[styles.metaValue, styles.metaEarnings]}>
                  {incomingMission.earningsAmount.toLocaleString()} FC
                </Text>
                <Text style={styles.metaLabel}>Gains</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.missionActions}>
              <TouchableOpacity
                style={styles.btnRefuse}
                onPress={handleRefuse}
                activeOpacity={0.8}
              >
                <Text style={styles.btnRefuseText}>Refuser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnAccept}
                onPress={handleAccept}
                activeOpacity={0.8}
              >
                <Text style={styles.btnAcceptText}>Accepter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── Stats du jour ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Aujourd'hui</Text>
        <Text style={styles.sectionDate}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🛵</Text>
          <Text style={styles.statValue}>{stats.courses}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>{stats.gainsXAF.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Francs CDF</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📍</Text>
          <Text style={styles.statValue}>{stats.distanceKm.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Kilomètres</Text>
        </View>
      </View>

      {/* ── Bouton dev ── */}
      {__DEV__ && isOnline && !incomingMission && (
        <TouchableOpacity
          style={styles.devBtn}
          onPress={() => handleMissionIncoming(MOCK_MISSION)}
          activeOpacity={0.7}
        >
          <Text style={styles.devBtnText}>⚡ Simuler une mission entrante</Text>
        </TouchableOpacity>
      )}

      {/* Attente de mission */}
      {isOnline && !incomingMission && (
        <View style={styles.waitingBlock}>
          <Text style={styles.waitingIcon}>🟢</Text>
          <Text style={styles.waitingTitle}>En attente de mission…</Text>
          <Text style={styles.waitingSubtitle}>
            Restez connecté, vous serez alerté dès qu'une mission vous est assignée
          </Text>
        </View>
      )}
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
    paddingBottom: Spacing['4xl'],
    gap: Spacing.base,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  greeting: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  toggleBtnActive: {
    borderColor: Colors.lime,
    backgroundColor: 'rgba(200, 255, 87, 0.1)',
  },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  toggleDotActive: {
    backgroundColor: Colors.lime,
  },
  toggleLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  toggleLabelActive: {
    color: Colors.lime,
  },

  // Bannière hors ligne
  offlineBanner: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  offlineBannerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },

  // Card mission entrante
  missionCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.lime,
    overflow: 'hidden',
  },
  timerTrack: {
    height: 4,
    backgroundColor: Colors.surface,
    width: '100%',
  },
  timerBar: {
    height: 4,
  },
  missionCardInner: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionBadge: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  missionBadgeText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  countdown: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  // Trajet
  routeBlock: {
    gap: 0,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    flexShrink: 0,
  },
  routeDotPickup: {
    backgroundColor: Colors.lime,
  },
  routeDotDelivery: {
    backgroundColor: Colors.orange,
  },
  routeConnector: {
    width: 1,
    height: 14,
    backgroundColor: Colors.border,
    marginLeft: 4.5,
    marginVertical: 2,
  },
  routeTextCol: {
    flex: 1,
  },
  routeLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  routeMain: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  routeSub: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  // Métriques
  missionMeta: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metaDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  metaValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  metaEarnings: {
    color: Colors.lime,
  },
  metaLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },

  // Boutons accept/refuse
  missionActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btnRefuse: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  btnRefuseText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },
  btnAccept: {
    flex: 2,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.lime,
    alignItems: 'center',
  },
  btnAcceptText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },

  // Stats
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  sectionDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // En attente
  waitingBlock: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.sm,
  },
  waitingIcon: {
    fontSize: 36,
  },
  waitingTitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  waitingSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
    maxWidth: 260,
  },

  // Bouton dev
  devBtn: {
    borderWidth: 1,
    borderColor: Colors.lime,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  devBtnText: {
    color: Colors.lime,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
});
