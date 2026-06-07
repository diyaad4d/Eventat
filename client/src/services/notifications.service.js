import api from './api';

// ─────────────────────────────────────────────────────────────
//  Notifications Service
//  Endpoints: /notifications/*
// ─────────────────────────────────────────────────────────────

/**
 * Fetch notifications for the authenticated user.
 * @param {{ page?: number, limit?: number, unread_only?: boolean }} params
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     notifications: Array<{
 *       notification_id: number,
 *       title:           string,
 *       message:         string,
 *       type:            string,
 *       is_read:         boolean,
 *       action_url:      string | null,
 *       created_at:      string,
 *     }>,
 *     unread_count: number,
 *     pagination: {
 *       total: number, page: number, limit: number,
 *       totalPages: number, hasNext: boolean, hasPrev: boolean,
 *     }
 *   }
 * }>}
 */
export const getNotifications = (params = {}) =>
  api.get('/notifications', { params }).then((res) => res.data);

/**
 * Mark a single notification as read.
 * @param {number} notificationId
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     notification: { notification_id: number, is_read: boolean },
 *     unread_count: number,
 *   }
 * }>}
 */
export const markAsRead = (notificationId) =>
  api.put(`/notifications/${notificationId}/read`).then((res) => res.data);

/**
 * Mark all unread notifications as read.
 * @returns {Promise<{
 *   success: boolean,
 *   data: { updated_count: number }
 * }>}
 */
export const markAllAsRead = () =>
  api.put('/notifications/read-all').then((res) => res.data);

/**
 * Returns the current unread notification count.
 * Lightweight — used for Navbar badge polling.
 * Reuses getNotifications with unread_only=true to avoid a separate endpoint.
 * @returns {Promise<number>}
 */
export const getUnreadCount = async () => {
  const res = await getNotifications({ unread_only: true, limit: 1 });
  return res.data.unread_count;
};
