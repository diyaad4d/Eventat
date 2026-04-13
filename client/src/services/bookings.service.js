import api from './api';

// ─────────────────────────────────────────────────────────────
//  Bookings Service
//  Endpoints: /bookings/*, /event-plans/*
// ─────────────────────────────────────────────────────────────

/**
 * Create a new booking 
 * @param {{
 *   service_id: number,
 *   event_date: string,       // ISO date string
 *   guest_count?: number,
 *   special_requests?: string,
 * }} data
 */
export const createBooking = (data) =>
  api.post('/bookings', data).then((res) => res.data);

/**
 * Fetch all bookings for the authenticated customer
 * @param {{ status?: 'pending'|'confirmed'|'completed'|'cancelled' }} params
 */
export const getMyBookings = (params = {}) =>
  api.get('/bookings/my', { params }).then((res) => res.data);

/**
 * Fetch a single booking by ID
 * @param {number|string} bookingId
 */
export const getBookingById = (bookingId) =>
  api.get(`/bookings/${bookingId}`).then((res) => res.data);

/**
 * Cancel a booking (customer action — only "pending" bookings).
 * @param {number|string} bookingId
 */
export const cancelBooking = (bookingId) =>
  api.patch(`/bookings/${bookingId}/cancel`).then((res) => res.data);

// ── Event Plans (the "My Events" / cart system) ──────────────

/**
 * Fetch all event plans created by the authenticated customer.
 */
export const getMyEventPlans = () =>
  api.get('/event-plans/my').then((res) => res.data);

/**
 * Fetch a single event plan by ID (includes its items).
 * @param {number|string} planId
 */
export const getEventPlanById = (planId) =>
  api.get(`/event-plans/${planId}`).then((res) => res.data);

/**
 * Create a new event plan.
 * @param {{
 *   event_type_id: number,
 *   name: string,
 *   event_date: string,
 *   guest_count?: number,
 *   event_location?: string,
 *   special_requests?: string,
 * }} data
 */


export const createEventPlan = (data) =>
  api.post('/event-plans', data).then((res) => res.data);


/**
 * Update an existing event plan.
 * @param {number|string} planId
 * @param {Partial<ReturnType<typeof createEventPlan>>} data
 */
export const updateEventPlan = (planId, data) =>
  api.patch(`/event-plans/${planId}`, data).then((res) => res.data);

/**
 * Delete an event plan.
 * @param {number|string} planId
 */
export const deleteEventPlan = (planId) =>
  api.delete(`/event-plans/${planId}`).then((res) => res.data);

/**
 * Add a service item to an event plan (cart "add to cart").
 * @param {number|string} planId
 * @param {{ service_id: number, event_date?: string, quantity?: number }} data
 */
export const addItemToEventPlan = (planId, data) =>
  api.post(`/event-plans/${planId}/items`, data).then((res) => res.data);

/**
 * Remove a service item from an event plan.
 * @param {number|string} planId
 * @param {number|string} itemId
 */
export const removeItemFromEventPlan = (planId, itemId) =>
  api.delete(`/event-plans/${planId}/items/${itemId}`).then((res) => res.data);

/**
 * Submit an event plan to trigger bookings for all items.
 * @param {number|string} planId
 */
export const submitEventPlan = (planId) =>
  api.post(`/event-plans/${planId}/submit`).then((res) => res.data);
