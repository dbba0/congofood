// Bouton réutilisable Wapi — 4 variantes, 3 tailles, état loading/disabled
import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const BG: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   '#C8FF57',
  secondary: '#E85D04',
  ghost:     'transparent',
  danger:    '#EF4444',
};

const TEXT_COLOR: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   '#0A0A0F',
  secondary: '#FFFFFF',
  ghost:     '#FFFFFF',
  danger:    '#FFFFFF',
};

const HEIGHT: Record<NonNullable<ButtonProps['size']>, number> = {
  sm: 36,
  md: 48,
  lg: 56,
};

const FONT_SIZE: Record<NonNullable<ButtonProps['size']>, number> = {
  sm: 13,
  md: 15,
  lg: 17,
};

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  onPress,
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.base,
    {
      backgroundColor: BG[variant],
      height: HEIGHT[size],
      borderWidth: variant === 'ghost' ? 1 : 0,
      borderColor: variant === 'ghost' ? '#2D2D3D' : undefined,
      opacity: isDisabled ? 0.4 : 1,
      alignSelf: fullWidth ? 'stretch' : 'auto' as ViewStyle['alignSelf'],
    },
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color={TEXT_COLOR[variant]} size="small" />
      ) : (
        <View style={styles.inner}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={[styles.label, { color: TEXT_COLOR[variant], fontSize: FONT_SIZE[size] }]}>
            {label}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = {
  base: {
    borderRadius: 10,
    paddingHorizontal: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minWidth: 44,
  },
  inner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  label: {
    fontWeight: '700' as const,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
};
