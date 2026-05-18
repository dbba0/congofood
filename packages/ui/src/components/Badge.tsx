// Badge statut/catégorie CongoFood — 7 variantes colorées
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface BadgeProps {
  label: string;
  variant: 'success' | 'error' | 'warning' | 'info' | 'orange' | 'lime' | 'gray';
  size?: 'sm' | 'md';
}

const VARIANT_STYLES: Record<
  BadgeProps['variant'],
  { bg: string; text: string }
> = {
  success: { bg: '#D4EFDF', text: '#1D6A39' },
  error:   { bg: '#FADBD8', text: '#922B21' },
  warning: { bg: '#FEF9E7', text: '#B7950B' },
  info:    { bg: '#D6EAF8', text: '#1B6CA8' },
  orange:  { bg: 'rgba(232, 93, 4, 0.15)',   text: '#E85D04' },
  lime:    { bg: 'rgba(200, 255, 87, 0.15)',  text: '#86AA3A' },
  gray:    { bg: '#2D2D3D', text: '#9CA3AF' },
};

const SIZE_STYLES: Record<
  NonNullable<BadgeProps['size']>,
  { px: number; py: number; fontSize: number }
> = {
  sm: { px: 8,  py: 4,  fontSize: 10 },
  md: { px: 12, py: 6,  fontSize: 12 },
};

export function Badge({ label, variant, size = 'md' }: BadgeProps) {
  const { bg, text } = VARIANT_STYLES[variant];
  const { px, py, fontSize } = SIZE_STYLES[size];

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg, paddingHorizontal: px, paddingVertical: py },
      ]}
    >
      <Text style={[styles.label, { color: text, fontSize }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '700',
    fontFamily: 'DMSans-Bold',
  },
});
