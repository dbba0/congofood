// Client HTTP avec injection automatique du token et logique de refresh
import { StorageService, STORAGE_KEYS } from './storage';
import { API } from '../constants/api';
import type { ApiResponse, AuthTokens } from '@congofood/types';

// Indicateur pour éviter les boucles infinies de refresh
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function drainQueue(token: string) {
  refreshQueue.forEach((resolve) => resolve(token));
  refreshQueue = [];
}

async function refreshTokens(): Promise<string | null> {
  const refreshToken = await StorageService.get(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) return null;

  try {
    const res = await fetch(API.refresh, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data: ApiResponse<{ tokens: AuthTokens }> = await res.json();
    if (!data.success || !data.data) return null;

    const { accessToken, refreshToken: newRefresh } = data.data.tokens;
    await StorageService.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await StorageService.set(STORAGE_KEYS.REFRESH_TOKEN, newRefresh);
    return accessToken;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = await StorageService.get(STORAGE_KEYS.ACCESS_TOKEN);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let response = await fetch(url, { ...options, headers });

  // Si 401 → tenter un refresh puis rejouer la requête
  if (response.status === 401) {
    if (isRefreshing) {
      // Attendre que le refresh en cours se termine
      const newToken = await new Promise<string>((resolve) => {
        refreshQueue.push(resolve);
      });
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    } else {
      isRefreshing = true;
      const newToken = await refreshTokens();
      isRefreshing = false;

      if (newToken) {
        drainQueue(newToken);
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // Refresh échoué → déconnecter
        StorageService.clearAuth();
        throw new Error('SESSION_EXPIRED');
      }
    }
  }

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || `Erreur ${response.status}`);
  }

  return json.data as T;
}
