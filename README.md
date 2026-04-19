# DataDrop Headless

A data management platform that allows admins to upload CSV datasets and share them with viewer users. Built with a React + Vite frontend and an Express + Drizzle ORM backend backed by PostgreSQL, organized as a pnpm + Turborepo monorepo.

## Tech Stack

- **Client** — React 19, React Router 7, TanStack Query, Tailwind CSS v4, Vite
- **Server** — Express 5, Drizzle ORM, Better Auth, Zod
- **Database** — PostgreSQL 16
- **Auth** — Better Auth (credentials + GitHub OAuth)
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
BETTER_AUTH_GITHUB_CLIENT_ID=your_github_client_id
BETTER_AUTH_GITHUB_CLIENT_SECRET=your_github_client_secret
DATABASE_URL=postgresql://postgres:password@localhost:5432/data-drop-headless
SEED_DATABASE_URL=postgresql://postgres:password@localhost:5432/data-drop-headless
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
```

**Client** — `apps/client/.env`:

```env
API_URL=http://localhost:3000
```

> To get GitHub OAuth credentials, create an OAuth App at [github.com/settings/developers](https://github.com/settings/developers). Set the callback URL to `http://localhost:3000/api/auth/callback/github`.

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
