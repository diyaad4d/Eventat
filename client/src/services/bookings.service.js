import api from './api';

// ─────────────────────────────────────────────────────────────
//  Bookings Service
//  Matches EXACT routes from server/routes/bookings.routes.js:
//
//  POST   /api/bookings                        createDirectBooking
//  GET    /api/bookings/my                     getMyBookings
//  GET    /api/bookings/:id                    getBookingById
//  PATCH  /api/bookings/:id/cancel             cancelBooking
//
//  POST   /api/event-plans                     createEventPlan
//  GET    /api/event-plans/my                  getMyEventPlans
//  GET    /api/event-plans/:id                 getEventPlanById
//  PATCH  /api/event-plans/:id                 updateEventPlan
//  DELETE /api/event-plans/:id                 deleteEventPlan
//  POST   /api/event-plans/:id/items           addItemToPlan
//  DELETE /api/event-plans/:planId/items/:itemId  removeItemFromPlan
//  POST   /api/event-plans/:id/submit          submitEventPlan
//
//  Schema facts (from 001_initial_schema.sql):
//    event_plans PK:       event_id
//    event_plan_items PK:  event_item_id
//    event_plan_items FK:  event_id → event_plans.event_id
//    vendor_item_status ENUM: pending, accepted, rejected, completed, cancelled
//    event_plans.status ENUM: draft, submitted, confirmed, completed, cancelled
//
//  NOTE: POST /api/bookings and POST /api/event-plans/:id/items
//  both REQUIRE event_date and payment_method (backend validates these).
// ─────────────────────────────────────────────────────────────

// ── Direct Book Now ─────────────────────────────────────────
/**
 * POST /api/bookings — Direct booking (skips draft, status=submitted immediately)
 * @param {{ service_id, event_date, guest_count?, special_requests?, payment_method }} data
 * @returns {{ booking: { ...item, plan_id, service_title, vendor_name, total_amount } }}
 */
export const createBooking = async (data) => {
  const res = await api.post('/bookings', data);
  return res.data; // { success, message, data: { booking } }
};

// ── Customer Bookings ────────────────────────────────────────
/**
 * GET /api/bookings/my — All bookings for the logged-in customer
 * @param {{ status?: 'pending'|'accepted'|'rejected'|'completed'|'cancelled', page?, limit? }} params
 */
export const getMyBookings = async (params = {}) => {
  const res = await api.get('/bookings/my', { params });
  return res.data; // { success, data: { bookings, pagination } }
};

/**
 * GET /api/bookings/:id — Single booking item detail
 * @param {number|string} bookingId — event_item_id
 */
export const getBookingById = async (bookingId) => {
  const res = await api.get(`/bookings/${bookingId}`);
  return res.data; // { success, data: { booking } }
};

/**
 * PATCH /api/bookings/:id/cancel — Cancel a booking item (only 'pending' allowed)
 * @param {number|string} bookingId — event_item_id
 */
export const cancelBooking = async (bookingId) => {
  const res = await api.patch(`/bookings/${bookingId}/cancel`);
  return res.data; // { success, message, data: { booking } }
};

// ── Event Plans (Cart) ───────────────────────────────────────
/**
 * POST /api/event-plans — Create a new draft event plan (the Cart)
 * @param {{ name: string, event_type_id?: number }} data
 * Backend requires: name (2-150 chars). event_type_id is optional.
 */
export const createEventPlan = async (data) => {
  const res = await api.post('/event-plans', data);
  return res.data; // { success, message, data: { plan } }
};

/**
 * GET /api/event-plans/my — All event plans for the logged-in customer
 * @param {{ status?: 'draft'|'submitted'|'confirmed'|'completed'|'cancelled' }} params
 */
export const getMyEventPlans = async (params = {}) => {
  const res = await api.get('/event-plans/my', { params });
  return res.data; // { success, data: { plans: [...] } }
};

/**
 * GET /api/event-plans/:id — Single plan with all its items
 * @param {number|string} planId — event_id
 */
export const getEventPlanById = async (planId) => {
  const res = await api.get(`/event-plans/${planId}`);
  return res.data; // { success, data: { plan: { ...planFields, items: [...] } } }
};

/**
 * PATCH /api/event-plans/:id — Update plan name or event_type_id (draft only)
 * @param {number|string} planId
 * @param {{ name?: string, event_type_id?: number }} data
 */
export const updateEventPlan = async (planId, data) => {
  const res = await api.patch(`/event-plans/${planId}`, data);
  return res.data; // { success, message, data: { plan } }
};

/**
 * DELETE /api/event-plans/:id — Delete a draft plan (cascade deletes items)
 * @param {number|string} planId — event_id
 */
export const deleteEventPlan = async (planId) => {
  const res = await api.delete(`/event-plans/${planId}`);
  return res.data; // { success, message }
};

/**
 * POST /api/event-plans/:id/items — Add a service to a draft plan (Add to Cart)
 * IMPORTANT: Backend REQUIRES event_date and payment_method.
 * @param {number|string} planId — event_id
 * @param {{ service_id, event_date, payment_method, guest_count?, special_requests?, quantity? }} data
 */
export const addItemToEventPlan = async (planId, data) => {
  const res = await api.post(`/event-plans/${planId}/items`, data);
  return res.data; // { success, message, data: { item } }
};

/**
 * DELETE /api/event-plans/:planId/items/:itemId — Remove a service from a draft plan
 * @param {number|string} planId — event_id
 * @param {number|string} itemId — event_item_id
 */
export const removeItemFromEventPlan = async (planId, itemId) => {
  const res = await api.delete(`/event-plans/${planId}/items/${itemId}`);
  return res.data; // { success, message }
};

/**
 * PATCH /api/event-plans/:planId/items/:itemId — Update and resend a rejected item
 */
export const updateEventPlanItem = async (planId, itemId, data) => {
  const res = await api.patch(`/event-plans/${planId}/items/${itemId}`, data);
  return res.data; // { success, message }
};

/**
 * POST /api/event-plans/:id/submit — Submit draft plan
 * @param {number|string} planId — event_id
 */
export const submitEventPlan = async (planId) => {
  const res = await api.post(`/event-plans/${planId}/submit`);
  return res.data; // { success, message, data: { plan } }
};

/**
 * POST /api/event-plans/:id/pay — Pay for a confirmed plan
 * @param {number|string} planId — event_id
 * @param {{ payment_method: 'credit_card' | 'cash_deposit' }} data
 */
export const payEventPlan = async (planId, data) => {
  const res = await api.post(`/event-plans/${planId}/pay`, data);
  return res.data; // { success, message, data: { payment } }
};

/**
 * GET /api/event-plans/:id/payment — Get payment receipt + escrow breakdown
 * @param {number|string} planId — event_id
 */
export const getEventPlanPayment = async (planId) => {
  const res = await api.get(`/event-plans/${planId}/payment`);
  return res.data; // { success, data: { payment: { ...fields, escrow: [...] } } }
};

/**
 * POST /api/event-plans/:id/complete — Mark event as complete and release escrow
 * @param {number|string} planId — event_id
 */
export const completeEventPlan = async (planId) => {
  const res = await api.post(`/event-plans/${planId}/complete`);
  return res.data; // { success, message }
};

