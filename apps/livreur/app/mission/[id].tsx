import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing } from '../../constants/theme';

export default function MissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mission #{id}</Text>
      {/* TODO :
        - Adresse de retrait (restaurant)
        - Adresse de livraison (client)
        - Bouton "Je suis arrivé" / "J'ai récupéré la commande" / "Livré"
        - Navigation vers MapScreen avec itinéraire
      */}
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
  title: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: Spacing.base,
  },
});
