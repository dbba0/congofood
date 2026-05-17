import { MMKV } from 'react-native-mmkv';
import type { AuthUser, AuthTokens } from '@congofood/types';

const storage = new MMKV({ id: 'congofood-livreur-auth' });

export function saveSession(user: AuthUser, tokens: AuthTokens): void {
  storage.set('user', JSON.stringify(user));
  storage.set('accessToken', tokens.accessToken);
  storage.set('refreshToken', tokens.refreshToken);
  storage.set('expiresIn', tokens.expiresIn);
}

export function clearSession(): void {
  storage.delete('user');
  storage.delete('accessToken');
  storage.delete('refreshToken');
  storage.delete('expiresIn');
}

export function loadSession(): { user: AuthUser; tokens: AuthTokens } | null {
  const userJson = storage.getString('user');
  const accessToken = storage.getString('accessToken');
  const refreshToken = storage.getString('refreshToken');
  const expiresIn = storage.getNumber('expiresIn');

  if (!userJson || !accessToken || !refreshToken || expiresIn == null) return null;

  try {
    const user = JSON.parse(userJson) as AuthUser;
    return { user, tokens: { accessToken, refreshToken, expiresIn } };
  } catch {
    return null;
  }
}
