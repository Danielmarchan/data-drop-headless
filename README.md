# DataDrop Headless

A data management platform that allows admins to upload CSV datasets and share them with viewer users. Built with a React + Vite frontend and an Express + Drizzle ORM backend backed by PostgreSQL.

## Tech Stack

- **Client** — React 19, React Router 7, TanStack Query, Tailwind CSS v4, Vite
- **Server** — Express 5, Drizzle ORM, Better Auth, Zod
- **Database** — PostgreSQL 16
- **Auth** — Better Auth (credentials + GitHub OAuth)

## Project Structure

```
data-drop-headless/
├── client/       # React frontend (Vite)
├── server/       # Express API
└── docker-compose.yml
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

**Server** — create `server/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/data-drop-headless
SEED_DATABASE_URL=postgresql://postgres:password@localhost:5432/data-drop-headless
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_GITHUB_CLIENT_ID=your_github_client_id
BETTER_AUTH_GITHUB_CLIENT_SECRET=your_github_client_secret
CORS_ORIGIN=http://localhost:8080
PORT=3000
```

**Client** — create `client/.env`:

```env
API_URL=http://localhost:3000
```

> To get GitHub OAuth credentials, create an OAuth App at [github.com/settings/developers](https://github.com/settings/developers). Set the callback URL to `http://localhost:3000/api/auth/callback/github`.

### 3. Install dependencies

```bash
cd server && pnpm install
cd ../client && pnpm install
```

### 4. Run database migrations

```bash
cd server
pnpm db:migrate
```

### 5. Seed initial data

```bash
cd server
pnpm db:seed
```

This seeds the database with demo users and a sample eCommerce dataset. All demo accounts use the password **`DataDropPass123`**.

| Email | Role |
|-------|------|
| demo-admin-user-01@email.com | Admin |
| demo-admin-user-02@email.com | Admin |
| demo-viewer-user-01@email.com | Viewer |
| demo-viewer-user-02@email.com | Viewer |
| demo-viewer-user-03@email.com | Viewer |

> **Warning:** The seed script deletes all existing data before inserting. Never run it against a production database.

### 6. Start the development servers

In two separate terminals:

```bash
# Terminal 1 — API server (http://localhost:3000)
cd server && pnpm dev

# Terminal 2 — Frontend (http://localhost:8080)
cd client && pnpm dev
```

The app will be available at [http://localhost:8080](http://localhost:8080).

## Other Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm db:studio` | Open Drizzle Studio (visual DB browser) |
| `pnpm db:generate` | Generate a new migration from schema changes |
| `pnpm db:push` | Push schema changes directly (dev only) |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run ESLint |
