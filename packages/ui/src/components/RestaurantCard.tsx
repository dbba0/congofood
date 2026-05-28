// RestaurantCard — Variation B "Vibrant & Communaute"
// Deux variantes : "grid" (carte verticale avec photo) et "list" (carte horizontale)
import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

// Couleurs par categorie
const CATEGORY_COLORS: Record<string, string> = {
  food:     '#E85D04',
  grocery:  '#7C3AED',
  pharmacy: '#22C55E',
  drinks:   '#3B82F6',
  fastfood: '#F59E0B',
  healthy:  '#10B981',
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#F59E0B';
}

export interface RestaurantCardProps {
  name: string;
  category: string;
  /** Label affiche dans le badge (ex: "CONGOLAIS", "GRILLADES") */
  categoryLabel?: string;
  logoUrl?: string;
  /** Image cover pour la variante grid */
  coverUrl?: string;
  deliveryTime: number;
  deliveryFee: number;
  rating?: number;
  isOpen: boolean;
  onPress: () => void;
  /** "grid" = carte verticale avec photo (home), "list" = carte horizontale (search) */
  variant?: 'grid' | 'list';
  style?: ViewStyle;
}

export function RestaurantCard({
  name,
  category,
  categoryLabel,
  logoUrl,
  coverUrl,
  deliveryTime,
  deliveryFee,
  rating,
  isOpen,
  onPress,
  variant = 'list',
  style,
}: RestaurantCardProps) {
  const catColor = getCategoryColor(category);
  const badgeLabel = categoryLabel || category;

  if (variant === 'grid') {
    return (
      <TouchableOpacity
        style={[gridStyles.card, !isOpen && gridStyles.cardClosed, style]}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        disabled={!isOpen}
      >
        {/* Zone photo cover */}
        <View style={gridStyles.coverWrap}>
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={gridStyles.coverImage} resizeMode="cover" />
          ) : (
            <View style={[gridStyles.coverImage, gridStyles.coverPlaceholder]}>
              {/* Bande de couleur subtile en haut */}
              <View style={[gridStyles.coverBand, { backgroundColor: catColor }]} />
              <Text style={[gridStyles.coverInitial, { color: catColor }]}>
                {name[0]}
              </Text>
            </View>
          )}

          {/* Badge ouvert/ferme en overlay */}
          <View style={gridStyles.statusBadgeWrap}>
            {isOpen ? (
              <View style={gridStyles.badgeOpen}>
                <View style={gridStyles.badgeDot} />
                <Text style={gridStyles.badgeOpenText}>OUVERT</Text>
              </View>
            ) : (
              <View style={gridStyles.badgeClosed}>
                <Text style={gridStyles.badgeClosedText}>FERME</Text>
              </View>
            )}
          </View>
        </View>

        {/* Infos sous la photo */}
        <View style={gridStyles.info}>
          <Text style={gridStyles.name} numberOfLines={1}>{name}</Text>

          <View style={[gridStyles.catBadge, { backgroundColor: catColor + '28' }]}>
            <Text style={[gridStyles.catBadgeText, { color: catColor }]}>
              {badgeLabel.toUpperCase()}
            </Text>
          </View>

          <View style={gridStyles.meta}>
            <Text style={gridStyles.metaText}>⏱ {deliveryTime} min</Text>
            {rating != null && (
              <>
                <View style={gridStyles.dot} />
                <Text style={gridStyles.rating}>★ {rating.toFixed(1)}</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ─── Variante "list" (horizontale, pour search) ───────────────
  return (
    <TouchableOpacity
      style={[listStyles.card, !isOpen && listStyles.cardClosed, style]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      disabled={!isOpen}
    >
      {/* Bande couleur gauche — 4px */}
      <View style={[listStyles.colorBand, { backgroundColor: catColor }]} />

      {/* Avatar / Logo */}
      <View style={listStyles.avatarWrap}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={listStyles.avatar} resizeMode="cover" />
        ) : (
          <View style={[listStyles.avatar, listStyles.avatarPlaceholder, { backgroundColor: catColor + '30' }]}>
            <Text style={[listStyles.avatarInitial, { color: catColor }]}>{name[0]}</Text>
          </View>
        )}
        {!isOpen && (
          <View style={listStyles.closedOverlay}>
            <Text style={listStyles.closedLabel}>FERME</Text>
          </View>
        )}
      </View>

      {/* Infos */}
      <View style={listStyles.info}>
        <Text style={listStyles.name} numberOfLines={1}>{name}</Text>

        <View style={[listStyles.badge, { backgroundColor: catColor + '28' }]}>
          <Text style={[listStyles.badgeText, { color: catColor }]}>{badgeLabel.toUpperCase()}</Text>
        </View>

        <View style={listStyles.meta}>
          <Text style={listStyles.metaText}>⏱ {deliveryTime} min</Text>
          <View style={listStyles.dot} />
          <Text style={listStyles.metaText}>
            {deliveryFee === 0 ? 'Livraison offerte' : `${deliveryFee.toLocaleString()} FC`}
          </Text>
          {rating != null && (
            <>
              <View style={listStyles.dot} />
              <Text style={listStyles.rating}>★ {rating.toFixed(1)}</Text>
            </>
          )}
        </View>
      </View>

      {/* Chevron */}
      <Text style={listStyles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Styles — variant="grid" (carte verticale avec photo)
// ═══════════════════════════════════════════════════════════════════
const gridStyles = {
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2D2D3D',
    overflow: 'hidden' as const,
  },
  cardClosed: {
    opacity: 0.5,
  },
  // ── Zone photo ──
  coverWrap: {
    height: 140,
    position: 'relative' as const,
  },
  coverImage: {
    width: '100%' as const,
    height: 140,
  },
  coverPlaceholder: {
    backgroundColor: '#141420',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  coverBand: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  coverInitial: {
    fontSize: 40,
    fontFamily: 'Syne_800ExtraBold',
    opacity: 0.35,
  },
  // ── Badge ouvert/ferme en overlay ──
  statusBadgeWrap: {
    position: 'absolute' as const,
    top: 8,
    left: 8,
  },
  badgeOpen: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#22C55E',
  },
  badgeOpenText: {
    color: '#22C55E',
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.4,
  },
  badgeClosed: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeClosedText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.4,
  },
  // ── Infos sous la photo ──
  info: {
    padding: 12,
    gap: 5,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Syne_700Bold',
  },
  catBadge: {
    alignSelf: 'flex-start' as const,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  meta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  metaText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#4B5563',
  },
  rating: {
    color: '#F59E0B',
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
  },
};

// ═══════════════════════════════════════════════════════════════════
// Styles — variant="list" (carte horizontale, pour search)
// ═══════════════════════════════════════════════════════════════════
const listStyles = {
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D3D',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    minHeight: 80,
    overflow: 'hidden' as const,
  },
  cardClosed: {
    opacity: 0.5,
  },
  colorBand: {
    width: 4,
    alignSelf: 'stretch' as const,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  avatarWrap: {
    position: 'relative' as const,
    marginLeft: 12,
    marginVertical: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  avatarInitial: {
    fontSize: 22,
    fontFamily: 'Syne_700Bold',
  },
  closedOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  closedLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    gap: 4,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Syne_700Bold',
  },
  badge: {
    alignSelf: 'flex-start' as const,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 0.6,
  },
  meta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#4B5563',
  },
  rating: {
    color: '#F59E0B',
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
  },
  chevron: {
    color: '#4B5563',
    fontSize: 24,
    fontWeight: '300' as const,
    paddingRight: 14,
    paddingLeft: 4,
  },
};
