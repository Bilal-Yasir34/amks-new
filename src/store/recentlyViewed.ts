import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedState {
  productIds: string[];
  addProduct: (id: string) => void;
  clear: () => void;
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      productIds: [],
      addProduct: (id) => {
        const existing = get().productIds.filter((pid) => pid !== id);
        set({ productIds: [id, ...existing].slice(0, 8) });
      },
      clear: () => set({ productIds: [] }),
    }),
    { name: 'amks-recently-viewed' },
  ),
);
