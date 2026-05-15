import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30s — les missions évoluent vite
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const { isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    // TODO : restaurer la session depuis SecureStore
    setLoading(false);
    SplashScreen.hideAsync();
  }, [setLoading]);

  if (isLoading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="mission/[id]" options={{ title: 'Mission' }} />
      </Stack>
    </QueryClientProvider>
  );
}
