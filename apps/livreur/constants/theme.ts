// Même charte graphique que l'app client — dupliqué car apps indépendantes
// En phase 2, déplacer vers @congofood/ui/theme

export const Colors = {
  background: '#0A0A0F',
  surface: '#141418',
  surfaceElevated: '#1E1E25',
  border: '#2A2A35',

  orange: '#E85D04',
  orangeLight: '#FF6B00',
  orangeDark: '#C44E00',

  lime: '#C8FF57',
  limeDark: '#A8E040',

  textPrimary: '#FFFFFF',
  textSecondary: '#9B9BA8',
  textMuted: '#5A5A6B',
  textInverse: '#0A0A0F',

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  overlay: 'rgba(0, 0, 0, 0.75)',
} as const;

export const Typography = {
  fontFamily: {
    regular: undefined,
    medium: undefined,
    semiBold: undefined,
    bold: undefined,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type ThemeColors = typeof Colors;
export type ThemeSpacing = typeof Spacing;
