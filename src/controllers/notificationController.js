import { query } from '../config/db.js';

export const createNotification = async (req, res, next) => {
  try {
    const { user_id, title, message, type } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'user_id, title, and message are required'
      });
    }

    const created_at = Date.now();

    const result = await query(
      `INSERT INTO notifications (user_id, title, message, type, read_status, created_at)
       VALUES ($1, $2, $3, $4, FALSE, $5)
       RETURNING *`,
      [user_id, title, message, type || null, created_at]
    );

    return res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const { user_id, read_status } = req.query;

    let sql = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (user_id) {
      sql += ` AND user_id = $${paramIndex++}`;
      params.push(user_id);
    }

    if (read_status !== undefined) {
      sql += ` AND read_status = $${paramIndex++}`;
      params.push(read_status === 'true');
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE notifications SET read_status = TRUE WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.json({
      success: true,
      message: 'Notification marked as read',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM notifications WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
