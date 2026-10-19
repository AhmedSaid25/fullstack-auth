# Fullstack Auth

[![CI](https://github.com/AhmedSaid25/fullstack-auth/actions/workflows/ci.yml/badge.svg)](https://github.com/AhmedSaid25/fullstack-auth/actions/workflows/ci.yml)

A sign-up / sign-in module: **NestJS + MongoDB** API and a **React + TypeScript** frontend.

- Sign up with email, name (min 3 chars) and a strong password (8+ chars, a letter, a number, a special character)
- Sign in / sign out, session kept in an **httpOnly JWT cookie**
- Protected page showing "Welcome to the application." and a protected API endpoint (`GET /users/me`)

## Tech stack

| | |
|---|---|
| Backend | NestJS 11, Mongoose 8, class-validator, bcrypt, @nestjs/jwt, helmet, @nestjs/throttler, Swagger |
| Frontend | React 19, Vite 6, TypeScript, MUI, React Router 7, react-hook-form + zod |
| Tooling | ESLint, Prettier, Jest + Supertest + mongodb-memory-server, GitHub Actions |

## Project structure

```
backend/
  src/
    auth/       signup, signin, signout, JWT guard, DTOs
    users/      User schema, UsersService, GET /users/me
    common/     global exception filter, request logger
    app.setup.ts  shared app config (helmet, CORS, cookies, validation, errors)
  test/         e2e tests
frontend/
  src/
    api/        fetch wrapper + one function per endpoint
    auth/       AuthProvider (session state), useAuth, zod schemas
    routes/     ProtectedRoute / GuestRoute
    pages/      SignUpPage, SignInPage, AppPage
docker-compose.yml   local MongoDB
```

## Getting started

**Requirements:** Node.js 20+, and MongoDB (Docker, a local install, or a free MongoDB Atlas cluster).

### 1. Start MongoDB

```bash
docker compose up -d
```

### 2. Backend (http://localhost:3000)

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

Set a real `JWT_SECRET` in `.env`, for example:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Frontend (http://localhost:5173)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173, create an account and you land on the application page.

## Environment variables

**backend/.env**

| Variable | Description | Example |
|---|---|---|
| `PORT` | API port | `3000` |
| `NODE_ENV` | `production` makes the cookie `Secure` (HTTPS only) | `development` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/fullstack-auth` |
| `JWT_SECRET` | Secret used to sign tokens | long random string |
| `JWT_EXPIRES_IN` | Token and cookie lifetime in seconds | `86400` |

**frontend/.env**

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend base URL | `http://localhost:3000` |

## API

Interactive docs (Swagger): **http://localhost:3000/docs**

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | - | Create an account, sets the auth cookie. `201`, `400`, `409` |
| POST | `/auth/signin` | - | Sign in, sets the auth cookie. `200`, `400`, `401` |
| POST | `/auth/signout` | - | Clears the auth cookie. `204` |
| GET | `/users/me` | cookie | Current user. `200`, `401` |

`/auth/*` routes are rate limited to 10 requests per minute per IP (`429`).
Errors always have the same shape: `{ statusCode, message, error, path, timestamp }`.

## Scripts

| Where | Command | What it does |
|---|---|---|
| backend | `npm run start:dev` | API with reload on change |
| backend | `npm test` | Unit tests |
| backend | `npm run test:e2e` | End-to-end tests (starts an in-memory MongoDB, no setup needed) |
| backend | `npm run lint` | ESLint + Prettier (with auto-fix) |
| frontend | `npm run dev` | Dev server |
| frontend | `npm run build` | Type check + production build |
| frontend | `npm run lint` | ESLint |

CI runs lint, build and all tests on every push (`.github/workflows/ci.yml`).

## Security decisions

- **Passwords** are hashed with bcrypt (cost 12) and never returned by the API (`select: false` on the schema).
- **JWT in an httpOnly cookie**, not localStorage: JavaScript in the page can't read it, so an XSS bug can't steal the session. `SameSite=Lax` blocks the cookie on cross-site POSTs (CSRF), and it is `Secure` in production.
- **Same error for unknown email and wrong password**, so the sign-in form doesn't reveal which emails are registered.
- **Validation on both sides:** zod on the frontend for instant feedback, class-validator on the backend as the real gate. Unknown fields are rejected (`forbidNonWhitelisted`).
- **Unique index on email** handles duplicate sign-ups atomically, without a race between "check" and "insert".
- **helmet** security headers, **CORS** limited to the frontend origin, **rate limiting** on auth routes.
- Unexpected errors are logged with their stack trace, but the client only sees a generic message.

## Possible improvements

- Refresh tokens with short-lived access tokens, and token revocation on logout
- Email verification and password reset
- Structured JSON logging (pino) for production log tooling
- Frontend component tests
