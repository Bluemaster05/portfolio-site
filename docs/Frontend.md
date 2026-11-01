# Frontend (`/frontend`)

Next.js (App Router, React Server Components) + Tailwind CSS. Two halves:

- **Public site** — `src/app/(public)/` — server components, SSR, rendered from the public API.
- **Admin portal** — `src/app/admin/` — client components, cookie auth, TipTap editing.

> Next.js versions move fast. Before using an unfamiliar API, read the matching guide in
> `frontend/node_modules/next/dist/docs/`. Note that middleware is `src/proxy.ts` in this version.

## Layout

```
frontend/src/
├── app/
│   ├── (public)/              public routes (layout with nav built from enabled sections)
│   ├── admin/                 admin routes (login + dashboard + editors)
│   ├── layout.tsx             root html/body, fonts, theme tokens
│   └── globals.css            design tokens + base styles + prose styles
├── components/
│   ├── public/                presentational components for the public site
│   ├── admin/                 presentational components for the admin portal
│   └── rich-text/             TipTap editor, custom extensions, server renderer
├── lib/
│   ├── api/
│   │   ├── schema.d.ts        GENERATED from server/openapi.json — do not edit
│   │   ├── public-client.ts   server-only client using PORTFOLIO_API_TOKEN
│   │   ├── admin-client.ts    browser client: cookies, CSRF header, refresh-on-401
│   │   └── admin-query.ts     openapi-react-query hooks bound to admin-client
│   └── ...
└── proxy.ts                   admin network restriction
```

## Container / presenter pattern

- **Containers** (`page.tsx`, or a `*Container.tsx` client component for admin pages) fetch data,
  hold state, and pass callbacks.
- **Presenters** (`src/components/**`) are pure UI driven by typed props. They never import an API
  client.
- Prop types derive from the generated schema, e.g.
  `type Project = components['schemas']['ProjectResponseDto']`.

## API clients

- Public pages: `import { publicApi } from '@/lib/api/public-client'` — `import 'server-only'`
  guards it from client bundles. A failed call returns `undefined` data; pages call `notFound()` or
  render an empty state.
- Admin pages: `import { $api } from '@/lib/api/admin-query'` and use
  `$api.useQuery('get', '/api/admin/projects')` / `$api.useMutation(...)`.
- Never use `fetch` with hand-written URLs for the API; go through the typed clients.

## Regenerating types

```bash
cd server && yarn openapi:export     # writes server/openapi.json
cd frontend && yarn openapi:generate # writes src/lib/api/schema.d.ts
```

## Environment

See `frontend/.env.example`:

- `API_URL` — server-side base URL of the API (e.g. `http://localhost:4000`).
- `PORTFOLIO_API_TOKEN` — read-only token for public pages (server only).
- `NEXT_PUBLIC_API_URL` — browser base URL of the API for the admin portal.
- `ADMIN_ALLOWED_IPS` — optional allow-list for `/admin` (see [Security.md](Security.md)).
