// Points d'entrée de l'API CongoFood
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Mode développement — désactive les appels OTP réels
export const DEV_MODE = __DEV__;

export const API = {
  sendOtp:     `${BASE_URL}/api/auth/send-otp`,
  verifyOtp:   `${BASE_URL}/api/auth/verify-otp`,
  refresh:     `${BASE_URL}/api/auth/refresh`,
  logout:      `${BASE_URL}/api/auth/logout`,
  me:          `${BASE_URL}/api/users/me`,
  restaurants: `${BASE_URL}/api/restaurants`,
  orders:      `${BASE_URL}/api/orders`,
} as const;
