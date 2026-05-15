import type { Currency } from './product';

export type OrderStatus =
  | 'pending'      // En attente de confirmation du restaurant
  | 'confirmed'    // Confirmé par le restaurant
  | 'preparing'    // En cours de préparation
  | 'ready'        // Prêt à être récupéré
  | 'picking_up'   // Livreur en route vers le restaurant
  | 'on_the_way'   // Livreur en route vers le client
  | 'delivered'    // Livré
  | 'cancelled';   // Annulé

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItemSelectedOption {
  optionName: string;
  choiceLabel: string;
  priceDelta: number;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  qty: number;
  selectedOptions: OrderItemSelectedOption[];
}

export interface OrderDeliveryAddress {
  label: string;
  coords: {
    lat: number;
    lng: number;
  };
  instructions?: string;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  timestamp: string;
}

export interface Order {
  _id: string;
  client: string;
  restaurant: string;
  /** Référence vers le livreur (null tant que non assigné) */
  livreur?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryAddress: OrderDeliveryAddress;
  /** Historique des changements de statut */
  timeline: OrderTimelineEntry[];
  /** Heure de livraison estimée (ISO 8601) */
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
