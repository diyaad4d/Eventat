import api from './api';

// ─────────────────────────────────────────────────────────────
//  Reviews Service
//  Endpoints: /reviews/*, /services/:id/reviews
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all reviews for a given service.
 * @param {number|string} serviceId
 * @param {{ page?: number, limit?: number }} params
 */
export const getServiceReviews = (serviceId, params = {}) =>
  api.get(`/services/${serviceId}/reviews`, { params }).then((res) => res.data);

/**
 * Post a new review for a service.
 * The authenticated customer must have a completed booking for this service.
 * @param {number|string} serviceId
 * @param {{
 *   rating: number,        // 1–5
 *   review_text: string,
 * }} data
 */
export const postReview = (serviceId, data) =>
  api.post(`/services/${serviceId}/reviews`, data).then((res) => res.data);

/**
 * Update the authenticated customer's own review.
 * @param {number|string} reviewId
 * @param {{ rating?: number, review_text?: string }} data
 */
export const updateReview = (reviewId, data) =>
  api.patch(`/reviews/${reviewId}`, data).then((res) => res.data);

/**
 * Delete the authenticated customer's own review.
 * @param {number|string} reviewId
 */
export const deleteReview = (reviewId) =>
  api.delete(`/reviews/${reviewId}`).then((res) => res.data);

/**
 * Check whether the authenticated customer is eligible to review a service
 * (i.e., they have a completed booking for it and haven't reviewed it yet).
 * @param {number|string} serviceId
 */
export const checkReviewEligibility = (serviceId) =>
  api.get(`/services/${serviceId}/reviews/eligibility`).then((res) => res.data);
