import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // SplashScreen masque l'écran pendant le chargement
  if (isLoading) return null;

  return <Redirect href={isAuthenticated ? '/(tabs)/home' : '/(auth)/login'} />;
}
