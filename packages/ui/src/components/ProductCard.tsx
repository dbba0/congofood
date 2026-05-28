// ProductCard — Maquette ecran 06 Fiche Restaurant
// Layout : info gauche (nom, desc 2 lignes, prix) | image 88x88 droite + bouton "+"
import React from 'react';
import {
  Image,
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
      {/* Infos a gauche */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        ) : null}
        <View style={styles.pfoot}>
          <Text style={styles.price}>{price.toLocaleString()} CDF</Text>
        </View>
      </View>

      {/* Image + bouton a droite */}
      <View style={styles.right}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>🍽</Text>
          </View>
        )}

        {isAvailable && quantity === 0 && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={onAdd}
            activeOpacity={0.8}
            accessibilityLabel="Ajouter"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        )}

        {isAvailable && quantity > 0 && (
          <View style={styles.qtyRow}>
            {onRemove && (
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={onRemove}
                activeOpacity={0.8}
                accessibilityLabel="Retirer"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.qtyCount}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, styles.qtyBtnPlus]}
              onPress={onAdd}
              activeOpacity={0.8}
              accessibilityLabel="Ajouter"
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={[styles.qtyBtnText, styles.qtyBtnPlusText]}>+</Text>
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

const styles = {
  card: {
    flexDirection: 'row' as const,
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D3D',
  },
  cardUnavailable: {
    opacity: 0.5,
  },
  info: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Syne_700Bold',
  },
  description: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 17,
  },
  pfoot: {
    marginTop: 'auto' as unknown as number,
    paddingTop: 6,
  },
  price: {
    color: '#E85D04',
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    fontWeight: '600' as const,
  },
  right: {
    alignItems: 'center' as const,
    gap: 8,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 10,
  },
  imagePlaceholder: {
    backgroundColor: '#2D2D3D',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  imagePlaceholderText: {
    fontSize: 32,
  },
  // Bouton "+" circulaire lime
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#C8FF57',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: -22,
  },
  addBtnText: {
    color: '#0A0A0F',
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  // Compteur quantite : − qty +
  qtyRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: -18,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#2D2D3D',
    backgroundColor: '#1A1A2E',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  qtyBtnPlus: {
    backgroundColor: '#C8FF57',
    borderColor: '#C8FF57',
  },
  qtyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 18,
  },
  qtyBtnPlusText: {
    color: '#0A0A0F',
  },
  qtyCount: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Syne_700Bold',
    minWidth: 16,
    textAlign: 'center' as const,
  },
  unavailable: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '600' as const,
  },
};
