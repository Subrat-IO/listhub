# ListHub

ListHub is a three-app marketplace monorepo:

- `website/` — public marketplace (Next.js, port **3000**)
- `admin/` — administration console (Next.js, port **3001**)
- `backend/` — centralized API + MySQL access (Express + Prisma, port **5000**)

Only the backend talks to MySQL. Both frontends call the backend over HTTP(S) using cookie-based sessions.

## Prerequisites

- Node.js **20+** (recommended)
- MySQL **8.4**
- `npm`

## Environment files (single-file policy)

Each app uses **exactly one** environment file locally:

- Copy `backend/.env.example` → `backend/.env`
- Copy `website/.env.example` → `website/.env`
- Copy `admin/.env.example` → `admin/.env`

Fill in real values (never commit `.env` files).

### Required variables (names)

**`backend/.env`**

- `NODE_ENV`
- `PORT`
- `DATABASE_URL` (MySQL connection string)
- `WEBSITE_URL` (e.g. `http://localhost:3000`)
- `ADMIN_URL` (e.g. `http://localhost:3001`)
- `SESSION_SECRET` (min 32 chars)
- `SESSION_COOKIE_NAME`
- `SESSION_COOKIE_SECURE` (`true|false`)
- Optional integrations: `STORAGE_*`, `SMTP_*`, `GOOGLE_*`
- Seed overrides (optional): `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`

**`website/.env`**

- `NODE_ENV`, `PORT`
- `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`
- `API_INTERNAL_URL` (used for server-side `fetch` from Next.js route handlers/pages)

**`admin/.env`**

- `NODE_ENV`, `PORT`
- `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_ADMIN_URL`, `NEXT_PUBLIC_API_URL`
- `API_INTERNAL_URL`

## Database setup

1. Create a MySQL database + user.
2. Put the connection string into `backend/.env` as `DATABASE_URL`.

Run migrations and seed:

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
```

## Run locally (three terminals)

```bash
cd backend && npm run dev
```

```bash
cd website && npm run dev
```

```bash
cd admin && npm run dev
```

## Default admin user (seed)

By default, `db:seed` creates an admin user:

- Email: `admin@listhub.local`
- Password: `ChangeMe123456!`

Change these via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `backend/.env` before seeding if you want different values.

## Deployment shape (recommended)

- `www.listhub.com` → `website`
- `admin.listhub.com` → `admin`
- `api.listhub.com` → `backend`

Use HTTPS, restrict CORS to the intended origins, and keep MySQL off the public internet.

## Troubleshooting

- **Website pages show “API unavailable”**: ensure `backend` is running and your `.env` URLs match the ports above.
- **401/403 on `/api/v1/*`**: you may need to sign in (website/admin) — staff routes require `MODERATOR` / `ADMIN` / `SUPER_ADMIN` roles in the database.
