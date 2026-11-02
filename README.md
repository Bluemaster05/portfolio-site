# Portfolio Site

A self-hosted, content-managed developer portfolio built to be **easy to read** first and pretty
second. Fork it, sign in to the admin portal, and fill in your own content — no code changes needed.

- **Server-rendered public site** (Next.js) for fast loads and good SEO.
- **Admin portal** to manage every section, with rich text editing (TipTap) and custom blocks like
  tabbed, syntax-highlighted code snippets.
- **Toggleable sections:** Home, Projects, Experience, Education, Blog, Honors & Awards.
- **Typed end to end:** the NestJS API publishes an OpenAPI spec that the frontend turns into
  TypeScript types.
- **Locked-down by default:** the public site reads through a read-only, scoped API token; the admin
  portal uses argon2 + JWT cookies + CSRF and can be restricted to a trusted network.

## Stack

| Part      | Tech                                                                                   |
| --------- | -------------------------------------------------------------------------------------- |
| Frontend  | Next.js (App Router), React, Tailwind CSS, TipTap, openapi-fetch, openapi-react-query, Shiki |
| Backend   | NestJS, MikroORM + PostgreSQL, Passport JWT, argon2, helmet, csrf-csrf, Swagger        |
| Tooling   | Yarn, TypeScript, Vitest, Docker Compose (database)                                    |

## Repository layout

```
frontend/   Next.js app — public site + /admin portal
server/     NestJS API — /api/public (read-only), /api/admin, /api/auth
docs/       Project documentation
```

## Quick start

```bash
# Database + API
cd server
cp .env.example .env
docker compose up -d
yarn install
yarn migration:up && yarn db:seed
yarn start:dev

# Site (in another terminal)
cd frontend
cp .env.example .env.local
yarn install
yarn dev
```

Open <http://localhost:3000> for the site and <http://localhost:3000/admin> for the admin portal.
API docs are at <http://localhost:4000/api/docs>. Full setup: [docs/GettingStarted.md](docs/GettingStarted.md).

## Making it yours

`main` is a generic template with no personal content. Keep your personal theme tweaks and assets on
your own branch and merge `main` into it for updates. See
[docs/ProjectOverview.md](docs/ProjectOverview.md#branching-model).

## Documentation

- [Project overview](docs/ProjectOverview.md) — goals, sections, branching model
- [Architecture](docs/Architecture.md) — how the pieces talk to each other
- [Backend](docs/Backend.md) · [Frontend](docs/Frontend.md)
- [Rich content](docs/RichContent.md) — TipTap documents and custom blocks
- [Uploads](docs/Uploads.md) — image uploads, storage, and serving
- [Security](docs/Security.md) — auth, API tokens, CSRF, admin network restriction
- [Deployment](docs/Deployment.md) — hosting on Linux: public site through a tunnel, admin over VPN
- [Design guidelines](docs/DesignGuidelines.md) — readability-first styling rules
- [Original prompt](docs/OriginalPrompt.md) — the brief this project started from
