import api from './api';

// ─────────────────────────────────────────────────────────────
//  Reviews Service
//  Endpoints: /services/:serviceId/reviews, /reviews/:reviewId
//
//  Backend field names (verified from reviews.controller.js):
//    review body: { rating: number, review_text: string }
//    review row:  { review_id, rating, review_text, created_at,
//                   reviewer_name, reviewer_avatar }
//    eligibility: { canReview, hasBooking, hasReviewed, reason }
//    reviews GET: { reviews[], summary: { avg_rating, total_reviews,
//                   breakdown: [{ rating, count, percentage }] },
//                   pagination }
// ─────────────────────────────────────────────────────────────

/**
 * Fetch paginated reviews for a service — public, no auth required.
 * @param {number|string} serviceId
 * @param {{ page?: number, limit?: number, sort?: 'newest'|'highest'|'lowest' }} params
 * @returns {Promise<{
 *   reviews:    Array<{ review_id: number, rating: number, review_text: string, created_at: string, reviewer_name: string, reviewer_avatar: string|null }>,
 *   summary:    { avg_rating: number, total_reviews: number, breakdown: Array<{ rating: number, count: number, percentage: number }> },
 *   pagination: { total: number, page: number, limit: number, totalPages: number, hasNext: boolean, hasPrev: boolean }
 * }>}
 */
export const getServiceReviews = (serviceId, params = {}) =>
  api
    .get(`/services/${serviceId}/reviews`, { params })
    .then((res) => res.data.data);

/**
 * Post a new review for a service.
 * Requires auth (customer) + a confirmed/completed booking for this service.
 * @param {number|string} serviceId
 * @param {{ rating: number, review_text: string }} data
 * @returns {Promise<{ review: object }>}
 */
export const postReview = (serviceId, data) =>
  api
    .post(`/services/${serviceId}/reviews`, data)
    .then((res) => res.data.data);

/**
 * Check whether the authenticated customer can review a service.
 * Requires auth.
 * @param {number|string} serviceId
 * @returns {Promise<{ canReview: boolean, hasBooking: boolean, hasReviewed: boolean, reason: string|null }>}
 */
export const checkReviewEligibility = (serviceId) =>
  api
    .get(`/services/${serviceId}/reviews/eligibility`)
    .then((res) => res.data.data);

/**
 * Update the authenticated customer's own review.
 * @param {number|string} reviewId
 * @param {{ rating?: number, review_text?: string }} data
 * @returns {Promise<{ review: object }>}
 */
export const updateReview = (reviewId, data) =>
  api
    .patch(`/reviews/${reviewId}`, data)
    .then((res) => res.data.data);

/**
 * Delete a review.
 * Customer can delete their own; admin can delete any.
 * @param {number|string} reviewId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteReview = (reviewId) =>
  api
    .delete(`/reviews/${reviewId}`)
    .then((res) => res.data);
