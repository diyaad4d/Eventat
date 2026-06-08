import api from './api';

// ─────────────────────────────────────────────────────────────
//  Services Service  (marketplace service listings)
//  Endpoints: /services/*
//
//  Backend returns snake_case field names that differ from
//  what ServiceCard.jsx expects (camelCase/alias names).
//  normalizeService() bridges that gap without touching
//  ServiceCard's source code.
// ─────────────────────────────────────────────────────────────

/**
 * Map a raw DB service row → ServiceCard-compatible shape.
 * ServiceCard reads: id, image, category, categorySlug,
 *   vendorName, location, rating, reviewCount, basePrice, pricingUnit
 *
 * @param {object} raw — row from the DB (snake_case fields)
 * @returns {object} normalised service object
 */
export const normalizeService = (raw) => ({
  ...raw,                                           // keep all originals
  id:           raw.service_id,
  image:        raw.primary_image_url ?? null,
  category:     raw.category_name   ?? '',
  categorySlug: raw.category_slug   ?? '',
  vendorName:   raw.vendor_name     ?? '',
  location:     raw.city            ?? '',
  rating:       parseFloat(raw.avg_rating) || 0,
  reviewCount:  parseInt(raw.review_count) || 0,
  basePrice:    parseFloat(raw.base_price) || 0,
  pricingUnit:  raw.pricing_unit    ?? 'per_event',
  eventTypes:   raw.event_types     || [],
});

// ─────────────────────────────────────────────────────────────
//  Param builder — strips undefined/null/'' values so the
//  axios params object stays clean.
//  Also handles camelCase → snake_case renames that the backend
//  expects (minPrice → min_price, etc.)
// ─────────────────────────────────────────────────────────────
const buildParams = (filters = {}) => {
  const params = {};

  const set = (key, val) => {
    if (val !== undefined && val !== null && val !== '') params[key] = val;
  };

  set('search',      filters.keyword || filters.search || '');
  set('eventType',   filters.eventType);
  set('subcategory', filters.subcategory);
  set('min_price',   filters.minPrice ?? filters.min_price);
  set('max_price',   filters.maxPrice ?? filters.max_price);
  set('sort',        filters.sort);
  set('page',        filters.page);
  set('limit',       filters.limit);
  set('rating',      filters.rating > 0 ? filters.rating : undefined);

  // Arrays: send as comma-joined strings (backend splits on comma)
  if (filters.categories?.length > 0) {
    params.categories = filters.categories.join(',');
  }
  if (filters.cities?.length > 0) {
    params.cities = filters.cities.join(',');
  }

  return params;
};

// ─────────────────────────────────────────────────────────────
//  Functions
// ─────────────────────────────────────────────────────────────

/**
 * Fetch a paginated, filtered list of services.
 * Returns the full `data` envelope: { services, pagination, filters }.
 * `services` are normalised for ServiceCard.
 *
 * @param {object} filters — see useUrlFilters for field names
 * @returns {Promise<{
 *   services: object[],
 *   pagination: { total: number, page: number, limit: number, totalPages: number, hasNext: boolean, hasPrev: boolean },
 *   filters: object
 * }>}
 */
export const getServices = (filters = {}) =>
  api
    .get('/services', { params: buildParams(filters) })
    .then((res) => ({
      ...res.data.data,
      services: (res.data.data.services ?? []).map(normalizeService),
    }));

/**
 * Fetch a single service by ID.
 * Returns the full `data` envelope: { service, images, reviews, similarServices }.
 * `similarServices` are normalised for ServiceCard.
 *
 * @param {number|string} serviceId
 * @returns {Promise<{
 *   service: object,
 *   images: Array<{ image_id: number, image_url: string, is_primary: boolean, sort_order: number }>,
 *   reviews: Array<{ review_id: number, rating: number, review_text: string, created_at: string, reviewer_name: string }>,
 *   similarServices: object[]
 * }>}
 */
export const getServiceById = (serviceId) =>
  api
    .get(`/services/${serviceId}`)
    .then((res) => ({
      ...res.data.data,
      similarServices: (res.data.data.similarServices ?? []).map(normalizeService),
    }));

/**
 * Fetch top-rated / featured services for the home page.
 * @param {number} limit
 * @returns {Promise<{ services: object[] }>}
 */
export const getFeaturedServices = (limit = 8) =>
  api
    .get('/services/featured', { params: { limit } })
    .then((res) => ({
      ...res.data.data,
      services: (res.data.data.services ?? []).map(normalizeService),
    }));

/**
 * Fetch services filtered by event type slug (e.g. 'wedding').
 * Returns { eventType, services, pagination }.
 * `services` are normalised for ServiceCard.
 *
 * @param {string} slug — event type slug from URL param (e.g. 'wedding')
 * @param {object} filters — page, limit, sort, category, search, etc.
 * @returns {Promise<{
 *   eventType: { event_type_id: number, name: string, slug: string, description: string, image_url: string },
 *   services:  object[],
 *   pagination: object
 * }>}
 */
export const getServicesByEventType = (slug, filters = {}) =>
  api
    .get(`/services/by-event-type/${slug}`, { params: buildParams(filters) })
    .then((res) => ({
      ...res.data.data,
      services: (res.data.data.services ?? []).map(normalizeService),
    }));

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
