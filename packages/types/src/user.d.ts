export type UserRole = 'client' | 'restaurant' | 'livreur' | 'admin';
export interface UserAddress {
    label: string;
    coords: {
        lat: number;
        lng: number;
    };
    /** Quartier de Kinshasa (ex: Gombe, Lemba, Lingwala...) */
    quartier: string;
}
export interface User {
    _id: string;
    phone: string;
    email?: string;
    name: string;
    role: UserRole;
    address?: UserAddress;
    /** Token FCM pour les notifications push */
    deviceToken?: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt?: string;
}
/** Payload renvoyé lors de l'authentification */
export interface AuthUser extends Omit<User, '_id'> {
    _id: string;
}
//# sourceMappingURL=user.d.ts.map