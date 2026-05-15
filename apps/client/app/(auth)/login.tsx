import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CongoFood</Text>
      <Text style={styles.subtitle}>Commandez, on livre.</Text>
      {/* TODO : formulaire de connexion par téléphone */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    color: Colors.orange,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
});
