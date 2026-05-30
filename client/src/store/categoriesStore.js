import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─────────────────────────────────────────────────────────────
//  All 10 canonical categories — the single source of truth.
//  isActive: true  → shown on Home page and filter sidebar.
//  Slugs must match HOME_CATEGORY_STYLES keys in Home.jsx.
// ─────────────────────────────────────────────────────────────
export const INITIAL_CATEGORIES = [
  {
    id: 'cat_1',
    name: 'Venue',
    icon: '🏛️',
    slug: 'venue',
    isActive: true,
    servicesCount: 87,
    subcategories: [
      { id: 'sub_1',  name: 'Hotels',  slug: 'hotels',  isActive: true, servicesCount: 23 },
      { id: 'sub_2',  name: 'Halls',   slug: 'halls',   isActive: true, servicesCount: 31 },
      { id: 'sub_3',  name: 'Farms',   slug: 'farms',   isActive: true, servicesCount: 14 },
      { id: 'sub_4',  name: 'Outdoor', slug: 'outdoor', isActive: true, servicesCount: 19 },
    ],
  },
  {
    id: 'cat_2',
    name: 'Catering',
    icon: '🍽️',
    slug: 'catering',
    isActive: true,
    servicesCount: 54,
    subcategories: [
      { id: 'sub_5',   name: 'Buffet',        isActive: true,  servicesCount: 18 },
      { id: 'sub_6',   name: 'Plated Dinner', isActive: true,  servicesCount: 12 },
      { id: 'sub_7',   name: 'Food Trucks',   isActive: false, servicesCount: 6  },
      { id: 'sub_ca4', name: 'Finger Food',   isActive: true,  servicesCount: 9  },
    ],
  },
  {
    id: 'cat_3',
    name: 'Photography & Videography',
    icon: '📸',
    slug: 'photography-videography',
    isActive: true,
    servicesCount: 41,
    subcategories: [
      { id: 'sub_8',  name: 'Wedding Photography', isActive: true, servicesCount: 22 },
      { id: 'sub_9',  name: 'Videography',         isActive: true, servicesCount: 11 },
      { id: 'sub_10', name: 'Drone / Aerial',      isActive: true, servicesCount: 8  },
    ],
  },
  {
    id: 'cat_4',
    name: 'Music & Entertainment',
    icon: '🎵',
    slug: 'music-entertainment',
    isActive: true,
    servicesCount: 33,
    subcategories: [
      { id: 'sub_11',  name: 'Live Band',          isActive: true,  servicesCount: 14 },
      { id: 'sub_12',  name: 'DJ',                 isActive: true,  servicesCount: 11 },
      { id: 'sub_me3', name: 'Zaffa',              isActive: true,  servicesCount: 5  },
      { id: 'sub_13',  name: 'Cultural Performers',isActive: false, servicesCount: 3  },
    ],
  },
  {
    id: 'cat_5',
    name: 'Decoration',
    icon: '🎀',
    slug: 'decoration',
    isActive: true,
    servicesCount: 28,
    subcategories: [
      { id: 'sub_14', name: 'Floral',   isActive: true, servicesCount: 12 },
      { id: 'sub_15', name: 'Lighting', isActive: true, servicesCount: 9  },
      { id: 'sub_16', name: 'Balloons', isActive: true, servicesCount: 7  },
    ],
  },
  {
    id: 'cat_6',
    name: 'Cakes & Desserts',
    icon: '🎂',
    slug: 'cakes-desserts',
    isActive: true,
    servicesCount: 31,
    subcategories: [
      { id: 'sub_cd1', name: 'Wedding Cakes',  slug: 'wedding-cakes',  isActive: true, servicesCount: 14 },
      { id: 'sub_cd2', name: 'Custom Cakes',   slug: 'custom-cakes',   isActive: true, servicesCount: 10 },
      { id: 'sub_cd3', name: 'Dessert Tables', slug: 'dessert-tables', isActive: true, servicesCount: 5  },
      { id: 'sub_cd4', name: 'Cupcakes',       slug: 'cupcakes',       isActive: true, servicesCount: 2  },
    ],
  },
  {
    id: 'cat_7',
    name: 'Makeup & Beauty',
    icon: '💄',
    slug: 'makeup-beauty',
    isActive: true,
    servicesCount: 18,
    subcategories: [
      { id: 'sub_mb1', name: 'Bridal Makeup',  slug: 'bridal-makeup',  isActive: true, servicesCount: 10 },
      { id: 'sub_mb2', name: 'Hair Styling',   slug: 'hair-styling',   isActive: true, servicesCount: 5  },
      { id: 'sub_mb3', name: 'Group Packages', slug: 'group-packages', isActive: true, servicesCount: 3  },
    ],
  },
  {
    id: 'cat_8',
    name: 'Event Planning',
    icon: '📋',
    slug: 'event-planning',
    isActive: true,
    servicesCount: 22,
    subcategories: [
      { id: 'sub_ep1', name: 'Full-Service Planner', slug: 'full-service-planner', isActive: true, servicesCount: 10 },
      { id: 'sub_ep2', name: 'Day-Of Coordinator',   slug: 'day-of-coordinator',   isActive: true, servicesCount: 8  },
      { id: 'sub_ep3', name: 'Corporate Events',     slug: 'corporate-events',     isActive: true, servicesCount: 4  },
    ],
  },
  {
    id: 'cat_9',
    name: 'Transportation',
    icon: '🚗',
    slug: 'transportation',
    isActive: true,
    servicesCount: 19,
    subcategories: [
      { id: 'sub_tr1', name: 'Luxury Cars', slug: 'luxury-cars', isActive: true, servicesCount: 9 },
      { id: 'sub_tr2', name: 'Buses',       slug: 'buses',       isActive: true, servicesCount: 5 },
      { id: 'sub_tr3', name: 'Valet',       slug: 'valet',       isActive: true, servicesCount: 5 },
    ],
  },
  {
    id: 'cat_10',
    name: 'Invitations & Prints',
    icon: '💌',
    slug: 'invitations-prints',
    isActive: true,
    servicesCount: 12,
    subcategories: [
      { id: 'sub_ip1', name: 'Digital Invitations', slug: 'digital-invitations', isActive: true, servicesCount: 5 },
      { id: 'sub_ip2', name: 'Printed Cards',       slug: 'printed-cards',       isActive: true, servicesCount: 5 },
      { id: 'sub_ip3', name: 'Menus & Programs',    slug: 'menus-programs',      isActive: true, servicesCount: 2 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
//  Helper: merge persisted categories with INITIAL_CATEGORIES.
//  Keeps all admin changes (renames, status toggles, custom cats)
//  while ensuring every canonical category always exists.
// ─────────────────────────────────────────────────────────────
function mergeWithDefaults(persisted) {
  if (!Array.isArray(persisted) || persisted.length === 0) {
    return INITIAL_CATEGORIES;
  }
  const persistedIds = new Set(persisted.map((c) => c?.id).filter(Boolean));
  const missing = INITIAL_CATEGORIES.filter((c) => !persistedIds.has(c.id));
  return [...persisted, ...missing];
}

// ─────────────────────────────────────────────────────────────
//  Zustand v5 store with persist (no migrate/version — safe)
// ─────────────────────────────────────────────────────────────
const useCategoriesStore = create(
  persist(
    (set) => ({
      // ── State ─────────────────────────────────────────────
      categories: INITIAL_CATEGORIES,

      // ── Actions ───────────────────────────────────────────
      setCategories: (newCategories) =>
        set({ categories: newCategories }),

      addCategory: (cat) =>
        set((state) => ({ categories: [...state.categories, cat] })),

      updateCategory: (catData) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === catData.id ? { ...c, ...catData } : c
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      toggleCategoryStatus: (id) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive } : c
          ),
        })),

      // ── Subcategory actions ────────────────────────────────
      addSubcategory: (catId, subData) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === catId
              ? { ...c, subcategories: [...(c.subcategories || []), subData] }
              : c
          ),
        })),

      updateSubcategory: (catId, subData) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === catId
              ? {
                  ...c,
                  subcategories: c.subcategories.map((s) =>
                    s.id === subData.id ? { ...s, ...subData } : s
                  ),
                }
              : c
          ),
        })),

      deleteSubcategory: (catId, subId) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === catId
              ? { ...c, subcategories: c.subcategories.filter((s) => s.id !== subId) }
              : c
          ),
        })),

      toggleSubcategoryStatus: (catId, subId) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === catId
              ? {
                  ...c,
                  subcategories: c.subcategories.map((s) =>
                    s.id === subId ? { ...s, isActive: !s.isActive } : s
                  ),
                }
              : c
          ),
        })),
    }),
    {
      name: 'eventat-categories-v4',   // New key = fresh start; no stale data
      // onRehydrateStorage: safely merge any missing canonical categories
      // after the store is hydrated from localStorage.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const merged = mergeWithDefaults(state.categories);
        if (merged.length !== state.categories.length) {
          state.categories = merged;
        }
      },
    }
  )
);

export default useCategoriesStore;
