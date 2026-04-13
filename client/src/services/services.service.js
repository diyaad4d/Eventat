import api from './api';

// ─────────────────────────────────────────────────────────────
//  Services Service  (marketplace service listings)
//  Endpoints: /services/*
// ─────────────────────────────────────────────────────────────

/**
 * Fetch a paginated, filtered list of services.
 * @param {{
 *   category?: string,
 *   subcategory?: string,
 *   city?: string,
 *   min_price?: number,
 *   max_price?: number,
 *   rating?: number,
 *   event_type?: string,
 *   search?: string,
 *   sort?: 'recommended'|'price_asc'|'price_desc'|'rating'|'newest',
 *   page?: number,
 *   limit?: number,
 * }} params
 */
export const getServices = (params = {}) =>
  api.get('/services', { params }).then((res) => res.data);

/**
 * Fetch a single service by ID.
 * @param {number|string} serviceId
 */
export const getServiceById = (serviceId) =>
  api.get(`/services/${serviceId}`).then((res) => res.data);

/**
 * Fetch top-rated / featured services for the home page.
 * @param {number} limit
 */
export const getFeaturedServices = (limit = 8) =>
  api.get('/services/featured', { params: { limit } }).then((res) => res.data);

/**
 * Fetch all service categories (with optional subcategories).
 */
export const getCategories = () =>
  api.get('/categories').then((res) => res.data);

/**
 * Fetch subcategories for a given category ID.
 * @param {number|string} categoryId
 */
export const getSubcategories = (categoryId) =>
  api.get(`/categories/${categoryId}/subcategories`).then((res) => res.data);

/**
 * Fetch all event types (Wedding, Graduation, etc.).
 */
export const getEventTypes = () =>
  api.get('/event-types').then((res) => res.data);

/**
 * Fetch all services listed by a specific vendor.
 * @param {number|string} vendorId
 */
export const getServicesByVendor = (vendorId) =>
  api.get(`/vendors/${vendorId}/services`).then((res) => res.data);
