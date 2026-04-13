import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─────────────────────────────────────────────────────────────
//  Cart Store
//  Manages the multi-service cart (mapped to Event Plan Items
//  in the backend schema).
//  Persisted to localStorage under the key 'eventat_cart'.
//
//  Cart item shape:
//  {
//    serviceId   : number,
//    title       : string,
//    vendorName  : string,
//    imageUrl    : string,
//    basePrice   : number,           // unit price in JOD
//    quantity    : number,           // default 1
//    eventDate   : string | null,    // ISO date string
//  }
// ─────────────────────────────────────────────────────────────

const useCartStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────
      /** @type {Array<{ serviceId: number, title: string, vendorName: string, imageUrl: string, basePrice: number, quantity: number, eventDate: string|null }>} */
      items: [],

      // ── Actions ──────────────────────────────────────────────

      /**
       * Add a service to the cart.
       * If the same serviceId already exists, update its eventDate / quantity
       * instead of duplicating the entry.
       *
       * @param {{
       *   serviceId  : number,
       *   title      : string,
       *   vendorName : string,
       *   imageUrl   : string,
       *   basePrice  : number,
       *   quantity?  : number,
       *   eventDate? : string | null,
       * }} item
       */
      addItem: (item) => {
        const { items } = get();
        const existing = items.find((i) => i.serviceId === item.serviceId);

        if (existing) {
          // Update the existing entry (e.g., new date or quantity)
          set({
            items: items.map((i) =>
              i.serviceId === item.serviceId
                ? {
                    ...i,
                    quantity: item.quantity ?? i.quantity,
                    eventDate: item.eventDate ?? i.eventDate,
                  }
                : i,
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                serviceId: item.serviceId,
                title: item.title,
                vendorName: item.vendorName,
                imageUrl: item.imageUrl,
                basePrice: item.basePrice,
                quantity: item.quantity ?? 1,
                eventDate: item.eventDate ?? null,
              },
            ],
          });
        }
      },

      /**
       * Remove a service from the cart by serviceId.
       * @param {number} serviceId
       */
      removeItem: (serviceId) => {
        set({ items: get().items.filter((i) => i.serviceId !== serviceId) });
      },

      /**
       * Update a specific field on an existing cart item.
       * @param {number} serviceId
       * @param {Partial<{ quantity: number, eventDate: string | null }>} updates
       */
      updateItem: (serviceId, updates) => {
        set({
          items: get().items.map((i) =>
            i.serviceId === serviceId ? { ...i, ...updates } : i,
          ),
        });
      },

      /**
       * Remove all items from the cart.
       * Called after a successful order / event plan submission.
       */
      clearCart: () => set({ items: [] }),

      // ── Derived / Computed ────────────────────────────────────

      /**
       * Total number of distinct services in the cart.
       * (Not sum of quantities — each service line counts as 1.)
       */
      getItemCount: () => get().items.length,

      /**
       * Sum of (basePrice × quantity) across all cart items.
       * Returns a number rounded to 2 decimal places.
       */
      getTotalCost: () => {
        const total = get().items.reduce(
          (sum, item) => sum + item.basePrice * item.quantity,
          0,
        );
        return Math.round(total * 100) / 100;
      },

      /**
       * Returns true if the given serviceId is already in the cart.
       * @param {number} serviceId
       */
      isInCart: (serviceId) =>
        get().items.some((i) => i.serviceId === serviceId),
    }),

    // ── Persist config ──────────────────────────────────────────
    {
      name: 'eventat_cart',
      storage: createJSONStorage(() => localStorage),
      // Persist only the items array
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export default useCartStore;
