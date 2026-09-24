# AdsWheeler Backend API

Express.js REST API with PostgreSQL integration configured using environment variables.

---

## 📁 Project Structure

```
adswheelerBackend/
├── .env                  # Environment variables (secret / local configuration)
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore file
├── package.json          # Node dependencies and scripts
├── src/
│   ├── app.js            # Express app configuration & middleware
│   ├── server.js         # HTTP server entry point & graceful shutdown
│   ├── config/
│   │   ├── env.js        # Centralized environment variable loader
│   │   └── db.js         # PostgreSQL connection pool & query helpers
│   ├── controllers/
│   │   ├── userController.js        # User & driver/publisher profile handlers
│   │   ├── adController.js          # Advertisement handlers
│   │   ├── applicationController.js # Ad application handlers
│   │   └── notificationController.js# Notification handlers
│   ├── routes/
│   │   ├── health.routes.js         # Server & DB health check
│   │   ├── users.routes.js          # /api/users endpoints
│   │   ├── ads.routes.js            # /api/ads endpoints
│   │   ├── applications.routes.js   # /api/applications endpoints
│   │   └── notifications.routes.js  # /api/notifications endpoints
│   └── db/
│       ├── schema.sql    # PostgreSQL DDL table definitions & indexes
│       └── initDb.js     # Script to execute schema.sql in PostgreSQL
└── README.md             # Documentation
```

---

## ⚙️ Environment Variables

Create or edit your `.env` file in the root directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development
CORS_ORIGIN=*

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=adswheeler
DB_SSL=false

# Alternatively, specify a full connection string (e.g., Supabase / Neon / Render):
# DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database Tables
Make sure your PostgreSQL database exists, then run:
```bash
npm run db:init
```
This runs `src/db/schema.sql` to create all 6 tables and indexes.

### 3. Start the Server
- **Development (with hot reload via nodemon):**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm start
  ```

---

## 🗄️ Database Schema

The database consists of 6 tables:

1. **`users`**: Core identity (name, email, phone, password_hash, role: `DRIVER` | `PUBLISHER`, profile_image, created_at, updated_at).
2. **`driver_profiles`**: Extends `users` for drivers (vehicle_type: `AUTO_RICKSHAW`, `E_RICKSHAW`, `BOTH`, registration, license, image, city, availability_status).
3. **`publisher_profiles`**: Extends `users` for publishers (business_name, logo, category, address, contact_phone).
4. **`advertisements`**: Ads posted by publishers (publisher_id, business_name, title, description, image, price, target_vehicle_type, duration, status: `DRAFT`, `PUBLISHED`, `COMPLETED`).
5. **`ad_applications`**: Applications by drivers (advertisement_id, driver_id, status: `PENDING`, `ACCEPTED`, `ACTIVE`, `COMPLETED`, payment_status: `PENDING`, `PAID`, amount).
6. **`notifications`**: User notifications (user_id, title, message, type, read_status, created_at).

---

## 🔌 API Endpoints Summary

### 1. Health & Server Info
- `GET /` — API directory & server status
- `GET /api/health` — Service health check & database connection status

### 2. Users & Profiles (`/api/users`)
- `POST /api/users` — Create user (with optional nested `driver_profile` or `publisher_profile`)
- `GET /api/users?role=DRIVER|PUBLISHER` — List all users (optionally filtered by role)
- `GET /api/users/:id` — Get user by ID (includes profile data)
- `PUT /api/users/:id/driver-profile` — Upsert driver profile
- `PUT /api/users/:id/publisher-profile` — Upsert publisher profile

### 3. Advertisements (`/api/ads`)
- `POST /api/ads` — Create an advertisement
- `GET /api/ads?status=PUBLISHED&target_vehicle_type=AUTO_RICKSHAW&publisher_id=1` — List advertisements
- `GET /api/ads/:id` — Get ad by ID
- `PUT /api/ads/:id` — Update ad
- `DELETE /api/ads/:id` — Delete ad

### 4. Ad Applications (`/api/applications`)
- `POST /api/applications` — Driver applies/accepts ad
- `GET /api/applications?driver_id=1&advertisement_id=1&status=PENDING` — List applications
- `GET /api/applications/:id` — Get application details
- `PATCH /api/applications/:id/status` — Update application status or payment status

### 5. Notifications (`/api/notifications`)
- `POST /api/notifications` — Create notification
- `GET /api/notifications?user_id=1&read_status=false` — List notifications
- `PATCH /api/notifications/:id/read` — Mark notification as read
- `DELETE /api/notifications/:id` — Delete notification

---

## 📝 Example Requests

### Register User (Driver)
```bash
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "phone": "+919876543210",
    "password_hash": "$2b$10$xyz...",
    "role": "DRIVER",
    "driver_profile": {
      "vehicle_type": "AUTO_RICKSHAW",
      "vehicle_registration_number": "DL1AB1234",
      "driving_licence_number": "DL-1420110012345",
      "city": "New Delhi",
      "availability_status": true
    }
  }'
```

### Create Advertisement (Publisher)
```bash
curl -X POST http://localhost:5001/api/ads \
  -H "Content-Type: application/json" \
  -d '{
    "publisher_id": 1,
    "business_name": "Fresh Foods Mart",
    "title": "Weekend 50% Off Campaign",
    "description": "Promotional banner on auto hood and back cover",
    "price": 2500.00,
    "target_vehicle_type": "AUTO_RICKSHAW",
    "duration": "1 Month",
    "status": "PUBLISHED"
  }'
```
