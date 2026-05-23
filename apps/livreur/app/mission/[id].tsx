// CON-7 : Détail mission livreur — carte + stepper + bottom sheet draggable
// TODO CON-10 : remplacer react-native-maps par MapLibre GL + tuiles OSM
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RNMapView, { Marker as RNMarker, Polyline as RNPolyline, PROVIDER_DEFAULT } from 'react-native-maps';
import type { MapViewProps, MapMarkerProps, MapPolylineProps } from 'react-native-maps';

// Contournement : react-native-maps 1.20 n'est pas encore compatible React 19 (refs absent)
type WithRef<P, T> = React.ComponentType<P & { ref?: React.Ref<T> }>;
const MapView  = RNMapView  as unknown as WithRef<MapViewProps,    InstanceType<typeof RNMapView>>;
const Marker   = RNMarker   as unknown as React.ComponentType<MapMarkerProps>;
const Polyline = RNPolyline as unknown as React.ComponentType<MapPolylineProps>;
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useMissionStore } from '../../store/missionStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 310;
const SNAP_COLLAPSED = SHEET_HEIGHT - 68;
const BACKEND_URL = __DEV__ ? 'http://localhost:3000' : 'https://api.wapi.cd';

type Step = 'picking_up' | 'delivering' | 'completed';

interface MissionData {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  clientAddress: string;
  restaurantCoords: { latitude: number; longitude: number };
  clientCoords: { latitude: number; longitude: number };
  earningsAmount: number;
}

// Coordonnées Kinshasa (Gombe → Lingwala) pour dev
const MOCK_MISSION: MissionData = {
  id: 'mission_dev_001',
  restaurantName: 'Poulet Ya Biso',
  restaurantAddress: 'Av. de la Paix, Gombe',
  clientAddress: 'Av. Kasa-Vubu 42, Lingwala',
  restaurantCoords: { latitude: -4.3012, longitude: 15.2992 },
  clientCoords: { latitude: -4.3218, longitude: 15.2876 },
  earningsAmount: 4500,
};

const STEP_LABELS: Record<Step, string> = {
  picking_up: 'En route vers le restaurant',
  delivering: 'Livraison en cours',
  completed: 'Mission terminée',
};

const CTA_LABELS: Record<Step, string> = {
  picking_up: 'Je suis arrivé au restaurant',
  delivering: 'Commande livrée ✓',
  completed: 'Retour au tableau de bord',
};

export default function MissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tokens } = useAuthStore();
  const { updateMissionStatus, updateLocation } = useMissionStore();
  const insets = useSafeAreaInsets();

  // TODO : charger depuis store ou GET /api/deliveries/:id quand backend prêt
  const [mission] = useState<MissionData>(MOCK_MISSION);
  const [step, setStep] = useState<Step>('picking_up');
  const [myCoords, setMyCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const mapRef = useRef<InstanceType<typeof RNMapView>>(null);
  const socketRef = useRef<Socket | null>(null);
  const gpsRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Connexion socket ──
  useEffect(() => {
    if (!tokens?.accessToken) return;
    const socket = io(BACKEND_URL, {
      auth: { token: tokens.accessToken },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      timeout: 8000,
    });
    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tokens?.accessToken]);

  // ── GPS toutes les 5s ──
  useEffect(() => {
    let alive = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !alive) return;

      const first = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const c = { latitude: first.coords.latitude, longitude: first.coords.longitude };
      if (alive) setMyCoords(c);

      gpsRef.current = setInterval(async () => {
        try {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const { latitude, longitude } = pos.coords;
          if (!alive) return;
          setMyCoords({ latitude, longitude });
          updateLocation(latitude, longitude);
          socketRef.current?.emit('location:update', {
            missionId: mission.id,
            lat: latitude,
            lng: longitude,
          });
        } catch {
          // Silencieux — réseau instable acceptable
        }
      }, 5000);
    })();

    return () => {
      alive = false;
      if (gpsRef.current) clearInterval(gpsRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Action bouton stepper ──
  function handleAction() {
    if (step === 'picking_up') {
      setStep('delivering');
      updateMissionStatus('picking_up');
      socketRef.current?.emit('mission:status', { missionId: mission.id, status: 'picking_up' });
      mapRef.current?.animateToRegion(
        { ...mission.clientCoords, latitudeDelta: 0.04, longitudeDelta: 0.04 },
        700
      );
    } else if (step === 'delivering') {
      setStep('completed');
      updateMissionStatus('completed');
      socketRef.current?.emit('mission:status', { missionId: mission.id, status: 'completed' });
    } else {
      router.replace('/(tabs)/dashboard');
    }
  }

  // ── Bottom sheet drag ──
  const translateY = useSharedValue(0);
  const ctxY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      ctxY.value = translateY.value;
    })
    .onChange((e) => {
      const next = ctxY.value + e.translationY;
      translateY.value = Math.max(0, Math.min(SNAP_COLLAPSED, next));
    })
    .onEnd((e) => {
      if (e.velocityY > 400 || translateY.value > SNAP_COLLAPSED / 2) {
        translateY.value = withSpring(SNAP_COLLAPSED, { damping: 22 });
      } else {
        translateY.value = withSpring(0, { damping: 22 });
      }
    });

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Région initiale centrée entre restaurant et client
  const midLat = (mission.restaurantCoords.latitude + mission.clientCoords.latitude) / 2;
  const midLng = (mission.restaurantCoords.longitude + mission.clientCoords.longitude) / 2;

  const stepDone = (n: 1 | 2) =>
    (n === 1 && (step === 'delivering' || step === 'completed')) || (n === 2 && step === 'completed');

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Carte plein écran ── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={{ latitude: midLat, longitude: midLng, latitudeDelta: 0.07, longitudeDelta: 0.07 }}
        showsCompass={false}
        showsScale={false}
        showsUserLocation={false}
        toolbarEnabled={false}
      >
        {/* Tracé restaurant → client */}
        <Polyline
          coordinates={[mission.restaurantCoords, mission.clientCoords]}
          strokeColor={Colors.lime}
          strokeWidth={3}
          lineDashPattern={[10, 6]}
        />

        {/* Pin restaurant */}
        <Marker coordinate={mission.restaurantCoords} anchor={{ x: 0.5, y: 1 }}>
          <View style={styles.pinRestaurant}>
            <Text style={styles.pinEmoji}>🍽</Text>
            <View style={styles.pinTail} />
          </View>
        </Marker>

        {/* Pin client */}
        <Marker coordinate={mission.clientCoords} anchor={{ x: 0.5, y: 1 }}>
          <View style={styles.pinClient}>
            <Text style={styles.pinEmoji}>🏠</Text>
            <View style={[styles.pinTail, { backgroundColor: Colors.orange }]} />
          </View>
        </Marker>

        {/* Position livreur */}
        {myCoords && (
          <Marker coordinate={myCoords} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.pinMe}>
              <View style={styles.pinMeRing} />
              <View style={styles.pinMeDot} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* ── Stepper flottant (haut) ── */}
      <View style={[styles.stepperWrap, { top: insets.top + Spacing.sm }]}>
        <View style={styles.stepper}>
          {/* Étape 1 — Récupérer */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleDone]}>
              <Text style={styles.stepCircleText}>{stepDone(1) ? '✓' : '1'}</Text>
            </View>
            <Text style={[styles.stepLabel, !stepDone(1) && step === 'picking_up' && styles.stepLabelActive]}>
              Récupérer
            </Text>
          </View>

          {/* Ligne */}
          <View style={[styles.stepLine, stepDone(1) && styles.stepLineDone]} />

          {/* Étape 2 — Livrer */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, (step === 'delivering' || step === 'completed') && styles.stepCircleDone]}>
              <Text style={styles.stepCircleText}>{step === 'completed' ? '✓' : '2'}</Text>
            </View>
            <Text style={[styles.stepLabel, step === 'delivering' && styles.stepLabelActive]}>
              Livrer
            </Text>
          </View>
        </View>
      </View>

      {/* ── Bottom sheet draggable ── */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.sheet, sheetAnimStyle, { paddingBottom: insets.bottom + Spacing.sm }]}>
          {/* Poignée */}
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          {/* Badge statut */}
          <View style={[styles.statusBadge, step === 'completed' && styles.statusBadgeDone]}>
            <View style={[styles.statusDot, step === 'completed' && styles.statusDotDone]} />
            <Text style={[styles.statusText, step === 'completed' && styles.statusTextDone]}>
              {STEP_LABELS[step]}
            </Text>
          </View>

          {/* Adresses */}
          <View style={styles.addrBlock}>
            <View style={styles.addrRow}>
              <View style={styles.addrDotLime} />
              <View style={styles.addrTexts}>
                <Text style={styles.addrLabel}>Restaurant</Text>
                <Text style={styles.addrMain}>{mission.restaurantName}</Text>
                <Text style={styles.addrSub}>{mission.restaurantAddress}</Text>
              </View>
            </View>
            <View style={styles.addrConnector} />
            <View style={styles.addrRow}>
              <View style={styles.addrDotOrange} />
              <View style={styles.addrTexts}>
                <Text style={styles.addrLabel}>Client</Text>
                <Text style={styles.addrMain}>{mission.clientAddress}</Text>
              </View>
            </View>
          </View>

          {/* Gains */}
          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>Gains</Text>
            <Text style={styles.earningsValue}>{mission.earningsAmount.toLocaleString()} FC</Text>
          </View>

          {/* Bouton action */}
          <TouchableOpacity
            style={[styles.cta, step === 'completed' && styles.ctaDone]}
            onPress={handleAction}
            activeOpacity={0.85}
          >
            <Text style={[styles.ctaText, step === 'completed' && styles.ctaTextDone]}>
              {CTA_LABELS[step]}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Stepper ──
  stepperWrap: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 10,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  stepItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  stepCircleDone: {
    borderColor: Colors.lime,
    backgroundColor: Colors.lime,
  },
  stepCircleText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  stepLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: Colors.lime,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  stepLineDone: {
    backgroundColor: Colors.lime,
  },

  // ── Pins carte ──
  pinRestaurant: {
    alignItems: 'center',
  },
  pinClient: {
    alignItems: 'center',
  },
  pinEmoji: {
    fontSize: 28,
  },
  pinTail: {
    width: 3,
    height: 8,
    backgroundColor: Colors.lime,
    borderRadius: 2,
    marginTop: -2,
  },
  pinMe: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinMeRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.info,
    opacity: 0.5,
  },
  pinMeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.info,
  },

  // ── Bottom sheet ──
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT + 40,
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 20,
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },

  // Statut
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(200, 255, 87, 0.1)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
  },
  statusBadgeDone: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.lime,
  },
  statusDotDone: {
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.lime,
    fontWeight: '600',
  },
  statusTextDone: {
    color: Colors.success,
  },

  // Adresses
  addrBlock: {
    gap: 0,
  },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  addrDotLime: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.lime,
    marginTop: 5,
    flexShrink: 0,
  },
  addrDotOrange: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.orange,
    marginTop: 5,
    flexShrink: 0,
  },
  addrConnector: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
    marginLeft: 4.5,
    marginVertical: 2,
  },
  addrTexts: {
    flex: 1,
  },
  addrLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  addrMain: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 1,
  },
  addrSub: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  // Gains
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  earningsLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  earningsValue: {
    fontSize: Typography.fontSize.md,
    color: Colors.lime,
    fontWeight: '800',
  },

  // CTA
  cta: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  ctaDone: {
    backgroundColor: Colors.success,
  },
  ctaText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },
  ctaTextDone: {
    color: '#fff',
  },
});
