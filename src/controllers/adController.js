import { query } from '../config/db.js';

export const createAd = async (req, res, next) => {
  try {
    const {
      publisher_id,
      business_name,
      title,
      description,
      image,
      price,
      target_vehicle_type,
      start_date,
      end_date,
      duration,
      status = 'PUBLISHED'
    } = req.body;

    if (!publisher_id || !title || price === undefined || !target_vehicle_type) {
      return res.status(400).json({
        success: false,
        message: 'publisher_id, title, price, and target_vehicle_type are required'
      });
    }

    const now = Date.now();

    const result = await query(
      `INSERT INTO advertisements (
        publisher_id, business_name, title, description, image, price,
        target_vehicle_type, start_date, end_date, duration, status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        publisher_id,
        business_name || null,
        title,
        description || null,
        image || null,
        price,
        target_vehicle_type,
        start_date || null,
        end_date || null,
        duration || null,
        status,
        now,
        now
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getAds = async (req, res, next) => {
  try {
    const { publisher_id, status, target_vehicle_type } = req.query;

    let sql = 'SELECT * FROM advertisements WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (publisher_id) {
      sql += ` AND publisher_id = $${paramIndex++}`;
      params.push(publisher_id);
    }

    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status.toUpperCase());
    }

    if (target_vehicle_type) {
      sql += ` AND target_vehicle_type = $${paramIndex++}`;
      params.push(target_vehicle_type.toUpperCase());
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

export const getAdById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM advertisements WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateAd = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      business_name,
      title,
      description,
      image,
      price,
      target_vehicle_type,
      start_date,
      end_date,
      duration,
      status
    } = req.body;

    const now = Date.now();

    const result = await query(
      `UPDATE advertisements SET
        business_name = COALESCE($1, business_name),
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        image = COALESCE($4, image),
        price = COALESCE($5, price),
        target_vehicle_type = COALESCE($6, target_vehicle_type),
        start_date = COALESCE($7, start_date),
        end_date = COALESCE($8, end_date),
        duration = COALESCE($9, duration),
        status = COALESCE($10, status),
        updated_at = $11
      WHERE id = $12
      RETURNING *`,
      [
        business_name,
        title,
        description,
        image,
        price,
        target_vehicle_type,
        start_date,
        end_date,
        duration,
        status,
        now,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    return res.json({
      success: true,
      message: 'Advertisement updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAd = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM advertisements WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    return res.json({
      success: true,
      message: 'Advertisement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
