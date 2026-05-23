// expo-secure-store est compatible Expo Go (contrairement à react-native-mmkv
// qui nécessite un build natif). En production (EAS/prebuild), migrer vers MMKV.
import * as SecureStore from 'expo-secure-store';
import type { AuthUser, AuthTokens } from '@wapi/types';

const KEYS = {
  user: 'cf_livreur_user',
  accessToken: 'cf_livreur_access',
  refreshToken: 'cf_livreur_refresh',
  expiresIn: 'cf_livreur_expires',
} as const;

export async function saveSession(user: AuthUser, tokens: AuthTokens): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.user, JSON.stringify(user)),
    SecureStore.setItemAsync(KEYS.accessToken, tokens.accessToken),
    SecureStore.setItemAsync(KEYS.refreshToken, tokens.refreshToken),
    SecureStore.setItemAsync(KEYS.expiresIn, String(tokens.expiresIn)),
  ]);
}

export async function clearSession(): Promise<void> {
  await Promise.all(Object.values(KEYS).map((k) => SecureStore.deleteItemAsync(k)));
}

export async function loadSession(): Promise<{ user: AuthUser; tokens: AuthTokens } | null> {
  const [userJson, accessToken, refreshToken, expiresInStr] = await Promise.all([
    SecureStore.getItemAsync(KEYS.user),
    SecureStore.getItemAsync(KEYS.accessToken),
    SecureStore.getItemAsync(KEYS.refreshToken),
    SecureStore.getItemAsync(KEYS.expiresIn),
  ]);

  if (!userJson || !accessToken || !refreshToken || !expiresInStr) return null;

  try {
    const user = JSON.parse(userJson) as AuthUser;
    return {
      user,
      tokens: { accessToken, refreshToken, expiresIn: Number(expiresInStr) },
    };
  } catch {
    return null;
  }
}
