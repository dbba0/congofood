import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

export default function EarningsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes gains</Text>
      {/* TODO : total du jour, de la semaine, historique des livraisons */}
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
