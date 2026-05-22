// Sélection du quartier de livraison — radio + sauvegarde MMKV
import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StorageService, STORAGE_KEYS } from '../../lib/storage';
import { apiRequest } from '../../lib/apiClient';
import { API } from '../../constants/api';

interface Quartier {
  nom: string;
  distance: string;
}

const QUARTIERS: Quartier[] = [
  { nom: 'Gombe',        distance: 'Centre-ville' },
  { nom: 'Lingwala',     distance: '2 km' },
  { nom: 'Barumbu',      distance: '3 km' },
  { nom: 'Kinshasa',     distance: '4 km' },
  { nom: 'Kasa-Vubu',    distance: '5 km' },
  { nom: 'Ngiri-Ngiri',  distance: '6 km' },
  { nom: 'Bumbu',        distance: '8 km' },
  { nom: 'Selembao',     distance: '10 km' },
  { nom: 'Lemba',        distance: '12 km' },
  { nom: 'Limete',       distance: '7 km' },
  { nom: 'Makala',       distance: '9 km' },
  { nom: 'Kalamu',       distance: '5 km' },
  { nom: 'Bandalungwa',  distance: '8 km' },
  { nom: 'Ngaliema',     distance: '11 km' },
  { nom: 'Mont-Ngafula', distance: '15 km' },
  { nom: 'Kimbanseke',   distance: '18 km' },
  { nom: 'Masina',       distance: '20 km' },
  { nom: 'Ndjili',       distance: '16 km' },
  { nom: 'Nsele',        distance: '25 km' },
  { nom: 'Maluku',       distance: '30 km' },
];

export default function SelectQuarterScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('Gombe');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await StorageService.set(STORAGE_KEYS.QUARTER, selected);
    try {
      // Mettre à jour le quartier côté serveur
      await apiRequest(`${API.me}`, {
        method: 'PATCH',
        body: JSON.stringify({ quartier: selected }),
      });
    } catch {
      // Continuer même si l'API échoue (offline toléré)
    } finally {
      setLoading(false);
      router.replace('/(tabs)/home');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.title}>Votre quartier</Text>
          <Text style={styles.subtitle}>
            Pour vous montrer les restaurants les plus proches
          </Text>
        </Animated.View>
      </View>

      <FlatList
        data={QUARTIERS}
        keyExtractor={(item) => item.nom}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 30).duration(300)}>
            <TouchableOpacity
              style={[styles.item, selected === item.nom && styles.itemSelected]}
              onPress={() => setSelected(item.nom)}
              activeOpacity={0.7}
            >
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.nom}</Text>
                <Text style={styles.itemDistance}>{item.distance}</Text>
              </View>
              <View style={[styles.radio, selected === item.nom && styles.radioSelected]}>
                {selected === item.nom && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      />

      {/* Bouton sticky */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, loading && styles.ctaDisabled]}
          onPress={handleConfirm}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {loading ? 'Confirmation...' : `Confirmer · ${selected}`}
          </Text>
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
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.base,
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    minHeight: 56,
  },
  itemSelected: {
    borderColor: Colors.orange,
    backgroundColor: `${Colors.orange}18`,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  itemDistance: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.orange,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.orange,
  },
  footer: {
    padding: Spacing.xl,
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
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.textInverse,
  },
} as const;
