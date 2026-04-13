import api from './api';

// ─────────────────────────────────────────────────────────────
//  Vendor Service
//  Endpoints: /vendor/*, /vendors/:id
// ─────────────────────────────────────────────────────────────

// ── Public Vendor Profile ─────────────────────────────────────

/**
 * Fetch a vendor's public profile (visible to all users).
 * @param {number|string} vendorId
 */
export const getVendorProfile = (vendorId) =>
  api.get(`/vendors/${vendorId}`).then((res) => res.data);

// ── Authenticated Vendor — Service Management ─────────────────

/**
 * Fetch all services owned by the authenticated vendor.
 */
export const getMyServices = () =>
  api.get('/vendor/services').then((res) => res.data);

/**
 * Create a new service listing.
 * @param {{
 *   title: string,
 *   category_id: number,
 *   subcategory_id?: number,
 *   description: string,
 *   base_price: number,
 *   pricing_unit: 'per_event'|'per_hour'|'per_person'|'per_day',
 *   service_location?: string,
 *   city?: string,
 *   capacity?: number,
 *   is_active?: boolean,
 * }} data
 */
export const createService = (data) =>
  api.post('/vendor/services', data).then((res) => res.data);

/**
 * Update an existing service.
 * @param {number|string} serviceId
 * @param {Partial<Parameters<typeof createService>[0]>} data
 */
export const updateService = (serviceId, data) =>
  api.patch(`/vendor/services/${serviceId}`, data).then((res) => res.data);

/**
 * Delete a service listing.
 * @param {number|string} serviceId
 */
export const deleteService = (serviceId) =>
  api.delete(`/vendor/services/${serviceId}`).then((res) => res.data);

/**
 * Toggle a service's active/inactive status.
 * @param {number|string} serviceId
 * @param {boolean} isActive
 */
export const toggleServiceStatus = (serviceId, isActive) =>
  api.patch(`/vendor/services/${serviceId}/status`, { is_active: isActive }).then((res) => res.data);

/**
 * Upload images for a service.
 * @param {number|string} serviceId
 * @param {FormData} formData  — multipart form with image files
 */
export const uploadServiceImages = (serviceId, formData) =>
  api
    .post(`/vendor/services/${serviceId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);

/**
 * Delete a specific image from a service.
 * @param {number|string} serviceId
 * @param {number|string} imageId
 */
export const deleteServiceImage = (serviceId, imageId) =>
  api.delete(`/vendor/services/${serviceId}/images/${imageId}`).then((res) => res.data);

// ── Authenticated Vendor — Booking Management ─────────────────

/**
 * Fetch all booking requests received by the authenticated vendor.
 * @param {{ status?: 'pending'|'confirmed'|'completed'|'cancelled' }} params
 */
export const getVendorBookings = (params = {}) =>
  api.get('/vendor/bookings', { params }).then((res) => res.data);
/**
 * Accept a booking request.
 * @param {number|string} bookingId
 */
export const acceptBooking = (bookingId) =>
  api.patch(`/vendor/bookings/${bookingId}/accept`).then((res) => res.data);

/**
 * Reject a booking request.
 * @param {number|string} bookingId
 * @param {{ reason?: string }} data
 */
export const rejectBooking = (bookingId, data = {}) =>
  api.patch(`/vendor/bookings/${bookingId}/reject`, data).then((res) => res.data);

// ── Authenticated Vendor — Profile ───────────────────────────

/**
 * Fetch the authenticated vendor's own profile.
 */
export const getMyVendorProfile = () =>
  api.get('/vendor/profile').then((res) => res.data);

/**
 * Update the authenticated vendor's profile.
 * @param {{
 *   company_name?: string,
 *   company_description?: string,
 *   address?: string,
 *   city?: string,
 * }} data
 */
export const updateVendorProfile = (data) =>
  api.patch('/vendor/profile', data).then((res) => res.data);

/**
 * Upload/replace the vendor's logo.
 * @param {FormData} formData
 */
export const uploadVendorLogo = (formData) =>
  api
    .post('/vendor/profile/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);

// ── Authenticated Vendor — Analytics ─────────────────────────

/**
 * Fetch the vendor's analytics summary.
 * @param {{ period?: 'week'|'month'|'year' }} params
 */
export const getVendorAnalytics = (params = {}) =>
  api.get('/vendor/analytics', { params }).then((res) => res.data);
