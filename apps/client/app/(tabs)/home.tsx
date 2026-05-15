import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Bonjour 👋</Text>
      <Text style={styles.subtext}>Que voulez-vous manger aujourd'hui ?</Text>
      {/* TODO : bannières promo, catégories, restaurants populaires */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.base,
  },
  greeting: {
    fontSize: Typography.fontSize['2xl'],
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  subtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
});
