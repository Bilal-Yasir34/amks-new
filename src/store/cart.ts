import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantCombinationId: string | null) => void;
  updateQuantity: (productId: string, variantCombinationId: string | null, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  subtotal: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,
      isOpen: false,
      addItem: (item) => {
        const items = get().items;
        const existing = items.find(
          (i) => i.product_id === item.product_id && i.variant_combination_id === item.variant_combination_id,
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i.product_id === item.product_id && i.variant_combination_id === item.variant_combination_id
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                : i,
            ),
            isOpen: true,
          });
        } else {
          set({ items: [...items, item], isOpen: true });
        }
      },
      removeItem: (productId, variantCombinationId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product_id === productId && i.variant_combination_id === variantCombinationId),
          ),
        })),
      updateQuantity: (productId, variantCombinationId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === productId && i.variant_combination_id === variantCombinationId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
              : i,
          ),
        })),
      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),
      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'amks-cart' },
  ),
);
