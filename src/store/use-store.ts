import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types";

type WishlistState = {
  ids: string[];
};

type CartState = {
  lines: CartLine[];
};

type BarkleyStore = {
  cart: CartState;
  wishlist: WishlistState;
  recentSearches: string[];
  addToCart: (line: CartLine) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  toggleSavedForLater: (productId: string, variantId: string) => void;
  moveSavedToCart: (productId: string, variantId: string) => void;
  clearCart: () => void;
  applyPromoLocal: (code: string | null) => void;
  promoCode?: string | null;
  toggleWishlist: (productId: string) => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  // Clears all user-specific state on sign-out to prevent data bleeding between accounts
  clearUserData: () => void;
};

export const useBarkleyStore = create<BarkleyStore>()(
  persist(
    (set) => ({
      cart: { lines: [] },
      wishlist: { ids: [] },
      recentSearches: [],
      promoCode: null,
      clearUserData: () => {
        set({
          cart: { lines: [] },
          wishlist: { ids: [] },
          recentSearches: [],
          promoCode: null,
        });
      },
      addToCart: (line) =>
        set((state) => {
          const existingIndex = state.cart.lines.findIndex(
            (l) => l.productId === line.productId && l.variantId === line.variantId,
          );
          const nextLines = [...state.cart.lines];
          if (existingIndex >= 0) {
            const current = nextLines[existingIndex];
            nextLines[existingIndex] = {
              ...current,
              quantity: current.quantity + line.quantity,
              savedForLater: false,
            };
          } else {
            nextLines.push({ ...line, savedForLater: line.savedForLater ?? false });
          }
          return { cart: { lines: nextLines } };
        }),
      removeFromCart: (productId, variantId) =>
        set((state) => ({
          cart: {
            lines: state.cart.lines.filter((l) => !(l.productId === productId && l.variantId === variantId)),
          },
        })),
      updateQuantity: (productId, variantId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              cart: {
                lines: state.cart.lines.filter((l) => !(l.productId === productId && l.variantId === variantId)),
              },
            };
          }
          return {
            cart: {
              lines: state.cart.lines.map((l) =>
                l.productId === productId && l.variantId === variantId ? { ...l, quantity } : l,
              ),
            },
          };
        }),
      toggleSavedForLater: (productId, variantId) =>
        set((state) => ({
          cart: {
            lines: state.cart.lines.map((l) =>
              l.productId === productId && l.variantId === variantId
                ? { ...l, savedForLater: !l.savedForLater }
                : l,
            ),
          },
        })),
      moveSavedToCart: (productId, variantId) =>
        set((state) => ({
          cart: {
            lines: state.cart.lines.map((l) =>
              l.productId === productId && l.variantId === variantId ? { ...l, savedForLater: false } : l,
            ),
          },
        })),
      clearCart: () => set({ cart: { lines: [] }, promoCode: null }),
      applyPromoLocal: (code) => set({ promoCode: code }),
      toggleWishlist: (productId) =>
        set((state) => {
          const exists = state.wishlist.ids.includes(productId);
          return {
            wishlist: {
              ids: exists ? state.wishlist.ids.filter((id) => id !== productId) : [...state.wishlist.ids, productId],
            },
          };
        }),
      addRecentSearch: (term) =>
        set((state) => {
          const cleaned = term.trim();
          if (!cleaned) return state;
          const without = state.recentSearches.filter((t) => t.toLowerCase() !== cleaned.toLowerCase());
          return { recentSearches: [cleaned, ...without].slice(0, 8) };
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "barkley-bites-store",
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        recentSearches: state.recentSearches,
        promoCode: state.promoCode,
      }),
    },
  ),
);

export const selectCartItemCount = (state: BarkleyStore) =>
  state.cart.lines.filter((l) => !l.savedForLater).reduce((sum, line) => sum + line.quantity, 0);

// AFTER
export const selectActiveCartLines = (state: BarkleyStore) =>
  useBarkleyStore.getState().cart.lines.filter((l) => !l.savedForLater);
