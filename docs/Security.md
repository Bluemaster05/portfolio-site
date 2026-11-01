# Security

## Admin authentication

- Passwords are hashed with **argon2id** (`argon2` package).
- Login sets two httpOnly, `SameSite=strict` cookies (`Secure` in production):
  - `access_token` — short-lived JWT (15 min) read by the `passport-jwt` strategy.
  - `refresh_token` — random opaque token (7 days); only its SHA-256 hash is stored. Each refresh
    rotates it and revokes the old one.
- There is no public registration endpoint. The first admin is created by the database seeder from
  `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- A global `JwtAuthGuard` protects every route by default. Routes opt out with `@Public()` or use
  `@ApiTokenAuth(scope)` for the public read API.

## CSRF

`csrf-csrf` double-submit protection is applied to every non-GET request. The client fetches a token
from `GET /api/auth/csrf-token` and sends it in `X-CSRF-Token`. Requests authenticated by an API
token are GET-only, so they are unaffected.

## Public API tokens

- Created in the admin portal. The full token (`pk_<prefix>_<secret>`) is shown **once**; only its
  SHA-256 hash and the short prefix are stored.
- Each token has a list of **read scopes** (`site:read`, `projects:read`, `experience:read`,
  `education:read`, `honors:read`, `blog:read`). Public endpoints check the scope they need.
- Tokens can be revoked and can have an optional expiry. `lastUsedAt` is recorded.
- The frontend uses the token **only on the Next.js server** (`PORTFOLIO_API_TOKEN`, never
  `NEXT_PUBLIC_*`).

## Uploads

Admin-only (`POST /api/admin/media`, JWT + CSRF). Images and MP4/WebM videos only, detected from
file contents with per-kind size limits; scripted SVGs are refused; files are stored under random UUID names and served with `nosniff`, a sandboxing
CSP, and no directory access (keys are validated against a strict pattern). Served files are public
to anyone with the key. Details: [Uploads.md](Uploads.md).

## HTTP hardening

- `helmet` sets security headers on the API.
- CORS allows only origins in `CORS_ORIGIN` (comma separated) with credentials.
- Global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted` rejects unknown fields.
- Swagger UI is not served when `NODE_ENV=production`.

## Admin network restriction

Goal: in production the public site exposes **no path** to the admin login or views.

Current approach (first pass):

- `frontend/src/proxy.ts` returns 404 for `/admin/**` when `ADMIN_ALLOWED_IPS` is set and the
  request IP is not in that list (exact IPs or IPv4 CIDR ranges, comma separated). Unset = allowed
  (development).
- Public pages never link to `/admin`.

Planned hardening (not done yet):

- Enforce the same allow-list on the server for `/api/auth/*` and `/api/admin/*`, using the real
  client IP from a trusted reverse proxy (`trust proxy`).
- Optionally run the admin portal on a separate internal hostname.
