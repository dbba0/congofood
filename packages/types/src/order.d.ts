import type { Currency } from './product';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picking_up' | 'on_the_way' | 'delivered' | 'cancelled';
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
//# sourceMappingURL=order.d.ts.map