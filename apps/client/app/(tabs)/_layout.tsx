// Navigation par onglets — couleurs actives distinctes par onglet
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Colors, Typography } from '../../constants/theme';

const TAB_COLORS = {
  home:    Colors.orange,
  search:  '#0EA5E9',
  orders:  Colors.success,
  profile: '#7C3AED',
} as const;

function CartBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { isAuthenticated } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0A0A0F',
          borderTopColor: '#2D2D3D',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarInactiveTintColor: Colors.textMuted,
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: {
          fontFamily: 'Syne_700Bold',
          fontSize: Typography.fontSize.md,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
          headerShown: false,
          tabBarActiveTintColor: TAB_COLORS.home,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Recherche',
          headerShown: false,
          tabBarActiveTintColor: TAB_COLORS.search,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Commandes',
          tabBarActiveTintColor: TAB_COLORS.orders,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarActiveTintColor: TAB_COLORS.profile,
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <Ionicons name="person-outline" size={size} color={color} />
              {focused && <CartBadge count={itemCount} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = {
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.orange,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.textPrimary,
    fontSize: 9,
    fontWeight: 'bold',
  },
} as const;
