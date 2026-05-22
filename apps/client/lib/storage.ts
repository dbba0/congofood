// Couche de stockage local — AsyncStorage compatible Expo Go
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés de stockage
export const STORAGE_KEYS = {
  ACCESS_TOKEN:    'accessToken',
  REFRESH_TOKEN:   'refreshToken',
  USER:            'user',
  QUARTER:         'userQuarter',
  RECENT_SEARCHES: 'recentSearches',
} as const;

export const StorageService = {
  get: (key: string): Promise<string | null> =>
    AsyncStorage.getItem(key),

  set: (key: string, value: string): Promise<void> =>
    AsyncStorage.setItem(key, value),

  delete: (key: string): Promise<void> =>
    AsyncStorage.removeItem(key),

  getJSON: async <T>(key: string): Promise<T | null> => {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },

  setJSON: (key: string, value: unknown): Promise<void> =>
    AsyncStorage.setItem(key, JSON.stringify(value)),

  clearAuth: (): Promise<void> =>
    AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]),
};
