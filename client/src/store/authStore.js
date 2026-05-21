import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─────────────────────────────────────────────────────────────
//  Auth Store
//  Manages: user session, JWT token, and authentication state.
//  Persisted to localStorage under the key 'eventat_auth'.
//
//  NOTE: The token is ALSO written to localStorage as 'eventat_token'
//  so the Axios interceptor in api.js can read it directly without
//  having to parse the full persisted Zustand JSON blob.
// ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'eventat_token';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────
      /** @type {{ id: number, username: string, email: string, full_name: string, role: 'customer'|'vendor'|'admin', phone?: string, avatar_url?: string } | null} */
      user: null,
      /** @type {string | null} */
      token: null,
      /** @type {boolean} */
      isAuthenticated: false,

      // // ── State ────────────────────────────────────────────────
      // /** @type {{ id: number, username: string, email: string, full_name: string, role: 'customer'|'vendor'|'admin', phone?: string, avatar_url?: string } | null} */
      // user: { full_name: 'Diyaa Daifi', role: 'customer', avatar_url: 'https://i.pravatar.cc/150?img=11' },
      // /** @type {string | null} */
      // token: 'fake-token-123',
      // /** @type {boolean} */
      // isAuthenticated: true,

      // ── Actions ──────────────────────────────────────────────

      /**
       * Called after a successful login API response.
       * Stores user + token in state AND syncs token to localStorage
       * so the Axios interceptor can read it without parsing Zustand JSON.
       *
       * @param {{ id: number, username: string, email: string, role: string, full_name: string }} user
       * @param {string} token  JWT access token
       */
      login: (user, token) => {
        // Sync raw token for Axios interceptor in api.js
        localStorage.setItem(TOKEN_KEY, token);
        set({ user, token, isAuthenticated: true });
      },

      /**
       * Clears all auth state and removes the raw token key.
       * Should be called on logout and on 401 interception.
       */
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        set({ user: null, token: null, isAuthenticated: false });
      },

      /**
       * Merge partial user data into the current user object.
       * Useful after a profile edit without a full re-login.
       *
       * @param {Partial<ReturnType<typeof get>['user']>} data
       */
      updateUser: (data) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...data } });
      },

      // ── Derived / Selectors ───────────────────────────────────

      /**
       * Returns true if the authenticated user has the given role.
       * @param {'customer'|'vendor'|'admin'} role
       */
      hasRole: (role) => get().user?.role === role,

      /** Convenience: is the user a customer? */
      isCustomer: () => get().user?.role === 'customer',

      /** Convenience: is the user a vendor? */
      isVendor: () => get().user?.role === 'vendor',

      /** Convenience: is the user an admin? */
      isAdmin: () => get().user?.role === 'admin',
    }),

    // ── Persist config ──────────────────────────────────────────
    {
      name: 'eventat_auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist the raw data fields, not the action functions
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Re-sync the raw token key whenever the store is rehydrated
      // (e.g., on page refresh) so Axios always has access to it.
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem(TOKEN_KEY, state.token);
        }
      },
    },
  ),
);

export default useAuthStore;
