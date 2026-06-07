import api from './api';

// ─────────────────────────────────────────────────────────────
//  Vendor Service — Step 2.5.4
//  All endpoints for the authenticated vendor dashboard.
//  Base URL is already set in api.js → axios baseURL includes /api
//  so routes here omit the /api prefix.
// ─────────────────────────────────────────────────────────────

const vendorService = {

  // ── Public ────────────────────────────────────────────────

  /**
   * Public vendor profile (visible to all users).
   * GET /vendors/:vendorId
   */
  getPublicProfile: async (vendorId) => {
    const { data } = await api.get(`/vendors/${vendorId}`);
    return data.data; // { profile }
  },

  // ── Services ──────────────────────────────────────────────

  /**
   * Vendor's own services (active + inactive).
   * GET /vendor/services
   * Returns: { services, pagination }
   * Service fields: service_id, title, description, base_price,
   *   pricing_unit, city, capacity, is_active, avg_rating,
   *   review_count, primary_image_url, category_name,
   *   category_slug, subcategory_name, total_bookings, confirmed_bookings
   */
  getMyServices: async (filters = {}) => {
    const params = {};
    if (filters.page)                  params.page      = filters.page;
    if (filters.limit)                 params.limit     = filters.limit;
    if (filters.is_active !== undefined) params.is_active = filters.is_active;
    if (filters.category)              params.category  = filters.category;
    if (filters.search)                params.search    = filters.search;
    const { data } = await api.get('/vendor/services', { params });
    return data.data; // { services, pagination }
  },

  /**
   * Create a new service.
   * POST /vendor/services
   * Body: { title, description, base_price, pricing_unit, category_id,
   *         subcategory_id?, city, capacity? }
   * Returns: { service }
   */
  createService: async (serviceData) => {
    const { data } = await api.post('/vendor/services', serviceData);
    return data.data; // { service }
  },

  /**
   * Update an existing service.
   * PATCH /vendor/services/:id
   * Returns: { service }
   */
  updateService: async (serviceId, serviceData) => {
    const { data } = await api.patch(`/vendor/services/${serviceId}`, serviceData);
    return data.data; // { service }
  },

  /**
   * Toggle service active/inactive.
   * PATCH /vendor/services/:id/status
   * Body: { is_active: boolean }
   * Returns: { service: { service_id, title, is_active } }
   */
  toggleServiceStatus: async (serviceId, is_active) => {
    const { data } = await api.patch(
      `/vendor/services/${serviceId}/status`,
      { is_active },
    );
    return data.data; // { service }
  },

  /**
   * Delete a service listing.
   * DELETE /vendor/services/:id
   */
  deleteService: async (serviceId) => {
    const { data } = await api.delete(`/vendor/services/${serviceId}`);
    return data;
  },

  /**
   * Upload images for a service (multipart/form-data).
   * POST /vendor/services/:id/images
   * Field name: 'images' (array, max 8)
   * Returns: { images: [...] }
   */
  uploadServiceImages: async (serviceId, formData) => {
    const { data } = await api.post(
      `/vendor/services/${serviceId}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data; // { images }
  },

  /**
   * Delete a specific image from a service.
   * DELETE /vendor/services/:id/images/:imageId
   */
  deleteServiceImage: async (serviceId, imageId) => {
    const { data } = await api.delete(
      `/vendor/services/${serviceId}/images/${imageId}`,
    );
    return data; // { success, message }
  },

  // ── Bookings ──────────────────────────────────────────────

  /**
   * Vendor's booking requests, filtered by status.
   * GET /vendor/bookings
   * Query: { status?, page?, limit? }
   * Status values: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
   * Returns: { bookings, summary, pagination }
   *
   * Each booking item has:
   *   event_item_id, status, event_date, guest_count,
   *   special_requests, unit_price_at_time, quantity,
   *   line_total, vendor_note, created_at,
   *   service_id, service_title, service_city, service_image,
   *   plan_id, plan_name,
   *   customer_id, customer_name, customer_email, customer_phone
   *
   * Summary: { pending, accepted, rejected, completed, cancelled }
   */
  getMyBookings: async (filters = {}) => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.page)   params.page   = filters.page;
    if (filters.limit)  params.limit  = filters.limit;
    const { data } = await api.get('/vendor/bookings', { params });
    return data.data; // { bookings, summary, pagination }
  },

  /**
   * Accept a pending booking.
   * PATCH /vendor/bookings/:itemId/accept
   * Returns: { booking }
   */
  acceptBooking: async (itemId) => {
    const { data } = await api.patch(`/vendor/bookings/${itemId}/accept`);
    return data.data; // { booking }
  },

  /**
   * Reject a pending booking.
   * PATCH /vendor/bookings/:itemId/reject
   * Body: { reason?: string }
   * Returns: { booking }
   */
  rejectBooking: async (itemId, reason = '') => {
    const { data } = await api.patch(
      `/vendor/bookings/${itemId}/reject`,
      { reason },
    );
    return data.data; // { booking }
  },

  // ── Profile ───────────────────────────────────────────────

  /**
   * Authenticated vendor's own profile (full detail + stats).
   * GET /vendor/profile
   * Returns: { profile }
   *
   * Profile fields (from vendor_profiles + users):
   *   user_id, email, full_name, phone, member_since,
   *   vendor_id, vendor_type, company_name, company_description,
   *   address, city, logo_url, preferred_category_id,
   *   social_links (JSONB), payment_method, iban (masked to last 4),
   *   registration_status, pending_changes, pending_changes_at,
   *   approved_at, created_at,
   *   preferred_category_name, preferred_category_slug,
   *   active_services_count, total_services_count,
   *   total_confirmed_bookings, pending_bookings_count,
   *   overall_rating,
   *   documents: [...]
   */
  getProfile: async () => {
    const { data } = await api.get('/vendor/profile');
    return data.data; // { profile }
  },

  /**
   * Update vendor profile.
   * PATCH /vendor/profile
   *
   * Instant fields (no approval): company_description, social_links, logo_url, city, phone
   * Pending approval fields: company_name, iban, preferred_category_id
   *
   * Returns: { instantUpdates, pendingChanges }
   */
  updateProfile: async (profileData) => {
    const { data } = await api.patch('/vendor/profile', profileData);
    return data.data; // { instantUpdates, pendingChanges }
  },

  /**
   * Upload/replace the vendor logo.
   * POST /vendor/profile/logo
   * Field name: 'logo' (single file)
   * Returns: { logo_url }
   */
  uploadLogo: async (formData) => {
    const { data } = await api.post(
      '/vendor/profile/logo',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data; // { logo_url }
  },

  // ── Analytics ─────────────────────────────────────────────

  /**
   * Vendor analytics summary.
   * GET /vendor/analytics
   * Returns: { kpis, monthlyData, topServices }
   *
   * kpis: { total_bookings, confirmed_bookings, pending_bookings,
   *          rejected_bookings, total_revenue, acceptance_rate,
   *          avg_rating, total_reviews }
   *
   * monthlyData items: { month_label, month_num, year,
   *                      bookings_count, revenue, confirmed_count }
   *
   * topServices items: { service_id, title, bookings, revenue, rating }
   */
  getAnalytics: async (params = {}) => {
    const { data } = await api.get('/vendor/analytics', { params });
    return data.data; // { kpis, monthlyData, topServices }
  },

  // ── Payment ───────────────────────────────────────────────

  /**
   * Escrow balance + masked IBAN info.
   * GET /vendors/me/payment
   * NOTE: No bank_name in schema — not returned.
   * Returns: { iban (masked), escrow_balance, pending_payout, has_pending_iban_change }
   */
  getPaymentInfo: async () => {
    const { data } = await api.get('/vendors/me/payment');
    return data.data;
  },

  /**
   * Request an IBAN change (goes to admin review).
   * POST /vendors/me/payment/change-request
   * Body: { new_iban, new_bank_name }
   * Returns 409 if a pending change already exists.
   */
  requestPaymentChange: async (changeData) => {
    const { data } = await api.post('/vendors/me/payment/change-request', changeData);
    return data.data;
  },
};

export default vendorService;
