# Architecture

## Repository layout

```
/
├── frontend/   Next.js (App Router) — public site + admin portal
├── server/     NestJS + MikroORM (PostgreSQL) — REST API + OpenAPI docs
└── docs/       Project documentation (you are here)
```

The two apps are independent yarn projects (each has its own `package.json` and `yarn.lock`). The
root `package.json` only holds convenience scripts that call into them.

## Data flow

```
                ┌──────────────── Public visitor ────────────────┐
                │                                                │
                ▼                                                │
   Next.js server components ──(API token, server side)──► /api/public/*  (read only)
                │                                                │
                ▼                                                │
         HTML (SSR, SEO)                                         │
                                                                 │
                ┌──────────────── Admin (trusted network) ───────┘
                ▼
   Next.js /admin (client components)
     └─ openapi-react-query ──(httpOnly JWT cookies + CSRF)──► /api/auth/*, /api/admin/*
```

### Public site

- Pages under `frontend/src/app/(public)` are **server components**. They call the API from the
  Next.js server with a read-only **API token** (`PORTFOLIO_API_TOKEN`, a server-only env var), so the
  token never reaches the browser.
- The API returns only **published** items from **enabled** sections.
- Rich text is stored as TipTap JSON and rendered to HTML on the server, including syntax
  highlighting, so the page arrives complete. See [RichContent.md](RichContent.md).

### Admin portal

- Pages under `frontend/src/app/admin` are client components that talk to the API from the browser
  with cookies (`credentials: 'include'`).
- Auth: email + password → access token + refresh token in httpOnly, `SameSite=strict` cookies. The
  client retries once through `/api/auth/refresh` on a 401.
- Every state-changing request carries an `X-CSRF-Token` header (double-submit cookie via
  `csrf-csrf`).

## API surface

| Prefix           | Auth                       | Purpose                                          |
| ---------------- | -------------------------- | ------------------------------------------------ |
| `/api/auth/*`    | public / cookie            | Login, refresh, logout, current user, CSRF token |
| `/api/admin/*`   | JWT cookie + CSRF          | Full CRUD for all content, settings, API tokens  |
| `/api/public/*`  | API token (`X-API-Key` or `Authorization: Bearer`) with scope | Read-only published content |
| `/api/health`    | none                       | Liveness check                                   |

Swagger UI is served at `/api/docs` outside production, and the OpenAPI JSON at `/api/docs-json`.

## Typed client

The server writes its OpenAPI document to `server/openapi.json` (`yarn openapi:export`, no database
needed). The frontend generates `src/lib/api/schema.d.ts` from that file
(`yarn openapi:generate`). Both files are committed so the frontend type-checks without the server
running. **Any change to a controller or DTO must be followed by regenerating both.**

See [Backend.md](Backend.md) and [Frontend.md](Frontend.md) for each side's conventions.
