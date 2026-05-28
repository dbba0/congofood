// Fiche restaurant — Maquette ecran 06 Variation B
// Cover pleine largeur · Back/Coeur overlays · Badges · Onglets · ProductCards · Panier sticky
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useRestaurant } from '../../hooks/useRestaurants';
import type { MenuByCategory } from '../../hooks/useRestaurants';
import { useCartStore } from '../../store/cartStore';
import { ProductCard } from '@wapi/ui';
import type { Product } from '@wapi/types';

export default function RestaurantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useRestaurant(id);
  const restaurant = data?.restaurant;
  const menu: MenuByCategory = data?.menu ?? {};
  const { addItem, updateQty, items } = useCartStore();
  const cartCount = useCartStore((s) => s.itemCount());
  const cartTotal = useCartStore((s) => s.total());

  const [liked, setLiked] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const getQtyInCart = (productId: string) =>
    items.find((i) => i.product._id === productId)?.qty ?? 0;

  // Le menu est deja groupe par categorie depuis l'API
  const allCategories = Object.keys(menu);

  const productsByCategory = allCategories
    .filter((cat) => !activeCategory || cat === activeCategory)
    .map((cat) => ({
      title: cat,
      data: menu[cat] ?? [],
    }));

  if (isLoading || !restaurant) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.root}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Cover image pleine largeur */}
          <View style={styles.cover}>
            {restaurant.coverImage ? (
              <Image
                source={{ uri: restaurant.coverImage }}
                style={styles.coverImage}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.coverImage, styles.coverPlaceholder]}>
                <Text style={styles.coverEmoji}>🍽️</Text>
              </View>
            )}

            {/* Gradient en bas de la cover */}
            <LinearGradient
              colors={['transparent', Colors.background]}
              style={styles.coverGradient}
            />

            {/* Back button rond overlay */}
            <TouchableOpacity
              style={[styles.overlayBtn, styles.backBtn]}
              onPress={() => router.back()}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>

            {/* Coeur rond overlay */}
            <TouchableOpacity
              style={[styles.overlayBtn, styles.favBtn]}
              onPress={() => setLiked(!liked)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={20}
                color={liked ? Colors.error : Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Infos restaurant */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.meta}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>

            {/* Badges : categorie + ouvert/ferme */}
            <View style={styles.badgeRow}>
              <View style={styles.badgeCat}>
                <Text style={styles.badgeCatText}>
                  {(restaurant.category || 'food').toUpperCase()}
                </Text>
              </View>
              {restaurant.isOpen ? (
                <View style={styles.badgeOpen}>
                  <View style={styles.badgeDot} />
                  <Text style={styles.badgeOpenText}>OUVERT</Text>
                </View>
              ) : (
                <View style={styles.badgeClosed}>
                  <Text style={styles.badgeClosedText}>FERME</Text>
                </View>
              )}
            </View>

            {/* Meta : note · avis · temps · distance · quartier */}
            <View style={styles.metaRow}>
              {restaurant.rating && (
                <>
                  <Text style={styles.metaStar}>★</Text>
                  <Text style={styles.metaBold}>{restaurant.rating.avg.toFixed(1)}</Text>
                  <Text style={styles.metaText}> · {restaurant.rating.count} avis</Text>
                  <View style={styles.metaDot} />
                </>
              )}
              <Text style={styles.metaText}>{restaurant.estimatedPrepTime} min</Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>{restaurant.address?.quartier || 'Kinshasa'}</Text>
            </View>
          </Animated.View>

          {/* Onglets filtres scrollables — style maquette */}
          {allCategories.length > 0 && (
            <View style={styles.tabsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsList}
              >
                <TouchableOpacity
                  style={styles.tab}
                  onPress={() => setActiveCategory(null)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabText, !activeCategory && styles.tabTextActive]}>
                    Tout
                  </Text>
                  {!activeCategory && <View style={styles.tabUnderline} />}
                </TouchableOpacity>
                {allCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.tab}
                    onPress={() => setActiveCategory(cat === activeCategory ? null : cat)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>
                      {cat}
                    </Text>
                    {activeCategory === cat && <View style={styles.tabUnderline} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Menu — ProductCards directement sans padding wrapper */}
          {productsByCategory.map((section) => (
            <View key={section.title}>
              {/* Titre section si plusieurs categories affichees */}
              {!activeCategory && allCategories.length > 1 && (
                <Text style={styles.sectionTitle}>{section.title}</Text>
              )}
              {section.data.map((product) => (
                <ProductCard
                  key={product._id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  imageUrl={product.image}
                  isAvailable={product.isAvailable}
                  quantity={getQtyInCart(product._id)}
                  onAdd={() => addItem(product, 1, [])}
                  onRemove={() => {
                    const qty = getQtyInCart(product._id);
                    if (qty > 0) updateQty(product._id, qty - 1);
                  }}
                />
              ))}
            </View>
          ))}

          {/* Espace pour le bouton sticky */}
          <View style={{ height: cartCount > 0 ? 100 : 40 }} />
        </ScrollView>

        {/* Bouton panier sticky en bas */}
        {cartCount > 0 && (
          <Animated.View entering={FadeInUp.duration(300)} style={styles.cartBar}>
            <TouchableOpacity
              style={styles.cartBtn}
              onPress={() => router.push('/cart')}
              activeOpacity={0.85}
            >
              <Text style={styles.cartBtnText}>
                {cartCount} · Voir le panier →
              </Text>
              <Text style={styles.cartBtnPrice}>
                {cartTotal.toLocaleString()} CDF
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontFamily: 'DMSans_400Regular',
  },

  // ── Cover ──
  cover: {
    height: 220,
    width: '100%' as const,
    position: 'relative' as const,
  },
  coverImage: {
    width: '100%' as const,
    height: 220,
  },
  coverPlaceholder: {
    backgroundColor: '#1A1A2E',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  coverEmoji: {
    fontSize: 56,
    opacity: 0.4,
  },
  coverGradient: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  overlayBtn: {
    position: 'absolute' as const,
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  backBtn: {
    top: 52,
    left: 16,
  },
  favBtn: {
    top: 52,
    right: 16,
  },

  // ── Meta restaurant ──
  meta: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    marginTop: -10,
    position: 'relative' as const,
    zIndex: 1,
  },
  restaurantName: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 24,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 10,
  },
  badgeCat: {
    backgroundColor: 'rgba(232,93,4,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeCatText: {
    color: Colors.orange,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.6,
  },
  badgeOpen: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: 'rgba(34,197,94,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  badgeOpenText: {
    color: Colors.success,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.6,
  },
  badgeClosed: {
    backgroundColor: 'rgba(239,68,68,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeClosedText: {
    color: Colors.error,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.6,
  },
  metaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: 4,
  },
  metaStar: {
    color: '#F59E0B',
    fontSize: 13,
  },
  metaBold: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    fontWeight: '600' as const,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 2,
  },

  // ── Onglets filtres ──
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabsList: {
    paddingHorizontal: 20,
    gap: 20,
  },
  tab: {
    paddingVertical: 12,
    position: 'relative' as const,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  tabUnderline: {
    position: 'absolute' as const,
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.lime,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // ── Section titre ──
  sectionTitle: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 14,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },

  // ── Bouton panier sticky ──
  cartBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  cartBtn: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.lg,
    height: 56,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
  },
  cartBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 15,
    color: Colors.textInverse,
  },
  cartBtnPrice: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: Colors.textInverse,
    fontWeight: '600' as const,
  },
};
