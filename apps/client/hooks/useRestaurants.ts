// Hook React Query pour charger les restaurants par quartier
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/apiClient';
import { API } from '../constants/api';
import type { Restaurant } from '@congofood/types';

export function useRestaurants(quartier?: string) {
  return useQuery<Restaurant[]>({
    queryKey: ['restaurants', quartier],
    queryFn: () =>
      apiRequest<Restaurant[]>(
        `${API.restaurants}${quartier ? `?quartier=${encodeURIComponent(quartier)}` : ''}`
      ),
    staleTime: 5 * 60 * 1000,
    enabled: !!quartier,
  });
}

export function useRestaurant(id?: string) {
  return useQuery<Restaurant>({
    queryKey: ['restaurant', id],
    queryFn: () => apiRequest<Restaurant>(`${API.restaurants}/${id}`),
    enabled: !!id,
  });
}
