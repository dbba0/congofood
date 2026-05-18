import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface RestaurantCardProps {
  name: string;
  category: string;
  logoUrl?: string;
  deliveryTime: number;
  deliveryFee: number;
  rating?: number;
  isOpen: boolean;
  onPress: () => void;
}

export function RestaurantCard({
  name,
  category,
  logoUrl,
  deliveryTime,
  deliveryFee,
  rating,
  isOpen,
  onPress,
}: RestaurantCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, !isOpen && styles.cardClosed]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      disabled={!isOpen}
    >
      <View style={styles.logoBox}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="cover" />
        ) : (
          <View style={[styles.logo, styles.logoPlaceholder]}>
            <Text style={styles.logoPlaceholderText}>{name[0]}</Text>
          </View>
        )}
        {!isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedLabel}>Fermé</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.category}>{category}</Text>

        <View style={styles.meta}>
          <Text style={styles.metaText}>🕐 {deliveryTime} min</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.metaText}>
            {deliveryFee === 0 ? 'Livraison offerte' : `${deliveryFee.toLocaleString()} FC`}
          </Text>
          {rating != null && (
            <>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.rating}>⭐ {rating.toFixed(1)}</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D3D',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  cardClosed: {
    opacity: 0.6,
  },
  logoBox: {
    position: 'relative',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  logoPlaceholder: {
    backgroundColor: '#2D2D3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    color: '#E85D04',
    fontSize: 24,
    fontFamily: 'Syne-Bold',
    fontWeight: '700',
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'DMSans-Bold',
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    fontWeight: '700',
  },
  category: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
  },
  dot: {
    color: '#4B5563',
    fontSize: 11,
  },
  rating: {
    color: '#F59E0B',
    fontSize: 11,
    fontFamily: 'DMSans-Medium',
    fontWeight: '500',
  },
});
