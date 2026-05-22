import { View, Text } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      {/* TODO : formulaire d'inscription */}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center' as const,
    padding: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    fontWeight: 'bold' as const,
    marginBottom: Spacing.xl,
  },
};
