import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/theme';
import { loadSession } from '../lib/storage';

// Ignorer l'erreur si preventAutoHideAsync est appelé trop tard
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const { setLoading, setUser } = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        const session = await loadSession();
        if (session) {
          setUser(session.user, session.tokens);
        } else {
          setLoading(false);
        }
      } catch {
        // Toujours débloquer le chargement même en cas d'erreur SecureStore
        setLoading(false);
      } finally {
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Ne jamais retourner null — laisser la navigation gérer les redirections
  return (
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
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="mission/[id]" options={{ title: 'Mission' }} />
      </Stack>
    </QueryClientProvider>
  );
}
