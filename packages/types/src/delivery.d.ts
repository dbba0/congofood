export type DeliveryStatus = 'assigned' | 'picking_up' | 'delivering' | 'completed';
export interface DeliveryLocation {
    lat: number;
    lng: number;
    /** Dernière mise à jour de la position (ISO 8601) */
    updatedAt: string;
}
export interface Delivery {
    _id: string;
    order: string;
    livreur: string;
    status: DeliveryStatus;
    /** Position GPS en temps réel du livreur */
    currentLocation: DeliveryLocation;
    distanceKm: number;
    /** Gains du livreur pour cette mission en CDF */
    earningsAmount: number;
    pickedUpAt?: string;
    deliveredAt?: string;
    createdAt: string;
    updatedAt?: string;
}
//# sourceMappingURL=delivery.d.ts.map