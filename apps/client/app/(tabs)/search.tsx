import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rechercher</Text>
      {/* TODO : barre de recherche, filtres par catégorie, résultats */}
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
    marginBottom: Spacing.base,
  },
});
