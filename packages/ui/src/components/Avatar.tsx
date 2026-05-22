import React from 'react';
import { Image, Text, View } from 'react-native';

export interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: number;
  online?: boolean;
}

export function Avatar({ name, imageUrl, size = 40, online }: AvatarProps) {
  const initial = name ? name.trim()[0].toUpperCase() : '?';
  const borderRadius = size / 2;
  const fontSize = size * 0.4;
  const dotSize = size * 0.28;

  return (
    <View style={{ width: size, height: size }}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width: size, height: size, borderRadius }]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius },
          ]}
        >
          <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
        </View>
      )}

      {online != null && (
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              bottom: 0,
              right: 0,
              backgroundColor: online ? '#22C55E' : '#4B5563',
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = {
  image: {
    backgroundColor: '#2D2D3D',
  },
  fallback: {
    backgroundColor: '#2D2D3D',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  initial: {
    color: '#E85D04',
    fontWeight: '700' as const,
  },
  dot: {
    position: 'absolute' as const,
    borderWidth: 2,
    borderColor: '#111118',
  },
};
