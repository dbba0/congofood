import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface ProductCardProps {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
  quantity?: number;
  onAdd: () => void;
  onRemove?: () => void;
}

export function ProductCard({
  name,
  description,
  price,
  imageUrl,
  isAvailable = true,
  quantity = 0,
  onAdd,
  onRemove,
}: ProductCardProps) {
  return (
    <View style={[styles.card, !isAvailable && styles.cardUnavailable]}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        {description && (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        )}
        <Text style={styles.price}>{price.toLocaleString()} FC</Text>
      </View>

      <View style={styles.right}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>🍽</Text>
          </View>
        )}

        {isAvailable && (
          <View style={styles.qtyRow}>
            {quantity > 0 && onRemove && (
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={onRemove}
                activeOpacity={0.8}
                accessibilityLabel="Retirer"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
            )}
            {quantity > 0 && (
              <Text style={styles.qtyCount}>{quantity}</Text>
            )}
            <TouchableOpacity
              style={[styles.qtyBtn, styles.addBtn]}
              onPress={onAdd}
              activeOpacity={0.8}
              accessibilityLabel="Ajouter"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.qtyBtnText, styles.addBtnText]}>+</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isAvailable && (
          <Text style={styles.unavailable}>Indisponible</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D2D3D',
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  cardUnavailable: {
    opacity: 0.5,
  },
  info: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    fontWeight: '700',
  },
  description: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    lineHeight: 17,
  },
  price: {
    color: '#C8FF57',
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    fontWeight: '700',
    marginTop: 4,
  },
  right: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  imagePlaceholder: {
    backgroundColor: '#2D2D3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 28,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2D2D3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    backgroundColor: '#C8FF57',
    borderColor: '#C8FF57',
  },
  qtyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  addBtnText: {
    color: '#0A0A0F',
  },
  qtyCount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    fontWeight: '700',
    minWidth: 16,
    textAlign: 'center',
  },
  unavailable: {
    color: '#4B5563',
    fontSize: 10,
    fontFamily: 'DMSans-Regular',
  },
});
