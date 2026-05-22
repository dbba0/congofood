import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  duration?: number;
  onHide: () => void;
}

const VARIANT_COLORS: Record<ToastVariant, { bg: string; text: string; border: string }> = {
  success: { bg: '#052E16', text: '#22C55E', border: '#166534' },
  error:   { bg: '#2D0A0A', text: '#EF4444', border: '#7F1D1D' },
  warning: { bg: '#2D1D00', text: '#F59E0B', border: '#78350F' },
  info:    { bg: '#0A1929', text: '#3B82F6', border: '#1E3A5F' },
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

export function Toast({
  message,
  variant = 'info',
  visible,
  duration = 3000,
  onHide,
}: ToastProps) {
  const slideY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  function hide() {
    Animated.parallel([
      Animated.timing(slideY, { toValue: -80, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => onHide());
  }

  if (!visible) return null;

  const colors = VARIANT_COLORS[variant];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          transform: [{ translateY: slideY }],
          opacity,
        },
      ]}
    >
      <Text style={[styles.icon, { color: colors.text }]}>{VARIANT_ICONS[variant]}</Text>
      <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
        {message}
      </Text>
      <TouchableOpacity onPress={hide} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={[styles.close, { color: colors.text }]}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = {
  container: {
    position: 'absolute' as const,
    top: 56,
    left: 16,
    right: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 16,
    fontWeight: '700' as const,
    width: 20,
    textAlign: 'center' as const,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  close: {
    fontSize: 12,
    fontWeight: '700' as const,
    opacity: 0.7,
  },
};
