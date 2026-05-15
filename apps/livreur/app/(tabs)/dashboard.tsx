import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useMissionStore } from '../../store/missionStore';

export default function DashboardScreen() {
  const { isOnline, activeMission, setOnline } = useMissionStore();

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {isOnline ? '🟢 En ligne' : '⚫ Hors ligne'}
        </Text>
      </View>
      {activeMission ? (
        <Text style={styles.missionText}>
          Mission en cours : #{activeMission._id}
        </Text>
      ) : (
        <Text style={styles.noMission}>Aucune mission en cours</Text>
      )}
      {/* TODO : liste des missions disponibles, bouton en ligne/hors ligne */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.base,
  },
  statusBar: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.base,
  },
  statusText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  missionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.lime,
  },
  noMission: {
    fontSize: Typography.fontSize.base,
    color: Colors.textMuted,
  },
});
