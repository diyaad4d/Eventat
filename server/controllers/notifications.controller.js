const db = require('../db');

// ---------------------------------------------------------------------------
// SCHEMA REFERENCE (verified from 001_initial_schema.sql)
//
// notifications table:
//   PK:              notification_id
//   FK:              user_id (to users), event_id (to event_plans, nullable)
//   cols:            title, message_body (NOT 'message'!),
//                    notification_type (VARCHAR 30, no ENUM constraint),
//                    is_read (BOOLEAN), action_url, created_at
//   NOTE: NO updated_at column!
//
// JWT payload: { userId, role } → req.user.userId
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// FUNCTION 1: GET /api/notifications
// All notifications for the logged-in user — paginated
// ---------------------------------------------------------------------------
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const unreadOnly = req.query.unread_only === 'true';
    const page       = Math.max(1, parseInt(req.query.page)  || 1);
    const limit      = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset     = (page - 1) * limit;

    let unreadClause = '';
    if (unreadOnly) {
      unreadClause = 'AND n.is_read = false';
    }

    const sql = `
      SELECT
        n.notification_id,
        n.title,
        n.message_body,
        n.notification_type,
        n.is_read,
        n.action_url,
        n.event_id,
        n.created_at,
        COUNT(*) OVER() AS total_count
      FROM notifications n
      WHERE n.user_id = $1
        ${unreadClause}
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    // Run notification list + unread count in parallel
    const [listRes, unreadRes] = await Promise.all([
      db.query(sql, [userId, limit, offset]),
      db.query(
        `SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = $1 AND is_read = false`,
        [userId]
      ),
    ]);

    const total        = listRes.rows.length > 0 ? parseInt(listRes.rows[0].total_count) : 0;
    const totalPages   = Math.ceil(total / limit);
    const notifications = listRes.rows.map(({ total_count, ...row }) => row);
    const unreadCount  = parseInt(unreadRes.rows[0].cnt);

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount,
        pagination: {
          total, page, limit, totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 2: PUT /api/notifications/:id/read
// Mark a single notification as read
// ---------------------------------------------------------------------------
const markOneAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notifId = parseInt(req.params.id, 10);

    // Step 1: Verify ownership
    const findRes = await db.query(
      `SELECT notification_id FROM notifications WHERE notification_id = $1 AND user_id = $2`,
      [notifId, userId]
    );
    if (findRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found.',
        code: 'NOTIFICATION_NOT_FOUND',
      });
    }

    // Step 2: Mark as read — notifications has NO updated_at column
    const updateRes = await db.query(
      `UPDATE notifications
       SET is_read = true
       WHERE notification_id = $1
       RETURNING *`,
      [notifId]
    );

    // Step 3: Return fresh unread count
    const unreadRes = await db.query(
      `SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: {
        notification: updateRes.rows[0],
        unread_count: parseInt(unreadRes.rows[0].cnt),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 3: PUT /api/notifications/read-all
// Mark ALL unread notifications as read for this user
// IMPORTANT: This route must be mounted BEFORE /:id in the router
// ---------------------------------------------------------------------------
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // notifications has NO updated_at column
    const result = await db.query(
      `UPDATE notifications
       SET is_read = true
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      data: { updated_count: result.rowCount },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markOneAsRead,
  markAllAsRead,
};
