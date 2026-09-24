import { query } from '../config/db.js';

export const createApplication = async (req, res, next) => {
  try {
    const {
      advertisement_id,
      driver_id,
      start_date,
      end_date,
      status = 'PENDING',
      payment_status = 'PENDING',
      amount
    } = req.body;

    if (!advertisement_id || !driver_id || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'advertisement_id, driver_id, and amount are required'
      });
    }

    const accepted_at = Date.now();

    const result = await query(
      `INSERT INTO ad_applications (
        advertisement_id, driver_id, accepted_at, start_date, end_date, status, payment_status, amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        advertisement_id,
        driver_id,
        accepted_at,
        start_date || null,
        end_date || null,
        status.toUpperCase(),
        payment_status.toUpperCase(),
        amount
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Ad application submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const { advertisement_id, driver_id, status, payment_status } = req.query;

    let sql = `
      SELECT 
        app.*,
        adv.title AS ad_title,
        adv.price AS ad_price,
        u.name AS driver_name,
        u.phone AS driver_phone
      FROM ad_applications app
      JOIN advertisements adv ON app.advertisement_id = adv.id
      JOIN users u ON app.driver_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (advertisement_id) {
      sql += ` AND app.advertisement_id = $${paramIndex++}`;
      params.push(advertisement_id);
    }

    if (driver_id) {
      sql += ` AND app.driver_id = $${paramIndex++}`;
      params.push(driver_id);
    }

    if (status) {
      sql += ` AND app.status = $${paramIndex++}`;
      params.push(status.toUpperCase());
    }

    if (payment_status) {
      sql += ` AND app.payment_status = $${paramIndex++}`;
      params.push(payment_status.toUpperCase());
    }

    sql += ' ORDER BY app.accepted_at DESC';

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

export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT 
        app.*,
        adv.title AS ad_title,
        adv.description AS ad_description,
        adv.price AS ad_price,
        adv.target_vehicle_type,
        u.name AS driver_name,
        u.email AS driver_email,
        u.phone AS driver_phone
      FROM ad_applications app
      JOIN advertisements adv ON app.advertisement_id = adv.id
      JOIN users u ON app.driver_id = u.id
      WHERE app.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    if (!status && !payment_status) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least status or payment_status to update'
      });
    }

    const result = await query(
      `UPDATE ad_applications SET
        status = COALESCE($1, status),
        payment_status = COALESCE($2, payment_status)
      WHERE id = $3
      RETURNING *`,
      [
        status ? status.toUpperCase() : null,
        payment_status ? payment_status.toUpperCase() : null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    return res.json({
      success: true,
      message: 'Application status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
