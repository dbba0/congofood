import React from 'react';
import { Text, View, type ViewStyle } from 'react-native';

export interface DividerProps {
  label?: string;
  color?: string;
  thickness?: number;
  style?: ViewStyle;
}

export function Divider({
  label,
  color = '#2D2D3D',
  thickness = 1,
  style,
}: DividerProps) {
  if (label) {
    return (
      <View style={[styles.row, style]}>
        <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
      </View>
    );
  }

  return (
    <View
      style={[{ height: thickness, backgroundColor: color }, style]}
    />
  );
}

const styles = {
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  line: {
    flex: 1,
  },
  label: {
    color: '#4B5563',
    fontSize: 12,
  },
};
