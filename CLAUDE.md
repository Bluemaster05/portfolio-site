# CLAUDE.md

Self-hosted portfolio: Next.js public site + admin portal (`/frontend`), NestJS + MikroORM API
(`/server`), docs in `/docs`. Start with [docs/ProjectOverview.md](docs/ProjectOverview.md) and
[docs/Architecture.md](docs/Architecture.md).

## Always

- **Package manager is yarn** (v1). Never use npm/pnpm to add packages. `frontend/` and `server/`
  are separate yarn projects — run commands inside the right folder.
- **`main` is generic.** Never add personal names, content, images, or branding to `main`. Personal
  content lives in the database; personal styling lives on a personal branch (e.g. `logan`).
- **Readability over flash.** Follow [docs/DesignGuidelines.md](docs/DesignGuidelines.md): high
  contrast, prose ≤ 70ch, subtle motion that respects `prefers-reduced-motion`.
- **OpenAPI is the contract.** After changing any server controller or DTO, run
  `yarn openapi:export` in `server/` and `yarn openapi:generate` in `frontend/`, and commit both
  `server/openapi.json` and `frontend/src/lib/api/schema.d.ts`. Never hand-edit `schema.d.ts`.
- **Typed API access only.** Frontend calls go through `publicApi` (server components) or
  `$api` / `adminClient` (admin). No hand-written `fetch` to the API.
- **Rich text is TipTap JSON**, never stored HTML. New block types need an editor extension and a
  renderer case — see [docs/RichContent.md](docs/RichContent.md).
- **Section toggles.** Any new public section must be toggleable in `SiteSettings` and its public
  endpoints must 404 when disabled.
- Separate work into focused commits.

## TypeScript

- Never use `as any`. Use proper types, type guards, or `unknown` + narrowing.
- Server is ESM: relative imports end in `.js`.

## Backend rules ([docs/Backend.md](docs/Backend.md))

- Every route is JWT-protected by the global guard unless marked `@Public()` or
  `@ApiTokenAuth(scope)`.
- Return response DTOs, never entities that hold secrets.
- Every endpoint has `@ApiOperation` + typed `@ApiOkResponse`/etc. so generated types are accurate.
- **Database:** never write ad-hoc SQL scripts. Schema changes via MikroORM migrations
  (`yarn migration:create` → review → `yarn migration:up`); seed data via seeders in
  `src/seeders/`.

## Frontend rules ([docs/Frontend.md](docs/Frontend.md))

- This Next.js version may differ from training data — check `frontend/node_modules/next/dist/docs/`
  before using unfamiliar APIs. Middleware lives in `src/proxy.ts`.
- Container / presenter: `page.tsx` (or a container component) fetches and owns state;
  components in `src/components/**` are pure and never import API clients.
- Public pages are server components reading through `lib/api/public-data.ts` (`'use cache'`);
  keep client JS to interactive leaves. Cache Components is on: request data (`params`,
  `usePathname`) must be read inside `<Suspense>`.
- Admin content editors are driven by `lib/admin/resources/*` definitions; new content fields go
  in the resource's `fields`, `toValues`, and `toBody`.
- `PORTFOLIO_API_TOKEN` is server-only. Never expose it via `NEXT_PUBLIC_*`.

## Security ([docs/Security.md](docs/Security.md))

argon2 passwords, JWT access + rotating refresh tokens in httpOnly cookies, csrf-csrf on non-GET,
helmet, scoped read-only API tokens (hashed at rest) for the public site, `/admin` gated by
`ADMIN_ALLOWED_IPS` in `src/proxy.ts`.

## Uploads ([docs/Uploads.md](docs/Uploads.md))

Images and videos are stored in content as URL strings: `/media/<key>` (upload) or http(s). New
fields: `@IsImageSource()` / `MediaItemDto[]` (ordered images + videos) on the server,
`MediaSourceField` / `MediaListField` (upload by default, URL toggle) in the admin,
`renderableMedia()` / `mainImage()` / `leadIndex()` / `isImageSrc()` before rendering, and always set
`alt`. Project media has a main image (cover on cards/home, never a video) and a main video (leads
the project page); videos use their own first frame and never autoplay.

## Common issues

- Type errors on API data or unknown URL strings in the frontend → the schema is stale; regenerate
  as described above.
- Public pages show empty states → check `PORTFOLIO_API_TOKEN` matches a token in the database and
  has the needed scopes, and that the section is enabled and items are published.
- `yarn openapi:export` runs `nest build`, which wipes `dist/` — a running `yarn start:dev` can stop
  picking up changes afterwards (new routes 404). Restart the dev server.
