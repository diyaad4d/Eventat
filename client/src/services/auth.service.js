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
 * Fetch the currently authenticated user's profile.
 */
export const getMe = () =>
  api.get('/auth/me').then((res) => res.data);


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
