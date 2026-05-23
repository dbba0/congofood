// Écran d'accueil — Variation B Vibrant & Communauté
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Pressable,
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
import { RestaurantCard, SkeletonRestaurantCard, EmptyState } from '@wapi/ui';
import type { Restaurant } from '@wapi/types';

interface Categorie {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

const CATEGORIES: Categorie[] = [
  { id: 'food',      label: 'Food',     emoji: '🍗', color: '#E85D04' },
  { id: 'grocery',   label: 'Épicerie', emoji: '🛒', color: '#22C55E' },
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

  const { data: restaurants, isLoading, error } = useRestaurants(quartier);

  const filtered = activeCategory
    ? restaurants?.filter((r) => r.category === activeCategory)
    : restaurants;

  const firstName = user?.name?.split(' ')[0] || 'là';

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
            <Text style={styles.addressLabel}>Livrer à :</Text>
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
              Restaurants, plats, épicerie...
            </Text>
          </Pressable>
        </Animated.View>

        {/* Catégories */}
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

        {/* Bannière promo */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.bannerWrap}>
          <LinearGradient
            colors={['#7C3AED', '#E85D04']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.banner}
          >
            <View>
              <Text style={styles.bannerTitle}>
                1ère commande = livraison offerte 🎉
              </Text>
              <Text style={styles.bannerCode}>CODE · KIN2026</Text>
            </View>
            <Text style={styles.bannerEmoji}>🛵</Text>
          </LinearGradient>
        </Animated.View>

        {/* Section restaurants */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)}>
          <Text style={styles.sectionTitle}>
            Près de toi · {quartier}
          </Text>

          {isLoading ? (
            <>
              <SkeletonRestaurantCard />
              <SkeletonRestaurantCard />
              <SkeletonRestaurantCard />
            </>
          ) : filtered && filtered.length > 0 ? (
            filtered.map((restaurant: Restaurant) => (
              <View key={restaurant._id} style={styles.cardWrap}>
                <RestaurantCard
                  name={restaurant.name}
                  category={restaurant.category}
                  logoUrl={restaurant.logo}
                  deliveryTime={restaurant.estimatedPrepTime}
                  deliveryFee={0}
                  rating={restaurant.rating?.avg}
                  isOpen={restaurant.isOpen}
                  onPress={() => router.push(`/restaurant/${restaurant._id}`)}
                />
              </View>
            ))
          ) : (
            <EmptyState
              emoji="🍽️"
              title="Aucun restaurant pour l'instant"
              subtitle={`Pas encore de partenaire à ${quartier}, on arrive bientôt !`}
            />
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
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
  content: {
    paddingBottom: Spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.orange,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontSize: 9,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  sectionTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  cardWrap: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
} as const;
