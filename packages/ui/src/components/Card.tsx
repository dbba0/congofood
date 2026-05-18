// Carte de contenu CongoFood — cliquable optionnelle, accent couleur gauche
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

export interface CardProps {
  children: React.ReactNode;
  padding?: number;
  radius?: number;
  style?: ViewStyle;
  onPress?: () => void;
  accentColor?: string;
}

export function Card({
  children,
  padding = 16,
  radius = 12,
  style,
  onPress,
  accentColor,
}: CardProps) {
  const container = (
    <View
      style={[
        styles.card,
        { borderRadius: radius },
        accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : undefined,
        style,
      ]}
    >
      <View style={{ padding }}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} accessibilityRole="button">
        {container}
      </TouchableOpacity>
    );
  }

  return container;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D3D',
    overflow: 'hidden',
  },
});
