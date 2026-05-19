export type Currency = 'CDF' | 'USD';
export interface ProductOptionChoice {
    label: string;
    /** Supplément de prix (peut être 0 ou négatif pour une réduction) */
    priceDelta: number;
}
export interface ProductOption {
    name: string;
    choices: ProductOptionChoice[];
}
export interface Product {
    _id: string;
    /** Référence vers le restaurant */
    restaurant: string;
    name: string;
    description: string;
    image: string;
    price: number;
    currency: Currency;
    category: string;
    isAvailable: boolean;
    /** Options de personnalisation (ex: taille, cuisson, extras...) */
    options: ProductOption[];
    createdAt: string;
    updatedAt?: string;
}
//# sourceMappingURL=product.d.ts.map