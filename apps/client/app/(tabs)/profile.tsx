import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user?.name ?? 'Mon profil'}</Text>
      {/* TODO : infos utilisateur, adresse, paramètres, déconnexion */}
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
