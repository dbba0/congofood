import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Colors, Typography, Spacing } from '../../constants/theme';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: '', headerTransparent: true }} />
      <ScrollView style={styles.container}>
        <View style={styles.hero}>
          {/* TODO : image de couverture */}
        </View>
        <View style={styles.content}>
          <Text style={styles.restaurantId}>Restaurant #{id}</Text>
          {/* TODO : infos restaurant, menu par catégorie, bouton panier */}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    height: 220,
    backgroundColor: Colors.surfaceElevated,
  },
  content: {
    padding: Spacing.base,
  },
  restaurantId: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
});
