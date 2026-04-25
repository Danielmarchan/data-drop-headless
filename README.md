# DataDrop Headless

A data management platform that allows admins to upload CSV datasets and share them with viewer users. Built with a React + Vite frontend and an Express + Drizzle ORM backend backed by PostgreSQL, organized as a pnpm + Turborepo monorepo.

## Tech Stack

- **Client** — React 19, React Router 7, TanStack Query, Tailwind CSS v4, Vite
- **Server** — Express 5, Drizzle ORM, Better Auth, Zod
- **Database** — PostgreSQL 16
- **Auth** — Better Auth (credentials)
- **Monorepo** — pnpm workspaces + Turborepo

## Project Structure

```
data-drop-headless/
├── apps/
│   ├── client/              # React frontend (Vite)
│   └── server/              # Express API
├── packages/
│   ├── api-schema/          # Shared Zod request/response schemas
│   └── shared/              # Shared utilities and types
├── docker-compose.yml
├── pnpm-workspace.yaml
└── turbo.json
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io)
- [Docker](https://www.docker.com) (for the local database)

### 1. Start the database

```bash
docker compose up -d
```

This starts a PostgreSQL 16 instance on port `5432` with:

- **User:** `postgres`
- **Password:** `password`
- **Database:** `data-drop-headless`

### 2. Configure environment variables

Each app ships with a `.env.example` file you can copy as a starting point:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env
```

**Server** — `apps/server/.env`:

```env
BETTER_AUTH_SECRET=your_random_secret
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/data-drop-headless
SEED_DATABASE_URL=postgresql://postgres:password@localhost:5432/data-drop-headless
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
COOKIE_DOMAIN=
```

**Client** — `apps/client/.env`:

```env
API_URL=http://localhost:3000
```

### 3. Install dependencies

From the repo root, a single install covers both apps and the shared packages:

```bash
pnpm install
```

### 4. Run database migrations

```bash
pnpm db:migrate
```

### 5. Seed initial data

```bash
pnpm db:seed
```

This seeds the database with demo users and a sample eCommerce dataset. All demo accounts use the password **`DataDropPass123`**.

| Email | Role |
|-------|------|
| demo-admin-user-01@email.com | Admin |
| demo-admin-user-02@email.com | Admin |
| demo-admin-user-03@email.com | Admin |
| demo-admin-user-04@email.com | Admin |
| demo-viewer-user-01@email.com | Viewer |
| demo-viewer-user-02@email.com | Viewer |
| demo-viewer-user-03@email.com | Viewer |
| demo-viewer-user-04@email.com | Viewer |
| demo-viewer-user-05@email.com | Viewer |
| demo-viewer-user-06@email.com | Viewer |
| demo-viewer-user-07@email.com | Viewer |
| demo-viewer-user-08@email.com | Viewer |
| demo-viewer-user-09@email.com | Viewer |
| demo-viewer-user-10@email.com | Viewer |
| demo-viewer-user-11@email.com | Viewer |

> **Warning:** The seed script deletes all existing data before inserting. Never run it against a production database.

### 6. Start the development servers

Run both apps together via Turbo:

```bash
pnpm dev
```

Or run them individually:

```bash
pnpm dev:client       # client only — http://localhost:8080
pnpm dev:server       # server only — http://localhost:3000
```

The app will be available at [http://localhost:8080](http://localhost:8080).

## Deploy to Vercel

Production uses two Vercel projects:

- `apps/client` -> `https://datadrop-app.com`
- `apps/server` -> `https://api.datadrop-app.com`

Auth remains cross-subdomain with:

- `BETTER_AUTH_URL=https://api.datadrop-app.com`
- `CORS_ORIGIN=https://datadrop-app.com`
- `COOKIE_DOMAIN=datadrop-app.com`

### Runtime limits

- CSV uploads are limited to **4 MB** in production to stay within Vercel function request limits.

### Vercel project setup

Create two Vercel projects and point each one at its app directory:

- Web project root: `apps/client`
- API project root: `apps/server`

Disable Vercel Git auto-deploys for production on both projects. Production deploys are driven by GitHub Actions in `.github/workflows/deploy-production.yml`.

Set these project environment variables in Vercel.

**API project**

```env
BETTER_AUTH_SECRET=<strong-random-secret>
BETTER_AUTH_URL=https://api.datadrop-app.com
DATABASE_URL=<neon-pooled-connection-string>
NODE_ENV=production
CORS_ORIGIN=https://datadrop-app.com
COOKIE_DOMAIN=datadrop-app.com
```

**Web project**

```env
API_URL=https://api.datadrop-app.com
```

### GitHub Actions setup

PRs run checks only from `.github/workflows/ci.yml`.

Pushes to `main` run the production pipeline from `.github/workflows/deploy-production.yml` in this order:

1. `validate`
2. `migrate`
3. `deploy_api`
4. `deploy_web`

Add these repository secrets before enabling the workflow:

```env
VERCEL_TOKEN=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID_API=
VERCEL_PROJECT_ID_WEB=
PRODUCTION_DATABASE_URL=
PRODUCTION_BETTER_AUTH_SECRET=
```

`PRODUCTION_DATABASE_URL` is used by GitHub Actions for the migration step. Long-lived runtime variables should stay in Vercel project settings.

### Migration safety

Database migrations run automatically before deploy on every push to `main`.

- Keep production migrations backward compatible with the currently running API.
- If the migration job fails, neither Vercel deploy job runs.
- If the API deploy fails, the web deploy does not run.

### Domains and DNS

Attach these domains in Vercel:

- Web project: `datadrop-app.com`
- Web project redirect: `www.datadrop-app.com` -> `https://datadrop-app.com`
- API project: `api.datadrop-app.com`

In Namecheap `Advanced DNS`, add the records Vercel shows for each domain:

- `@` -> Vercel A record for the web project
- `www` -> Vercel CNAME for the web project
- `api` -> Vercel CNAME for the API project
- any TXT verification records requested by Vercel

Only remove old Fly DNS records after Vercel verifies the domains successfully.

## Other Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run client + server together (Turbo) |
| `pnpm build` | Build all apps and packages |
| `pnpm typecheck` | Type-check the whole workspace |
| `pnpm lint` / `pnpm lint:fix` | Lint (and auto-fix) the whole workspace |
| `pnpm db:studio` | Open Drizzle Studio (visual DB browser) |
| `pnpm db:generate` | Generate a new migration from schema changes |
| `pnpm db:push` | Push schema changes directly (dev only) |
