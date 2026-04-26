#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ── Prerequisites ────────────────────────────────────────────────────────────

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo "error: $1 is required but not installed" >&2
    exit 1
  fi
}

check_cmd node
check_cmd docker
check_cmd pnpm

# ── Environment files ────────────────────────────────────────────────────────

setup_env() {
  local example="$1" target="$2"
  if [[ ! -f "$target" ]]; then
    cp "$example" "$target"
    echo "created $target from $example"
  else
    echo "skipped $target (already exists)"
  fi
}

setup_env apps/server/.env.example apps/server/.env
setup_env apps/client/.env.example apps/client/.env

# Inject a random BETTER_AUTH_SECRET if the placeholder is still empty
if grep -q 'BETTER_AUTH_SECRET=""' apps/server/.env; then
  secret=$(node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))")
  sed -i.bak "s|BETTER_AUTH_SECRET=\"\"|BETTER_AUTH_SECRET=\"$secret\"|" apps/server/.env
  rm -f apps/server/.env.bak
  echo "generated BETTER_AUTH_SECRET"
fi

# ── Database ─────────────────────────────────────────────────────────────────

echo "starting postgres..."
docker compose up -d postgres

echo "waiting for postgres to be healthy..."
until docker compose exec -T postgres pg_isready -U postgres -d data-drop-headless &>/dev/null; do
  sleep 1
done
echo "postgres is ready"

# ── Dependencies ─────────────────────────────────────────────────────────────

echo "installing dependencies..."
pnpm install --frozen-lockfile

# ── Migrations ───────────────────────────────────────────────────────────────

echo "running database migrations..."
pnpm db:migrate

echo ""
echo "setup complete — run 'pnpm dev' to start the development servers"
