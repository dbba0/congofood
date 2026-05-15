import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

/** Liste des quartiers de Kinshasa supportés */
const QUARTIERS = [
  'Gombe', 'Lingwala', 'Barumbu', 'Kinshasa',
  'Kasa-Vubu', 'Ngiri-Ngiri', 'Bumbu', 'Selembao',
  'Lemba', 'Limete', 'Makala', 'Kalamu',
  'Bandalungwa', 'Ngaliema', 'Mont-Ngafula', 'Kimbanseke',
  'Masina', 'Ndjili', 'Nsele', 'Maluku',
];

export default function SelectQuarterScreen() {
  const router = useRouter();

  const handleSelect = (quartier: string) => {
    // TODO : sauvegarder le quartier dans authStore / SecureStore
    // puis rediriger vers l'accueil
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Votre quartier</Text>
      <Text style={styles.subtitle}>
        Pour vous montrer les restaurants proches
      </Text>

      <FlatList
        data={QUARTIERS}
        keyExtractor={(item) => item}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chip}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.base,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
    marginTop: Spacing.xl,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing['2xl'],
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  chip: {
    flex: 1,
    marginHorizontal: Spacing.xs,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
});
