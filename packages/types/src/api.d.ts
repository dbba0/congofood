/** Enveloppe standard pour toutes les réponses API */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
/** Enveloppe pour les réponses paginées */
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    message?: string;
}
/** Tokens JWT retournés à la connexion / refresh */
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    /** Durée de validité du access token en secondes */
    expiresIn: number;
}
/** Réponse d'erreur standard */
export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
    statusCode: number;
}
//# sourceMappingURL=api.d.ts.map