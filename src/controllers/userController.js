import { pool, query } from '../config/db.js';

export const createUser = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const {
      name,
      email,
      phone,
      password_hash,
      role, // 'DRIVER' or 'PUBLISHER'
      profile_image,
      driver_profile,
      publisher_profile
    } = req.body;

    if (!name || !email || !phone || !password_hash || !role) {
      return res.status(400).json({
        success: false,
        message: 'name, email, phone, password_hash, and role are required'
      });
    }

    if (!['DRIVER', 'PUBLISHER'].includes(role.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'role must be either DRIVER or PUBLISHER'
      });
    }

    const now = Date.now();

    await client.query('BEGIN');

    // 1. Insert into users table
    const userResult = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role, profile_image, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, phone, role, profile_image, created_at, updated_at`,
      [name, email, phone, password_hash, role.toUpperCase(), profile_image || null, now, now]
    );

    const newUser = userResult.rows[0];

    // 2. Optionally insert profile based on role
    if (newUser.role === 'DRIVER' && driver_profile) {
      const {
        vehicle_type,
        vehicle_registration_number,
        driving_licence_number,
        vehicle_image,
        city,
        availability_status = true
      } = driver_profile;

      await client.query(
        `INSERT INTO driver_profiles (user_id, vehicle_type, vehicle_registration_number, driving_licence_number, vehicle_image, city, availability_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          newUser.id,
          vehicle_type || 'AUTO_RICKSHAW',
          vehicle_registration_number || null,
          driving_licence_number || null,
          vehicle_image || null,
          city || null,
          availability_status
        ]
      );
    } else if (newUser.role === 'PUBLISHER' && publisher_profile) {
      const {
        business_name,
        business_logo,
        business_category,
        business_address,
        contact_phone
      } = publisher_profile;

      await client.query(
        `INSERT INTO publisher_profiles (user_id, business_name, business_logo, business_category, business_address, contact_phone)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          newUser.id,
          business_name || name,
          business_logo || null,
          business_category || null,
          business_address || null,
          contact_phone || phone
        ]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }
    next(error);
  } finally {
    client.release();
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    let sql = 'SELECT id, name, email, phone, role, profile_image, created_at, updated_at FROM users';
    const params = [];

    if (role) {
      sql += ' WHERE role = $1';
      params.push(role.toUpperCase());
    }

    sql += ' ORDER BY id DESC';

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

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userResult = await query(
      'SELECT id, name, email, phone, role, profile_image, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Fetch related profile
    if (user.role === 'DRIVER') {
      const profileResult = await query('SELECT * FROM driver_profiles WHERE user_id = $1', [id]);
      user.profile = profileResult.rows[0] || null;
    } else if (user.role === 'PUBLISHER') {
      const profileResult = await query('SELECT * FROM publisher_profiles WHERE user_id = $1', [id]);
      user.profile = profileResult.rows[0] || null;
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateDriverProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      vehicle_type,
      vehicle_registration_number,
      driving_licence_number,
      vehicle_image,
      city,
      availability_status
    } = req.body;

    const upsertSql = `
      INSERT INTO driver_profiles (user_id, vehicle_type, vehicle_registration_number, driving_licence_number, vehicle_image, city, availability_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE SET
        vehicle_type = COALESCE(EXCLUDED.vehicle_type, driver_profiles.vehicle_type),
        vehicle_registration_number = COALESCE(EXCLUDED.vehicle_registration_number, driver_profiles.vehicle_registration_number),
        driving_licence_number = COALESCE(EXCLUDED.driving_licence_number, driver_profiles.driving_licence_number),
        vehicle_image = COALESCE(EXCLUDED.vehicle_image, driver_profiles.vehicle_image),
        city = COALESCE(EXCLUDED.city, driver_profiles.city),
        availability_status = COALESCE(EXCLUDED.availability_status, driver_profiles.availability_status)
      RETURNING *;
    `;

    const result = await query(upsertSql, [
      id,
      vehicle_type,
      vehicle_registration_number,
      driving_licence_number,
      vehicle_image,
      city,
      availability_status !== undefined ? availability_status : true
    ]);

    return res.json({
      success: true,
      message: 'Driver profile updated',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updatePublisherProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      business_name,
      business_logo,
      business_category,
      business_address,
      contact_phone
    } = req.body;

    const upsertSql = `
      INSERT INTO publisher_profiles (user_id, business_name, business_logo, business_category, business_address, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE SET
        business_name = COALESCE(EXCLUDED.business_name, publisher_profiles.business_name),
        business_logo = COALESCE(EXCLUDED.business_logo, publisher_profiles.business_logo),
        business_category = COALESCE(EXCLUDED.business_category, publisher_profiles.business_category),
        business_address = COALESCE(EXCLUDED.business_address, publisher_profiles.business_address),
        contact_phone = COALESCE(EXCLUDED.contact_phone, publisher_profiles.contact_phone)
      RETURNING *;
    `;

    const result = await query(upsertSql, [
      id,
      business_name,
      business_logo,
      business_category,
      business_address,
      contact_phone
    ]);

    return res.json({
      success: true,
      message: 'Publisher profile updated',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
