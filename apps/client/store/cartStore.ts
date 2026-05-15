import { create } from 'zustand';
import type { Product, OrderItemSelectedOption, Currency } from '@congofood/types';

export interface CartItem {
  product: Product;
  qty: number;
  selectedOptions: OrderItemSelectedOption[];
  /** Prix unitaire final incluant les options */
  unitPrice: number;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  currency: Currency;

  addItem: (product: Product, qty: number, selectedOptions: OrderItemSelectedOption[]) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;

  // Computed
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  restaurantId: null,
  currency: 'CDF',

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
  },

  removeItem: (productId) =>
    set((s) => ({
      items: s.items.filter((i) => i.product._id !== productId),
      restaurantId: s.items.length === 1 ? null : s.restaurantId,
    })),

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
  },

  clearCart: () => set({ items: [], restaurantId: null }),

  total: () =>
    get().items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0),

  itemCount: () =>
    get().items.reduce((sum, item) => sum + item.qty, 0),
}));
