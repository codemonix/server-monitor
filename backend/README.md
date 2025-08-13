# Server Monitor Backend

Skeleton Express backend with JWT auth and mock monitoring services.

1. Copy `.env.example` to `.env` and edit values.
2. `npm install`
3. Start MongoDB (e.g., `mongod` or a Docker container).
4. `npm run seed` to create an admin user (defaults admin/admin123)
5. `npm run dev` to run with nodemon for development.

Endpoints:
- POST /auth/register { username, password }
- POST /auth/login { username, password } -> { token }
- GET /monitor  (requires Authorization: Bearer <token>)