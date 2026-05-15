export type RestaurantCategory = 'food' | 'grocery' | 'pharmacy' | 'other';

export interface OpeningHour {
  /** 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi */
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open: string;  // format "HH:mm"
  close: string; // format "HH:mm"
}

export interface RestaurantRating {
  avg: number;
  count: number;
}

export interface RestaurantAddress {
  label: string;
  coords: {
    lat: number;
    lng: number;
  };
  quartier: string;
}

export interface Restaurant {
  _id: string;
  /** Référence vers l'utilisateur propriétaire (role: 'restaurant') */
  owner: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  category: RestaurantCategory;
  address: RestaurantAddress;
  openingHours: OpeningHour[];
  isOpen: boolean;
  /** Rayon de livraison en kilomètres */
  deliveryRadius: number;
  /** Montant minimum de commande en CDF */
  minOrderAmount: number;
  /** Temps de préparation estimé en minutes */
  estimatedPrepTime: number;
  rating: RestaurantRating;
  /** Validé par l'admin CongoFood */
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}
