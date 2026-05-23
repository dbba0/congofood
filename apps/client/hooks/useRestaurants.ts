// Hook React Query pour charger les restaurants par quartier
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/apiClient';
import { API } from '../constants/api';
import type { Restaurant } from '@wapi/types';

// Format retourné par GET /api/restaurants
interface RestaurantsResponse {
  restaurants: Restaurant[];
  total: number;
  page: number;
  totalPages: number;
}

export function useRestaurants(quartier?: string) {
  return useQuery<Restaurant[]>({
    queryKey: ['restaurants', quartier],
    queryFn: async () => {
      const res = await apiRequest<RestaurantsResponse>(
        `${API.restaurants}${quartier ? `?quartier=${encodeURIComponent(quartier)}` : ''}`
      );
      return res.restaurants;
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 2000,
    enabled: !!quartier,
  });
}

// Format retourné par GET /api/restaurants/:id
// { restaurant: {...}, menu: { "Plats principaux": Product[], "Boissons": Product[] } }
import type { Product } from '@wapi/types';

export type MenuByCategory = Record<string, Product[]>;

interface RestaurantDetailResponse {
  restaurant: Restaurant;
  menu: MenuByCategory;
}

export interface RestaurantWithMenu {
  restaurant: Restaurant;
  menu: MenuByCategory;
}

export function useRestaurant(id?: string) {
  return useQuery<RestaurantWithMenu>({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const res = await apiRequest<RestaurantDetailResponse>(
        `${API.restaurants}/${id}`
      );
      console.log('restaurant:', res.restaurant?.name);
      console.log('menu:', Object.keys(res.menu || {}));
      return { restaurant: res.restaurant, menu: res.menu || {} };
    },
    enabled: !!id,
  });
}
