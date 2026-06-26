# RateStore Backend

## Overview

The RateStore backend is an Express API for authentication, role-based access control, store management, and store ratings. It uses Prisma Client to persist users, stores, and ratings in PostgreSQL.

## Features

- Public signup and login.
- JWT access and refresh token authentication.
- HttpOnly cookie token storage.
- Authenticated session rehydration with `/api/auth/me` and `/api/auth/refresh`.
- Password change for authenticated users.
- Admin dashboard totals.
- Admin user creation, user listing, user detail lookup, store creation, and store listing.
- User store listing with search, sorting, pagination, aggregate ratings, and current user's rating.
- Rating creation and update with one rating per user per store.
- Owner dashboard for a store's rating summary and raters.
- Zod request validation.
- Global JSON error responses.
- Rate limiting, Helmet headers, CORS, compression, cookie parsing, and Winston logging.

## Tech Stack

- Node.js with ES modules.
- Express `^4.19.2`.
- PostgreSQL via Prisma Client `^5.14.0`.
- Prisma CLI `^5.14.0`.
- bcrypt `^5.1.1` for password hashing.
- jsonwebtoken `^9.0.2` for JWT signing and verification.
- Zod `^3.23.8` for request validation.
- helmet `^7.2.0` for security headers.
- cors `^2.8.5` for browser access control.
- express-rate-limit `^7.3.1` for global and auth route limits.
- compression `^1.7.4` for response compression.
- cookie-parser `^1.4.6` for cookie handling.
- winston `^3.13.0` for logging.
- nodemon `^3.1.3` for local development.

## Folder Structure

```text
Backend/
|-- prisma/
|   |-- migrations/
|   |-- schema.prisma
|   `-- seed.js
|-- src/
|   |-- config/
|   |   `-- prisma.js
|   |-- controllers/
|   |-- middleware/
|   |-- routes/
|   |-- utils/
|   |-- validators/
|   `-- server.js
|-- package.json
`-- prisma.config.ts
```

- `prisma/schema.prisma`: PostgreSQL datasource, Prisma Client generator, enums, and database models.
- `prisma/migrations/`: Committed database migrations.
- `prisma/seed.js`: Creates the default admin user.
- `src/server.js`: Express app setup, middleware, route mounting, health check, 404 handler, and server startup.
- `src/config/prisma.js`: Shared Prisma Client instance.
- `src/routes/`: Route definitions grouped by domain.
- `src/controllers/`: Request handlers and Prisma operations.
- `src/middleware/`: Authentication, authorization, async error handling, and global error formatting.
- `src/validators/`: Zod schemas.
- `src/utils/`: Token generation, logger, and rating helpers.

## Backend Architecture

```text
Client
-> Express route
-> Middleware
-> Controller
-> Validation
-> Prisma Client
-> PostgreSQL
-> JSON response
```

`server.js` mounts all API modules under `/api`, applies global security and parsing middleware, and finishes with a 404 handler plus `errorHandler`. Controllers are wrapped with `asyncHandler`, so thrown validation, auth, Prisma, or application errors are formatted consistently.

## Authentication

Login uses email and password. Passwords are compared with bcrypt. On success, the backend generates:

- `accessToken`: signed with `JWT_SECRET`, expires in 15 minutes.
- `refreshToken`: signed with `REFRESH_TOKEN_SECRET`, expires in 7 days.

Both tokens are set as cookies. The access token is also returned in the response body so the frontend can keep it in memory and send `Authorization: Bearer <token>`.

The `authenticate` middleware reads the access token from:

1. `Authorization: Bearer <token>`
2. `accessToken` cookie

The refresh endpoint reads `refreshToken` from cookies and returns a new access token after verifying the user still exists.

## Authorization

Authorization is role-based. The `authorize(...allowedRoles)` middleware checks `req.user.role`.

Implemented roles:

- `ADMIN`: admin dashboard, user management, store management.
- `USER`: store browsing and rating endpoints.
- `OWNER`: owner dashboard.

## Database Design

### User

Stores account data and role.

Fields include `id`, `name`, `email`, `password`, `address`, `role`, `createdAt`, and `updatedAt`.

Relationships:

- One optional `Store` for owners.
- Many `Rating` records for users.

### Store

Stores business/store details.

Fields include `id`, `name`, `email`, `address`, `ownerId`, `createdAt`, and `updatedAt`.

Relationships:

- One owner `User`.
- Many `Rating` records.

Constraints:

- `email` is unique.
- `ownerId` is unique, so one owner can have one store.

### Rating

Stores user ratings for stores.

Fields include `id`, `rating`, `userId`, `storeId`, `createdAt`, and `updatedAt`.

Constraints:

- `@@unique([userId, storeId])`, so each user can rate a store once.
- Rating values are validated from 1 to 5.

## API Documentation

| Method | Endpoint | Authentication | Description | Request Body | Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/health` | Public | Health check. | None | `{ success, message }` |
| POST | `/api/auth/signup` | Public | Register a standard user. | `{ name, email, password, address }` | `{ success, message, data: user }` |
| POST | `/api/auth/login` | Public | Authenticate and set auth cookies. | `{ email, password }` | `{ success, message, data: { accessToken, user } }` |
| POST | `/api/auth/refresh` | Refresh cookie | Issue new access and refresh tokens. | None | `{ success, message, data: { accessToken, user } }` |
| GET | `/api/auth/me` | Authenticated | Return current user profile. | None | `{ success, data: user }` |
| PUT | `/api/auth/change-password` | Authenticated | Change current user's password. | `{ currentPassword, newPassword }` | `{ success, message }` |
| POST | `/api/auth/logout` | Authenticated | Clear auth cookies. | None | `{ success, message }` |
| GET | `/api/admin/dashboard` | `ADMIN` | Get total users, stores, and ratings. | None | `{ success, data: { totalUsers, totalStores, totalRatings } }` |
| POST | `/api/admin/users` | `ADMIN` | Create a user with selected role. | `{ name, email, password, address, role }` | `{ success, message, data: user }` |
| GET | `/api/admin/users` | `ADMIN` | List users with pagination, search, role filter, and sorting. | Query: `page`, `limit`, `search`, `role`, `sortBy`, `order` | `{ success, data: { users, pagination } }` |
| GET | `/api/admin/users/:id` | `ADMIN` | Get user details. Owner users include store details when available. | None | `{ success, data: user }` |
| POST | `/api/admin/stores` | `ADMIN` | Create a store for an owner user. | `{ name, email, address, ownerId }` | `{ success, message, data: store }` |
| GET | `/api/admin/stores` | `ADMIN` | List stores with pagination, search, sorting, and rating aggregates. | Query: `page`, `limit`, `search`, `sortBy`, `order` | `{ success, data: { stores, pagination } }` |
| GET | `/api/stores` | `USER` | List stores for rating, including current user's rating when present. | Query: `page`, `limit`, `search`, `sortBy`, `order` | `{ success, data: { stores, pagination } }` |
| POST | `/api/ratings` | `USER` | Submit a rating for a store. | `{ storeId, rating }` | `{ success, message, data: rating }` |
| PUT | `/api/ratings/:id` | `USER` | Update the authenticated user's rating. | `{ rating }` | `{ success, message, data: rating }` |
| GET | `/api/owner/dashboard` | `OWNER` | Get owner's store summary and users who rated it. | None | `{ success, data: { store, users } }` |

## Middleware

- `helmet()`: Applies secure HTTP headers.
- `cors()`: Allows the frontend origin with credentials.
- `express-rate-limit`: Applies a global limit of 100 requests per 15 minutes and an auth limit of 20 requests per 15 minutes.
- `compression()`: Compresses responses.
- `express.json({ limit: "10kb" })`: Parses JSON bodies.
- `express.urlencoded({ extended: true, limit: "10kb" })`: Parses URL-encoded bodies.
- `cookieParser(process.env.COOKIE_SECRET)`: Parses cookies.
- `authenticate`: Verifies JWT access tokens.
- `authorize`: Enforces role-based route access.
- `errorHandler`: Formats validation, Prisma, JWT, operational, and unknown errors.

## Validation

Validation uses Zod.

- Signup and admin user creation require names from 20 to 60 characters, valid email, address up to 400 characters, and a password with 8 to 16 characters, one uppercase letter, and one special character.
- Login requires valid email and non-empty password.
- Store creation requires name, email, address, and positive integer `ownerId`.
- Rating submission and update require integer ratings from 1 to 5.

## Error Handling

Errors are returned as JSON:

```json
{
  "success": false,
  "message": "Error message"
}
```

Validation errors use:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {}
}
```

Handled status codes include:

- `400`: Validation failure or invalid input.
- `401`: Missing, invalid, or expired token.
- `403`: Authenticated user lacks permission.
- `404`: Route or record not found.
- `409`: Duplicate record or duplicate rating conflict.
- `500`: Unexpected server error.

## Security

Implemented security measures:

- Password hashing with bcrypt.
- JWT access and refresh tokens.
- HttpOnly cookies for tokens.
- Secure cookie mode in production.
- Role-based authorization.
- Helmet security headers.
- CORS credentials restricted to configured frontend origin.
- Request body size limit of 10 KB.
- Global and auth-specific rate limiting.
- Generic 500 errors that avoid leaking internals.

## Backend Environment Variables

Create `Backend/.env`:

```env
PORT=8000
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/store_rating_db"
JWT_SECRET="replace-with-a-long-random-secret"
REFRESH_TOKEN_SECRET="replace-with-a-different-long-random-secret"
CORS_ORIGIN="http://localhost:5173"
COOKIE_SECRET="replace-with-a-cookie-secret"
NODE_ENV="development"
```

- `PORT`: Express server port. Defaults to `5000` if unset.
- `DATABASE_URL`: PostgreSQL connection string used by Prisma and `prisma.config.ts`.
- `JWT_SECRET`: Secret for signing access tokens.
- `REFRESH_TOKEN_SECRET`: Secret for signing refresh tokens.
- `CORS_ORIGIN`: Allowed frontend origin. Defaults to `http://localhost:5173`.
- `COOKIE_SECRET`: Secret passed to cookie-parser.
- `NODE_ENV`: Enables secure/strict cookies and warn-level logging in production.

## Backend Setup

Install dependencies:

```bash
npm install
```

Apply migrations:

```bash
npm run db:migrate
```

Seed admin user:

```bash
npm run db:seed
```

Run development server:

```bash
npm run dev
```

Run production-style server:

```bash
npm start
```

Open Prisma Studio:

```bash
npm run db:studio
```

Default local API URL with `PORT=8000`:

```text
http://localhost:8000/api
```

## Available Scripts

- `npm run dev`: Starts `src/server.js` with Nodemon.
- `npm start`: Starts `src/server.js` with Node.
- `npm run db:seed`: Runs the Prisma seed script.
- `npm run db:migrate`: Applies committed migrations with `prisma migrate deploy`.
- `npm run db:studio`: Opens Prisma Studio.
