import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Carte MapLibre</Text>
      <Text style={styles.sub}>TODO : intégrer MapLibre GL + OpenStreetMap</Text>
      {/* TODO : carte temps réel avec position livreur et destination */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  placeholder: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  sub: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
  },
});
