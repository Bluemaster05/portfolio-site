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
│   │   ├── types.ts           friendly aliases for schema types (Project, SiteSettings, …)
│   │   ├── public-client.ts   server-only client using PORTFOLIO_API_TOKEN
│   │   ├── public-data.ts     cached ('use cache') readers used by public pages
│   │   ├── admin-client.ts    browser client: cookies, CSRF header, refresh-on-401
│   │   └── admin-query.ts     openapi-react-query hooks bound to admin-client
│   ├── admin/
│   │   └── resources/         one definition per content type (fields + typed API calls)
│   └── ...
└── proxy.ts                   admin network restriction
```

## Public data and caching

Public pages read through `lib/api/public-data.ts`. Each reader is a `'use cache'` function with
`cacheLife('minutes')` and the `portfolio` tag, so pages are prerendered and then revalidated in the
background — admin edits appear on the public site within a few minutes. Failed requests resolve to
`undefined` / `[]`, so a build or request with the API down renders empty states instead of failing.

This Next.js version runs with Cache Components: anything that reads request data (`params`,
`usePathname`, …) must sit inside `<Suspense>`. Dynamic `[slug]` pages await `params` inside a
Suspense boundary; don't add `generateStaticParams` unless it can always return at least one entry.

## Admin content editors

Projects, experience, education, honors, and blog share one list page and one editor
(`app/admin/(portal)/[resource]/`). Each content type is described by a `ContentResource` in
`lib/admin/resources/` — its form fields, conversion between API items and form values, and typed
`adminClient` calls. To add a field: add it on the server, regenerate types, then add it to the
resource's `fields`, `toValues`, and `toBody` (TypeScript flags any mismatch with the DTO).

Optional text fields are cleared by sending `''`; the server turns that into `null`.

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
