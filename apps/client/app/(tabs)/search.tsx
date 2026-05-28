// Écran recherche — barre auto-focused, catégories, historique MMKV
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { apiRequest } from '../../lib/apiClient';
import { API } from '../../constants/api';
import { StorageService, STORAGE_KEYS } from '../../lib/storage';
import { RestaurantCard, SkeletonRestaurantCard, EmptyState } from '@wapi/ui';
import type { Restaurant } from '@wapi/types';

interface CategoryItem {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'food',      label: 'Food',     emoji: '🍗', color: '#E85D04' },
  { id: 'grocery',   label: 'Épicerie', emoji: '🛒', color: '#22C55E' },
  { id: 'drinks',    label: 'Boissons', emoji: '🍺', color: '#3B82F6' },
  { id: 'fastfood',  label: 'Fast-food',emoji: '🍕', color: '#F59E0B' },
  { id: 'healthy',   label: 'Sain',     emoji: '🥗', color: '#10B981' },
  { id: 'pharmacy',  label: 'Pharmacie',emoji: '💊', color: '#7C3AED' },
];

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Charger l'historique depuis AsyncStorage au montage
  useEffect(() => {
    StorageService.getJSON<string[]>(STORAGE_KEYS.RECENT_SEARCHES).then((s) => {
      if (s) setRecentSearches(s);
    });
  }, []);

  // Debounce 400ms
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(id);
  }, [query]);

  // Même pattern que useRestaurants : l'API retourne { restaurants, total, page, totalPages }
  const { data: results, isLoading } = useQuery<Restaurant[]>({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      const res = await apiRequest<{
        restaurants: Restaurant[];
        total: number;
        page: number;
        totalPages: number;
      }>(`${API.restaurants}?search=${encodeURIComponent(debouncedQuery)}`);
      console.log('[search] résultats:', res.restaurants?.length);
      return res.restaurants;
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 60_000,
  });

  const saveSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, 8);
    setRecentSearches(updated);
    void StorageService.setJSON(STORAGE_KEYS.RECENT_SEARCHES, updated);
  }, [recentSearches]);

  const handleRestaurantPress = (restaurant: Restaurant) => {
    saveSearch(query || restaurant.name);
    router.push(`/restaurant/${restaurant._id}`);
  };

  const handleCategoryPress = (cat: CategoryItem) => {
    setQuery(cat.label);
    setDebouncedQuery(cat.id);
  };

  const removeRecent = (term: string) => {
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    void StorageService.setJSON(STORAGE_KEYS.RECENT_SEARCHES, updated);
  };

  const hasQuery = debouncedQuery.trim().length >= 2;

  return (
    <SafeAreaView style={styles.root}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Restaurants, plats, épicerie..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => saveSearch(query)}
            clearButtonMode="while-editing"
          />
          {!!query && (
            <TouchableOpacity onPress={() => { setQuery(''); setDebouncedQuery(''); }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Contenu */}
      {!hasQuery ? (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {/* Catégories 2×3 */}
              <Animated.View entering={FadeInDown.duration(400)}>
                <Text style={styles.sectionTitle}>Catégories</Text>
                <View style={styles.categoriesGrid}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catCard, { borderColor: cat.color }]}
                      onPress={() => handleCategoryPress(cat)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.catEmoji}>{cat.emoji}</Text>
                      <Text style={[styles.catLabel, { color: cat.color }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>

              {/* Recherches récentes */}
              {recentSearches.length > 0 && (
                <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                  <View style={styles.recentHeader}>
                    <Text style={styles.sectionTitle}>Récentes</Text>
                    <TouchableOpacity onPress={() => {
                      setRecentSearches([]);
                      void StorageService.setJSON(STORAGE_KEYS.RECENT_SEARCHES, []);
                    }}>
                      <Text style={styles.clearAll}>Tout effacer</Text>
                    </TouchableOpacity>
                  </View>
                  {recentSearches.map((term) => (
                    <TouchableOpacity
                      key={term}
                      style={styles.recentItem}
                      onPress={() => { setQuery(term); setDebouncedQuery(term); }}
                    >
                      <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
                      <Text style={styles.recentText}>{term}</Text>
                      <TouchableOpacity
                        onPress={() => removeRecent(term)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close" size={14} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}
            </>
          }
        />
      ) : isLoading ? (
        <View style={styles.resultsList}>
          <SkeletonRestaurantCard />
          <SkeletonRestaurantCard />
          <SkeletonRestaurantCard />
        </View>
      ) : results && results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(r) => r._id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              <RestaurantCard
                name={item.name}
                category={item.category}
                categoryLabel={item.description || item.category}
                logoUrl={item.logo}
                deliveryTime={item.estimatedPrepTime}
                deliveryFee={0}
                rating={item.rating?.avg}
                isOpen={item.isOpen}
                onPress={() => handleRestaurantPress(item)}
              />
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyWrap}>
          <EmptyState
            emoji="🔍"
            title="Aucun résultat"
            subtitle={`Rien pour "${debouncedQuery}" pour l'instant`}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    height: '100%',
  },
  sectionTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    marginBottom: Spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  catCard: {
    width: '30.5%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 80,
    justifyContent: 'center',
  },
  catEmoji: {
    fontSize: 24,
  },
  catLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.fontSize.sm,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: Spacing.base,
  },
  clearAll: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recentText: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  resultsList: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  resultItem: {
    marginBottom: Spacing.sm,
  },
  emptyWrap: {
    flex: 1,
  },
} as const;
