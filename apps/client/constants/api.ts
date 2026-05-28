// Points d'entrée de l'API Wapi
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Mode développement — bypass OTP, tokens dev locaux
// Actif si __DEV__ (Expo dev) OU si EXPO_PUBLIC_DEV_MODE=true dans .env
export const DEV_MODE = __DEV__ || process.env.EXPO_PUBLIC_DEV_MODE === 'true';

export const API = {
  sendOtp:     `${BASE_URL}/api/auth/send-otp`,
  verifyOtp:   `${BASE_URL}/api/auth/verify-otp`,
  refresh:     `${BASE_URL}/api/auth/refresh`,
  logout:      `${BASE_URL}/api/auth/logout`,
  me:          `${BASE_URL}/api/users/me`,
  restaurants: `${BASE_URL}/api/restaurants`,
  orders:      `${BASE_URL}/api/orders`,
} as const;
