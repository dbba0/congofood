// Détail restaurant — cover, infos, menu par catégorie, ajout panier
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SectionList,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useRestaurant } from '../../hooks/useRestaurants';
import { useCartStore } from '../../store/cartStore';
import { ProductCard, Badge } from '@congofood/ui';
import type { Product } from '@congofood/types';

export default function RestaurantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: restaurant, isLoading } = useRestaurant(id);
  const { addItem, updateQty, items } = useCartStore();
  const cartCount = useCartStore((s) => s.itemCount());

  const [liked, setLiked] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const getQtyInCart = (productId: string) =>
    items.find((i) => i.product._id === productId)?.qty ?? 0;

  // Grouper les produits par catégorie
  const productsByCategory = (() => {
    if (!restaurant) return [];
    // On suppose que le restaurant contient les produits (populated depuis l'API)
    const products = (restaurant as unknown as { products?: Product[] }).products ?? [];
    const categories = [...new Set(products.map((p) => p.category))];
    return categories
      .filter((cat) => !activeCategory || cat === activeCategory)
      .map((cat) => ({
        title: cat,
        data: products.filter((p) => p.category === cat),
      }));
  })();

  const allCategories = (() => {
    if (!restaurant) return [];
    const products = (restaurant as unknown as { products?: Product[] }).products ?? [];
    return [...new Set(products.map((p) => p.category))];
  })();

  if (isLoading || !restaurant) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => setLiked(!liked)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={22}
                color={liked ? Colors.error : Colors.textPrimary}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.root}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Cover */}
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
          </View>

          {/* Infos restaurant */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.info}>
            <View style={styles.infoRow}>
              <View style={styles.logo}>
                {restaurant.logo ? (
                  <Image
                    source={{ uri: restaurant.logo }}
                    style={styles.logoImg}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.logoEmoji}>🏪</Text>
                )}
              </View>
              <View style={styles.infoBadges}>
                {restaurant.isOpen
                  ? <Badge label="Ouvert" variant="success" size="sm" />
                  : <Badge label="Fermé" variant="error" size="sm" />
                }
                {restaurant.isVerified && (
                  <Badge label="Vérifié ✓" variant="info" size="sm" />
                )}
              </View>
            </View>

            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            {restaurant.description && (
              <Text style={styles.restaurantDesc}>{restaurant.description}</Text>
            )}

            <View style={styles.metaRow}>
              {restaurant.rating && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaEmoji}>⭐</Text>
                  <Text style={styles.metaText}>
                    {restaurant.rating.avg.toFixed(1)} ({restaurant.rating.count})
                  </Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Text style={styles.metaEmoji}>⏱️</Text>
                <Text style={styles.metaText}>{restaurant.estimatedPrepTime} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaEmoji}>📍</Text>
                <Text style={styles.metaText}>{restaurant.address?.quartier || 'Kinshasa'}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Filtre catégories */}
          {allCategories.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catList}
              style={styles.catScroll}
            >
              <TouchableOpacity
                style={[styles.catChip, !activeCategory && styles.catChipActive]}
                onPress={() => setActiveCategory(null)}
              >
                <Text style={[styles.catChipText, !activeCategory && styles.catChipTextActive]}>
                  Tout
                </Text>
              </TouchableOpacity>
              {allCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
                  onPress={() => setActiveCategory(cat === activeCategory ? null : cat)}
                >
                  <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Menu */}
          {productsByCategory.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.data.map((product) => (
                <View key={product._id} style={styles.productWrap}>
                  <ProductCard
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
                </View>
              ))}
            </View>
          ))}

          <View style={{ height: cartCount > 0 ? 100 : Spacing['2xl'] }} />
        </ScrollView>

        {/* Bouton panier sticky */}
        {cartCount > 0 && (
          <Animated.View entering={FadeInUp.duration(300)} style={styles.cartBar}>
            <TouchableOpacity
              style={styles.cartBtn}
              onPress={() => router.push('/cart')}
              activeOpacity={0.85}
            >
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
              <Text style={styles.cartBtnText}>Voir le panier</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.textInverse} />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontFamily: 'DMSans_400Regular',
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.sm,
  },
  cover: {
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  coverPlaceholder: {
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: {
    fontSize: 48,
  },
  info: {
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    width: 56,
    height: 56,
  },
  logoEmoji: {
    fontSize: 24,
  },
  infoBadges: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  restaurantName: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  restaurantDesc: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaEmoji: {
    fontSize: 13,
  },
  metaText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  catScroll: {
    backgroundColor: Colors.surface,
  },
  catList: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  catChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 32,
    justifyContent: 'center',
  },
  catChipActive: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  catChipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  catChipTextActive: {
    color: Colors.textPrimary,
  },
  section: {
    paddingTop: Spacing.base,
  },
  sectionTitle: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productWrap: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
    backgroundColor: 'transparent',
  },
  cartBtn: {
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.lg,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  cartBadge: {
    backgroundColor: Colors.textInverse,
    borderRadius: BorderRadius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.lime,
  },
  cartBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.textInverse,
  },
} as const;
