// Layout racine — charge polices, restore session MMKV, providers
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  Syne_600SemiBold,
  Syne_700Bold,
  Syne_800ExtraBold,
} from '@expo-google-fonts/syne';
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import { useAuthStore } from '../store/authStore';
import { StorageService, STORAGE_KEYS } from '../lib/storage';
import { Colors } from '../constants/theme';
import type { AuthUser, AuthTokens } from '@wapi/types';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      networkMode: 'offlineFirst',
    },
  },
});

export default function RootLayout() {
  const { setUser, setLoading } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Syne_600SemiBold,
    Syne_700Bold,
    Syne_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    // Restaurer la session depuis AsyncStorage
    (async () => {
      const accessToken  = await StorageService.get(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = await StorageService.get(STORAGE_KEYS.REFRESH_TOKEN);
      const user         = await StorageService.getJSON<AuthUser>(STORAGE_KEYS.USER);

      if (accessToken && refreshToken && user) {
        const tokens: AuthTokens = { accessToken, refreshToken, expiresIn: 900 };
        setUser(user, tokens);
      } else {
        setLoading(false);
      }

      SplashScreen.hideAsync();
    })();
  }, [fontsLoaded, setUser, setLoading]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor={Colors.background} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.textPrimary,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="restaurant/[id]"
            options={{ title: '', headerTransparent: true }}
          />
          <Stack.Screen
            name="cart"
            options={{ title: 'Mon panier', presentation: 'modal' }}
          />
          <Stack.Screen
            name="checkout"
            options={{ title: 'Ma commande', presentation: 'modal' }}
          />
          <Stack.Screen
            name="order/[id]"
            options={{ title: 'Suivi commande' }}
          />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
