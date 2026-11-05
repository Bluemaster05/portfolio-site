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
│   ├── layout.tsx             root html/body, fonts, inline theme script
│   └── globals.css            design tokens + base styles + prose styles
├── components/
│   ├── public/                presentational components for the public site
│   ├── admin/                 presentational components for the admin portal
│   ├── rich-text/             TipTap editor, custom extensions, server renderer
│   ├── ScrollingTabRow.tsx    tab row that scrolls sideways with ‹ › buttons (topics, editor tabs)
│   └── ThemeToggle.tsx        light/dark switch (public header + admin sidebar)
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
│   ├── theme.ts               stored light/dark choice + the pre-paint THEME_SCRIPT
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

## Admin pages

The admin renders in the browser after sign-in: the `(portal)` layout shows only "Loading…" until
the session check finishes. Next's instant-navigation validation therefore can't render admin pages
and reports them as dropped segments. So every admin `page.tsx` is a small server component that
sets `export const instant = false` and renders the real client page from a sibling file (e.g.
`employers/EmployersPage.tsx`); `instant` can't be exported from a client component. Follow the
same shape for new admin pages.

## Admin content editors

Projects, experience, education, honors, and blog share one list page and one editor
(`app/admin/(portal)/[resource]/`). Each content type is described by a `ContentResource` in
`lib/admin/resources/` — its form fields, conversion between API items and form values, and typed
`adminClient` calls. To add a field: add it on the server, regenerate types, then add it to the
resource's `fields`, `toValues`, and `toBody` (TypeScript flags any mismatch with the DTO).

Long editors can be split into tabs by giving fields a `tab` label (projects use Details,
Technologies, Images & videos, Write-up). Tabs show in the order their first field is listed;
fields without a `tab` form one more group below the tabs. Checkboxes (e.g. Featured/Published,
on the project Details tab) come after a tab's other fields.

When editing, each group is its own form. Save and Cancel appear (stuck to the bottom of the
window) only once that group differs from what was last saved, and a dot marks tabs with unsaved
changes. Saving a group sends the last-saved values plus that group's edits, so edits on other tabs
stay pending for their own Save; Cancel puts the group back to its last-saved values. Edits survive
switching tabs because the form keeps one set of values and every panel stays mounted.

When creating, the tabs are one form with a single Create button. If a required or malformed field
on a hidden tab blocks it, the editor switches to that tab so the browser can point at it.

Optional text fields are cleared by sending `''`; the server turns that into `null`.

Write-up fields use `kind: 'writeup'`: one rich text document that can be split into titled topics,
shown as tabs on the public page (see [RichContent.md](RichContent.md#write-up-topics)).

Experience entries are **jobs**: each belongs to an **employer** (managed at `/admin/employers`:
name, website, optional logo, order; an employer with jobs can't be deleted) and is picked in the job editor
with `kind: 'employer'` (`EmployerSelect`, with inline "New…"). A job has free-text skills,
technologies, a short description and a longer write-up, and its own page at `/experience/[slug]`
(slug generated from role + employer when left empty).

Education entries and honors work the same way without employers: a short description on the card,
a write-up on their own page at `/education/[slug]` or `/honors/[slug]` (slug from degree +
institution, or title + issuer, when left empty), and Details / Description / Write-up tabs in the
editor. Card titles link to those pages with a "Read more" tooltip.

Projects can be featured on the home page in any number (a checkbox on their Details tab). Jobs,
education entries and honors allow one each, or none: their admin lists have a Feature / Unfeature
button and an "On home page" badge (a resource's `featuring` option). Featuring one unfeatures the
previous one server-side (`common/utils/feature-only.ts`); unfeaturing leaves none. The public list
endpoints take `?featured=true`. Server-side, both use `uniqueSlug()` from
`common/utils/unique-slug.ts`.

Employer order lives in one place, `EmployersService.ordered()`: manual order, then an employer with
a current job, then the most recently active (drafts count). The public page, the Employers page and
the admin Experience list all use it, so they always agree. A resource can set `grouping` (as
experience does with employers): the admin list then shows items under their groups
(`GroupedContentList`), groups move with their own arrows, and items move only within their group.

Technologies are managed on their own page (`/admin/technologies`) and picked in the project and job editors
with `kind: 'technologies'` (`TechnologyPicker`: ordered, searchable, quick-create). Shared lists a
field needs are passed to `ContentForm` as `lookups` by the container. On the public site
`TechPill` / `TechList` render technology pins with icons, and the Projects page filters by
`?tech=<slug>` in a client `ProjectsBrowser` (inside `<Suspense>`, with the unfiltered list as the
static fallback).

Image and media fields (`kind: 'image'` / `'media'`) upload by default with a URL toggle; presenters get an
`onUpload` prop and containers pass `uploadMedia` from `lib/admin/media.ts`. Uploaded images are
served at `/media/<key>` through a rewrite in `next.config.ts`. See [Uploads.md](Uploads.md).

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
- `TRUSTED_CLIENT_IP_HEADER` — header a proxy in front always sets to the real client IP, e.g.
  `cf-connecting-ip`; used by the `/admin` check.
