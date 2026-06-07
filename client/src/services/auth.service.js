import api from './api';

// ─────────────────────────────────────────────────────────────
//  Auth Service
//  Endpoints: /auth/*
// ─────────────────────────────────────────────────────────────

/**
 * Register a new user (customer or vendor).
 * @param {{ username: string, email: string, password: string, full_name: string, phone: string, role: 'customer'|'vendor', company_name?: string, company_description?: string, city?: string }} data
 */

export const register = (data) =>
  api.post('auth/register', data).then((res) => res.data);


// ─────────────────────────────────────────────────────────────


/**
 * Log in and receive a JWT token.
 * @param {{ email: string, password: string }} credentials
 */

export const login = (credentials) =>
  api.post('/auth/login', credentials).then((res) => res.data);


// ─────────────────────────────────────────────────────────────


/**
 * Log out the current user (server-side token invalidation, if supported).
 * Client is responsible for clearing localStorage via authStore.
 */
export const logout = () =>
  api.post('/auth/logout').then((res) => res.data);



// ─────────────────────────────────────────────────────────────


/**
 * Fetch the full profile of the authenticated user.
 * Mounted at GET /users/me (NOT /auth/me) in users.controller.js.
 * Returns different shapes based on role:
 *   - vendor:   includes vendor_profiles data (company_name, registration_status, etc.)
 *   - customer: includes booking counts, event plan counts, etc.
 */
export const getMe = () =>
  api.get('/users/me').then((res) => res.data);


// ─────────────────────────────────────────────────────────────



/**
 * Request a password reset email.
 * @param {{ email: string }} data
 */
export const forgotPassword = (data) =>
  api.post('/auth/forgot-password', data).then((res) => res.data);


// ─────────────────────────────────────────────────────────────



/**
 * Reset password using a token from the reset email.
 * @param {{ token: string, new_password: string }} data
 */
export const resetPassword = (data) =>
  api.post('/auth/reset-password', data).then((res) => res.data);


// ─────────────────────────────────────────────────────────────


/**
 * Update the current user's profile fields (full_name, phone).
 * Customer role: also accepts avatar_url (stored on customer_profiles).
 * @param {{ full_name?: string, phone?: string, avatar_url?: string }} data
 * @returns {Promise<{ success: boolean, data: { user: object } }>}
 */
export const updateMe = (data) =>
  api.put('/users/me', data).then((res) => res.data);


// ─────────────────────────────────────────────────────────────


/**
 * Change the current user's password.
 * @param {{ current_password: string, new_password: string, confirm_password: string }} data
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const changePassword = (data) =>
  api.put('/users/me/password', data).then((res) => res.data);


// ─────────────────────────────────────────────────────────────


/**
 * Soft-delete the current user's account (sets is_active = false).
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteAccount = () =>
  api.delete('/users/me').then((res) => res.data);
