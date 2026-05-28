import { create } from 'zustand';
import { StorageService } from '../lib/storage';
import type { Product, OrderItemSelectedOption, Currency } from '@wapi/types';

// Clé de persistance du panier
const CART_STORAGE_KEY = 'wapi_cart';

export interface CartItem {
  product: Product;
  qty: number;
  selectedOptions: OrderItemSelectedOption[];
  /** Prix unitaire final incluant les options */
  unitPrice: number;
}

/** Données sérialisées dans AsyncStorage */
interface CartPersisted {
  items: CartItem[];
  restaurantId: string | null;
  currency: Currency;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  currency: Currency;
  _hydrated: boolean;

  addItem: (product: Product, qty: number, selectedOptions: OrderItemSelectedOption[]) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  /** Charger le panier depuis AsyncStorage au démarrage */
  hydrate: () => Promise<void>;

  // Computed
  total: () => number;
  itemCount: () => number;
}

/** Sauvegarde le panier dans AsyncStorage (appel non-bloquant) */
function persistCart(state: { items: CartItem[]; restaurantId: string | null; currency: Currency }) {
  const data: CartPersisted = {
    items: state.items,
    restaurantId: state.restaurantId,
    currency: state.currency,
  };
  void StorageService.setJSON(CART_STORAGE_KEY, data);
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  restaurantId: null,
  currency: 'CDF',
  _hydrated: false,

  hydrate: async () => {
    try {
      const data = await StorageService.getJSON<CartPersisted>(CART_STORAGE_KEY);
      if (data && data.items && data.items.length > 0) {
        set({
          items: data.items,
          restaurantId: data.restaurantId,
          currency: data.currency,
          _hydrated: true,
        });
        return;
      }
    } catch {
      // Données corrompues — on repart de zéro
    }
    set({ _hydrated: true });
  },

  addItem: (product, qty, selectedOptions) => {
    const state = get();

    // Panier vide seulement si on change de restaurant
    if (state.restaurantId && state.restaurantId !== product.restaurant) {
      set({ items: [], restaurantId: null });
    }

    const optionsDelta = selectedOptions.reduce((sum, o) => sum + o.priceDelta, 0);
    const unitPrice = product.price + optionsDelta;

    const existingIndex = state.items.findIndex((i) => i.product._id === product._id);

    if (existingIndex >= 0) {
      const updatedItems = [...state.items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        qty: updatedItems[existingIndex].qty + qty,
      };
      set({ items: updatedItems });
    } else {
      set((s) => ({
        items: [...s.items, { product, qty, selectedOptions, unitPrice }],
        restaurantId: product.restaurant,
        currency: product.currency,
      }));
    }

    // Persister après modification
    persistCart(get());
  },

  removeItem: (productId) => {
    set((s) => ({
      items: s.items.filter((i) => i.product._id !== productId),
      restaurantId: s.items.length === 1 ? null : s.restaurantId,
    }));
    persistCart(get());
  },

  updateQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId);
      return;
    }
    set((s) => ({
      items: s.items.map((i) =>
        i.product._id === productId ? { ...i, qty } : i
      ),
    }));
    persistCart(get());
  },

  clearCart: () => {
    set({ items: [], restaurantId: null });
    // Supprimer du stockage
    void StorageService.delete(CART_STORAGE_KEY);
  },

  total: () =>
    get().items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0),

  itemCount: () =>
    get().items.reduce((sum, item) => sum + item.qty, 0),
}));
