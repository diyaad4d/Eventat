import api from './api';

// ─────────────────────────────────────────────────────────────
//  Admin Service
//  Endpoints: /admin/*
//  All routes require role='admin' (enforced by backend).
// ─────────────────────────────────────────────────────────────

// ── Group A: Dashboard ────────────────────────────────────────

/**
 * Fetch platform-wide KPI stats for the admin dashboard.
 * Used by AdminDashboard.jsx for the stats strip, charts, and pending vendors list.
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     stats: {
 *       totalUsers: number, totalVendors: number, totalCustomers: number,
 *       totalBanned: number, approvedVendors: number, pendingVendors: number,
 *       rejectedVendors: number, totalBookings: number, confirmedBookings: number,
 *       pendingBookings: number, grossRevenue: number, totalCommission: number,
 *       totalServices: number, activeServices: number,
 *     },
 *     recentRegistrations: Array<{ user_id: number, name: string, email: string, role: string, date: string, avatar: string | null }>,
 *     pendingVendors:       Array<{ vendor_id: number, company: string, vendor_type: string, submitted: string, category: string }>,
 *     monthlyRegistrations: Array<{ name: string, users: number, vendors: number }>,
 *   }
 * }>}
 */
export const getPlatformStats = () =>
  api.get('/admin/stats').then((res) => res.data);

// ── Group B: Vendor Management ────────────────────────────────

/**
 * Fetch all vendors with optional filters.
 * Used by AdminVendors.jsx for the vendor table and filter bar.
 * @param {{ status?: string, search?: string, category?: string, page?: number, limit?: number }} params
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     vendors: Array<object>,
 *     pagination: { total: number, page: number, limit: number, totalPages: number, hasNext: boolean, hasPrev: boolean },
 *     counts: { total: number, pending: number, approved: number, rejected: number },
 *   }
 * }>}
 */
export const getVendors = (params = {}) =>
  api.get('/admin/vendors', { params }).then((res) => res.data);

/**
 * Fetch full detail for a single vendor (admin view).
 * Used by AdminVendors.jsx for the vendor side panel modal.
 * Includes vendor profile, documents, services, and recent bookings.
 * @param {number} vendorId — vendor's user_id (same value as vendor_profiles.vendor_id)
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     vendor:         object,
 *     documents:      object,
 *     services:       Array<object>,
 *     recentBookings: Array<object>,
 *   }
 * }>}
 */
export const getVendorById = (vendorId) =>
  api.get(`/admin/vendors/${vendorId}`).then((res) => res.data);

/**
 * Approve a pending vendor application.
 * Triggers a notification to the vendor on the backend.
 * @param {number} vendorId
 * @returns {Promise<{
 *   success: boolean,
 *   message: string,
 *   data: { vendor: { vendor_id: number, registration_status: string } }
 * }>}
 */
export const approveVendor = (vendorId) =>
  api.put(`/admin/vendors/${vendorId}/approve`).then((res) => res.data);

/**
 * Reject a vendor application.
 * Triggers a notification to the vendor on the backend.
 * @param {number} vendorId
 * @param {string} [reason] — optional rejection reason sent to the vendor
 * @returns {Promise<{
 *   success: boolean,
 *   message: string,
 *   data: { vendor: { vendor_id: number, registration_status: string } }
 * }>}
 */
export const rejectVendor = (vendorId, reason) =>
  api.put(`/admin/vendors/${vendorId}/reject`, { reason }).then((res) => res.data);

/**
 * Approve a vendor's pending profile change request.
 * Applies the changes from vendor_profiles.pending_changes to the live profile.
 * @param {number} vendorId
 * @returns {Promise<{
 *   success: boolean,
 *   message: string,
 *   data: { appliedChanges: object }
 * }>}
 */
export const approveVendorChanges = (vendorId) =>
  api.put(`/admin/vendors/${vendorId}/approve-changes`).then((res) => res.data);

// ── Group C: User Management ──────────────────────────────────

/**
 * Fetch all users with optional filters.
 * Used by AdminUsers.jsx for the user table, search, and role/status filters.
 * @param {{ role?: string, status?: string, search?: string, page?: number, limit?: number }} params
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     users: Array<{
 *       user_id: number, name: string, email: string, role: string,
 *       status: 'active' | 'banned', joinDate: string, lastActive: string | null,
 *       avatar: string | null, city: string | null,
 *       bookingsCount: number | null, servicesCount: number | null,
 *     }>,
 *     pagination: { total: number, page: number, limit: number, totalPages: number, hasNext: boolean, hasPrev: boolean },
 *     counts: { total: number, customers: number, vendors: number, admins: number, banned: number },
 *   }
 * }>}
 */
export const getUsers = (params = {}) =>
  api.get('/admin/users', { params }).then((res) => res.data);

/**
 * Toggle ban/unban status for a user.
 * Backend toggles the current is_active value (is_active=false = banned).
 * Cannot be used to ban another admin.
 * @param {number} userId
 * @returns {Promise<{
 *   success: boolean,
 *   message: 'User banned.' | 'User unbanned.',
 *   data: { user: { user_id: number, full_name: string, is_active: boolean, status: string } }
 * }>}
 */
export const toggleUserBan = (userId) =>
  api.put(`/admin/users/${userId}/ban`).then((res) => res.data);

// ── Group D: Category Management ─────────────────────────────

/**
 * Fetch all categories with their subcategories (admin view).
 * Used by AdminCategories.jsx for the full expandable category tree.
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     categories: Array<{
 *       id: number, name: string, slug: string, icon: string,
 *       isActive: boolean, servicesCount: number,
 *       subcategories: Array<{ id: number, name: string, slug: string, isActive: boolean, servicesCount: number }>,
 *     }>
 *   }
 * }>}
 */
export const getAdminCategories = () =>
  api.get('/admin/categories').then((res) => res.data);

/**
 * Create a new service category.
 * @param {{ name: string, icon: string, slug?: string, is_active?: boolean }} data
 * @returns {Promise<{
 *   success: boolean,
 *   message: string,
 *   data: { category: object }
 * }>}
 */
export const createCategory = (data) =>
  api.post('/admin/categories', data).then((res) => res.data);

/**
 * Update an existing category.
 * Only provided fields are updated (dynamic PATCH-style update via PUT).
 * @param {number} categoryId
 * @param {{ name?: string, icon?: string, slug?: string, is_active?: boolean }} data
 * @returns {Promise<{
 *   success: boolean,
 *   message: string,
 *   data: { category: object }
 * }>}
 */
export const updateCategory = (categoryId, data) =>
  api.put(`/admin/categories/${categoryId}`, data).then((res) => res.data);

/**
 * Delete a category.
 * Will fail with 400 if the category has active services — deactivate them first.
 * @param {number} categoryId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteCategory = (categoryId) =>
  api.delete(`/admin/categories/${categoryId}`).then((res) => res.data);

/**
 * Add a subcategory to a category.
 * @param {number} categoryId
 * @param {{ name: string, slug?: string, is_active?: boolean }} data
 * @returns {Promise<{
 *   success: boolean,
 *   message: string,
 *   data: { subcategory: object }
 * }>}
 */
export const createSubcategory = (categoryId, data) =>
  api.post(`/admin/categories/${categoryId}/subcategories`, data).then((res) => res.data);

/**
 * Update a subcategory.
 * Only provided fields are updated.
 * @param {number} subcategoryId
 * @param {{ name?: string, slug?: string, is_active?: boolean }} data
 * @returns {Promise<{
 *   success: boolean,
 *   message: string,
 *   data: { subcategory: object }
 * }>}
 */
export const updateSubcategory = (subcategoryId, data) =>
  api.put(`/admin/subcategories/${subcategoryId}`, data).then((res) => res.data);

/**
 * Delete a subcategory.
 * Will fail with 400 if the subcategory has active services.
 * @param {number} subcategoryId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteSubcategory = (subcategoryId) =>
  api.delete(`/admin/subcategories/${subcategoryId}`).then((res) => res.data);

// ── Group E: Analytics ────────────────────────────────────────

/**
 * Fetch full analytics data for the admin analytics page.
 * Used by AdminAnalytics.jsx for all charts and KPI values.
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     monthlyData:     Array<{ month: string, bookings: number, revenue: number, commission: number }>,
 *     categoryRevenue: Array<{ name: string, slug: string, value: number, revenue: number }>,
 *     locationData:    Array<{ city: string, bookings: number }>,
 *     topVendors:      Array<{ name: string, category: string, revenue: number, bookings: number, rating: number }>,
 *     kpis:            { totalRevenue: number, totalBookings: number, avgBookingValue: number },
 *   }
 * }>}
 */
export const getAdminAnalytics = () =>
  api.get('/admin/analytics').then((res) => res.data);
