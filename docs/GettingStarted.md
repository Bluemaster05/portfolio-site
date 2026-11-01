# Getting Started

## Prerequisites

- Node.js 22+ (developed on Node 26)
- Yarn 1.x (`corepack enable` or `npm i -g yarn`)
- Docker (for PostgreSQL), or any PostgreSQL 15+ you can reach

## 1. Database

```bash
cd server
cp .env.example .env        # then edit secrets and the admin login
docker compose up -d        # PostgreSQL on localhost:5433
```

## 2. Server

```bash
cd server
yarn install
yarn migration:up           # create tables
yarn db:seed                # admin user, default settings, dev API token
yarn start:dev              # http://localhost:4000, Swagger at http://localhost:4000/api/docs
```

The seeder creates:

- An admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Default site settings (all sections on except Blog).
- If `SEED_API_TOKEN` is set, a read-only API token with that exact value (development
  convenience — in production create tokens in the admin portal).

## 3. Frontend

```bash
cd frontend
cp .env.example .env.local  # set PORTFOLIO_API_TOKEN to the same value as SEED_API_TOKEN
yarn install
yarn dev                    # http://localhost:3000, admin at http://localhost:3000/admin
```

## 4. Make it yours

1. Sign in at `/admin` and fill in **Site settings** (name, headline, bio, links).
2. Switch off any sections you do not want.
3. Add projects, experience, education, honors, and (optionally) blog posts. Unpublished items stay
   hidden from the public site.
4. For visual changes, create a personal branch (see
   [ProjectOverview.md](ProjectOverview.md#branching-model)) and adjust the design tokens in
   `frontend/src/app/globals.css`.
