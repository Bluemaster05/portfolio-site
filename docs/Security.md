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

With `ADMIN_ALLOWED_IPS` set (exact IPs or IPv4 CIDR ranges, comma separated; unset = allowed, for
development), requests from outside the list get a plain 404:

- `frontend/src/proxy.ts` hides `/admin/**`.
- The API hides `/api/auth/*` and `/api/admin/*` (`adminNetworkMiddleware`), so signing in and
  every admin call need an allowed address too, not just the page.
- Public pages never link to `/admin`.

**Which IP is checked.** `X-Forwarded-For` can't be trusted on its own: its first entry is whatever
the client sent. So both sides use `TRUSTED_CLIENT_IP_HEADER` when it's set and present on the
request — a header the proxy in front always overwrites, such as `cf-connecting-ip` (Cloudflare) or
`x-real-ip` (nginx with `proxy_set_header X-Real-IP $remote_addr`). Otherwise:

- the API uses the connection's own address;
- the frontend uses the address Next.js recorded, which a client connecting directly can fake —
  fine when only trusted networks can reach Next.js directly, which is why the firewall matters.

**Recommended production layout** ([Deployment.md](Deployment.md)): the public site goes out
through a tunnel or proxy that never forwards `/admin` or `/api`, and the admin portal and API are
reached only over a VPN. `ADMIN_ALLOWED_IPS` is then the VPN's subnet, the API is never public,
and uploads go straight to it. Over a VPN the admin may be plain HTTP, which needs
`COOKIE_SECURE=false` on the server (browsers drop `Secure` cookies set over HTTP); the VPN
encrypts the traffic.
