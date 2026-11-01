# Project Overview

A self-hosted, content-managed developer portfolio. A visitor sees a fast, server-rendered,
readable site. The owner manages everything on it from an admin portal that is not reachable from
the public site.

## Goals

1. **Readability first.** Modern and calm, with light, purposeful motion. See
   [DesignGuidelines.md](DesignGuidelines.md).
2. **SEO friendly.** Public pages are rendered on the server from API data, so crawlers get full HTML.
3. **Reusable by anyone.** Nothing personal lives in `main`. All content is data in the database.
4. **Everything optional.** Each public section can be switched off in the admin portal.
5. **Rich content.** Text fields are TipTap documents, extended with custom blocks such as tabbed,
   syntax-highlighted code. See [RichContent.md](RichContent.md).

## Public sections

| Section          | Route              | Notes                                                  |
| ---------------- | ------------------ | ------------------------------------------------------ |
| Home             | `/`                | Profile intro, featured projects, links                |
| Projects         | `/projects`        | List (filterable by technology, `?tech=<slug>`) + detail page (`/projects/[slug]`) |
| Experience       | `/experience`      | Timeline of roles                                      |
| Education        | `/education`       | Schools, degrees, coursework                           |
| Blog             | `/blog`            | List + post page (`/blog/[slug]`); off by default      |
| Honors / Awards  | `/honors`          | Awards, scholarships, certifications                   |

Every section has an on/off switch in **Site settings**. A disabled section is removed from the
navigation, its pages return 404, and its public API endpoints return 404. If Home is disabled, `/`
redirects to the first enabled section.

## Admin portal

Lives under `/admin` in the frontend and `/api/admin/*` + `/api/auth/*` in the server.

- Sign in with email + password (argon2 hashed, JWT in httpOnly cookies, CSRF protected).
- Edit site settings, profile, and section toggles.
- Create / edit / reorder / publish items in each section.
- Manage **technologies** (name, icon, link, order). Projects pick from this list; they show as
  icon pins and power the technology filter on the Projects page.
- Create and revoke the **read-only API tokens** the public site uses.

In production the admin portal is meant to be reachable only from a trusted network. See
[Security.md](Security.md#admin-network-restriction).

## Branching model

| Branch         | Purpose                                                                         |
| -------------- | ------------------------------------------------------------------------------- |
| `main`         | The generic template. No personal content, names, images, or branding.         |
| `<your-name>`  | A personal branch (e.g. `logan`). Personal tweaks: theme, assets, seed data.    |

Rules of thumb:

- Features and fixes go to `main` first, then get merged **into** personal branches.
- Personal branches should keep their changes small (theme tokens, `public/` assets, a personal
  seeder) so merging from `main` stays painless.
- Never merge a personal branch back into `main`.

Most personalization should not need code at all: it is content in the database.
