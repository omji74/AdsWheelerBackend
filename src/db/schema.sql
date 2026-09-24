-- 1. Users Table (Core Identity)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- Values: 'DRIVER', 'PUBLISHER'
    profile_image TEXT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- 2. Driver Profiles (Extends User)
CREATE TABLE IF NOT EXISTS driver_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) NOT NULL, -- Values: 'AUTO_RICKSHAW', 'E_RICKSHAW', 'BOTH'
    vehicle_registration_number VARCHAR(50),
    driving_licence_number VARCHAR(50),
    vehicle_image TEXT,
    city VARCHAR(100),
    availability_status BOOLEAN DEFAULT TRUE
);

-- 3. Publisher Profiles (Extends User)
CREATE TABLE IF NOT EXISTS publisher_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_logo TEXT,
    business_category VARCHAR(100),
    business_address TEXT,
    contact_phone VARCHAR(20)
);

-- 4. Advertisements (Posted by Publishers)
CREATE TABLE IF NOT EXISTS advertisements (
    id BIGSERIAL PRIMARY KEY,
    publisher_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT, -- (On hold as per request, but column remains)
    price DECIMAL(10, 2) NOT NULL,
    target_vehicle_type VARCHAR(50) NOT NULL,
    start_date BIGINT,
    end_date BIGINT,
    duration VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PUBLISHED', -- Values: 'DRAFT', 'PUBLISHED', 'COMPLETED'
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- 5. Ad Applications (Driver Acceptance)
CREATE TABLE IF NOT EXISTS ad_applications (
    id BIGSERIAL PRIMARY KEY,
    advertisement_id BIGINT NOT NULL REFERENCES advertisements(id) ON DELETE CASCADE,
    driver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accepted_at BIGINT NOT NULL,
    start_date BIGINT,
    end_date BIGINT,
    status VARCHAR(50) NOT NULL, -- Values: 'PENDING', 'ACCEPTED', 'ACTIVE', 'COMPLETED'
    payment_status VARCHAR(50) NOT NULL, -- Values: 'PENDING', 'PAID'
    amount DECIMAL(10, 2) NOT NULL
);

-- 6. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    read_status BOOLEAN DEFAULT FALSE,
    created_at BIGINT NOT NULL
);

-- Optional helpful indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_ads_publisher ON advertisements(publisher_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON advertisements(status);
CREATE INDEX IF NOT EXISTS idx_applications_ad ON ad_applications(advertisement_id);
CREATE INDEX IF NOT EXISTS idx_applications_driver ON ad_applications(driver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
