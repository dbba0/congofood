import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/theme';
import { loadSession } from '../lib/storage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
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
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor={Colors.background} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.textPrimary,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="mission/[id]" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
