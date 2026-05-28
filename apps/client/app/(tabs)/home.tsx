// Ecran d'accueil — Variation B Vibrant & Communaute — Grille 2 colonnes
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useRestaurants } from '../../hooks/useRestaurants';
import { StorageService, STORAGE_KEYS } from '../../lib/storage';
import { RestaurantCard, SkeletonRestaurantGridCard, EmptyState } from '@wapi/ui';
import type { Restaurant } from '@wapi/types';

interface Categorie {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

const CATEGORIES: Categorie[] = [
  { id: 'food',      label: 'Food',     emoji: '🍗', color: '#E85D04' },
  { id: 'grocery',   label: 'Epicerie', emoji: '🛒', color: '#22C55E' },
  { id: 'drinks',    label: 'Boissons', emoji: '🍺', color: '#3B82F6' },
  { id: 'fastfood',  label: 'Fast-food',emoji: '🍕', color: '#F59E0B' },
  { id: 'healthy',   label: 'Sain',     emoji: '🥗', color: '#10B981' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [quartier, setQuartier] = useState('Gombe');

  useEffect(() => {
    StorageService.get(STORAGE_KEYS.QUARTER).then((q) => {
      if (q) setQuartier(q);
    });
  }, []);

  const { data: restaurants, isLoading } = useRestaurants(quartier);

  const filtered = activeCategory
    ? restaurants?.filter((r) => r.category === activeCategory)
    : restaurants;

  const firstName = user?.name?.split(' ')[0] || 'la';

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Mbote 👋</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => router.push('/cart')}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={24} color={Colors.textPrimary} />
            {itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Adresse de livraison */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <TouchableOpacity
            style={styles.addressRow}
            onPress={() => router.push('/(auth)/select-quarter')}
            activeOpacity={0.7}
          >
            <Text style={styles.addressPin}>📍</Text>
            <Text style={styles.addressLabel}>Livrer a :</Text>
            <Text style={styles.addressValue}>{quartier}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.orange} />
          </TouchableOpacity>
        </Animated.View>

        {/* Barre de recherche */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)}>
          <Pressable
            style={styles.searchBar}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.searchPlaceholder}>
              Restaurants, plats, epicerie...
            </Text>
          </Pressable>
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)}>
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(c) => c.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
            style={styles.categoriesScroll}
            renderItem={({ item }) => {
              const active = activeCategory === item.id;
              return (
                <TouchableOpacity
                  style={[
                    styles.catChip,
                    active
                      ? { backgroundColor: item.color, borderColor: item.color }
                      : { borderColor: item.color },
                  ]}
                  onPress={() => setActiveCategory(active ? null : item.id)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.catEmoji}>{item.emoji}</Text>
                  <Text style={[styles.catLabel, active && styles.catLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </Animated.View>

        {/* Banniere promo */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.bannerWrap}>
          <LinearGradient
            colors={['#7C3AED', '#E85D04']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.banner}
          >
            <View>
              <Text style={styles.bannerTitle}>
                1ere commande = livraison offerte 🎉
              </Text>
              <Text style={styles.bannerCode}>CODE · KIN2026</Text>
            </View>
            <Text style={styles.bannerEmoji}>🛵</Text>
          </LinearGradient>
        </Animated.View>

        {/* Section restaurants — Grille 2 colonnes */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Pres de toi <Text style={styles.sectionAccent}>a {quartier}</Text>
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.sectionLink}>Voir tout →</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                <SkeletonRestaurantGridCard />
                <SkeletonRestaurantGridCard />
              </View>
              <View style={styles.gridRow}>
                <SkeletonRestaurantGridCard />
                <SkeletonRestaurantGridCard />
              </View>
            </View>
          ) : filtered && filtered.length > 0 ? (
            <View style={styles.gridContainer}>
              {/* Grille manuelle 2 colonnes — pas de FlatList imbriquee */}
              {chunkArray(filtered, 2).map((row, rowIdx) => (
                <View key={rowIdx} style={styles.gridRow}>
                  {row.map((restaurant: Restaurant) => (
                    <RestaurantCard
                      key={restaurant._id}
                      name={restaurant.name}
                      category={restaurant.category}
                      categoryLabel={restaurant.description || restaurant.category}
                      coverUrl={restaurant.coverImage}
                      logoUrl={restaurant.logo}
                      deliveryTime={restaurant.estimatedPrepTime}
                      deliveryFee={0}
                      rating={restaurant.rating?.avg}
                      isOpen={restaurant.isOpen}
                      variant="grid"
                      style={styles.gridCard}
                      onPress={() => router.push(`/restaurant/${restaurant._id}`)}
                    />
                  ))}
                  {/* Spacer si nombre impair */}
                  {row.length === 1 && <View style={styles.gridCard} />}
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              emoji="🍽️"
              title="Aucun restaurant pour l'instant"
              subtitle={`Pas encore de partenaire a ${quartier}, on arrive bientot !`}
            />
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Decoupe un tableau en groupes de N */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing['2xl'],
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  userName: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
  },
  cartBtn: {
    width: 44,
    height: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cartBadge: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    backgroundColor: Colors.orange,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontSize: 9,
    color: Colors.textPrimary,
    fontWeight: 'bold' as const,
  },
  addressRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  addressPin: {
    fontSize: 14,
  },
  addressLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginRight: 2,
  },
  addressValue: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.orange,
  },
  searchBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#1A1A2E',
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.base,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 48,
    gap: Spacing.sm,
  },
  searchPlaceholder: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textMuted,
  },
  categoriesScroll: {
    marginTop: Spacing.sm,
  },
  categoriesList: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  catChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 5,
    height: 36,
  },
  catEmoji: {
    fontSize: 15,
  },
  catLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  catLabelActive: {
    color: Colors.textPrimary,
  },
  bannerWrap: {
    paddingHorizontal: Spacing.base,
    marginVertical: Spacing.base,
  },
  banner: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  bannerTitle: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bannerCode: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.lime,
    letterSpacing: 1,
  },
  bannerEmoji: {
    fontSize: 32,
  },
  // ── Section titre ──
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 20,
    color: Colors.textPrimary,
  },
  sectionAccent: {
    color: Colors.orange,
  },
  sectionLink: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.lime,
  },
  // ── Grille 2 colonnes ──
  gridContainer: {
    paddingHorizontal: Spacing.base,
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  gridCard: {
    flex: 1,
  },
};
