# Original Project Prompt

This is the brief the project was started from (lightly cleaned up for spelling). It records the
intent behind the design. Where later docs disagree, the later docs reflect decisions made since.

---

I want to create a portfolio site app using a similar stack to the SeniorProject / Stepladder app I'm
working on.

The site will use **Next.js** and **NestJS**. The app will grab data from the API for information
that may change like experience, projects, etc. This will come via an **API token** to the API that
only has **read access to select resources** to make the public portfolio. This will help SEO since
this can be SSR.

The site will also have an **admin portal** to be able to manage the data that goes on the site. We
will make it so that when it's live the outward pages will have no way to get to the admin login or
views — probably via some middleware in the prod environment making it so only local users on the
network can access the login pages. (Not a focus yet.)

I want to make this so that anyone in theory could use this, so the **`main` branch will not be
unique to me**. The **`logan` branch will be unique to me**. This way we can leave the main pages
mostly empty and the content can be made unique to the individual.

Main pages I want to have on this site:

- Home
- Projects
- Experience
- Education
- Blog (toggleable)
- Honors / Awards

At the admin level **each of these should be toggleable** in case someone doesn't want them.

Most places you can provide text should support **rich text editing via TipTap**. I want to add more
types of item as well as the base ones. For example, a **code view** where you can add various code
snippets and click on tabs to view them, featuring code colors (syntax highlighting).

While many portfolios try to look very visually impressive, I find them hard to read. While I want
this app to look modern and pretty, I don't want this to come at the cost of readability. This app
should look modern and have some stylistic animation, but **the focus is readability**. Nothing
should look too flashy.

Do a **monorepo** approach with `/frontend` for the Next.js app, `/server` for the NestJS app, and
`/docs` for the documents in the repo.

Backend:

- MikroORM for the database ORM
- argon2, cookie-parser, csrf-csrf, helmet, passport, passport-jwt, swagger-ui-express
- Good OpenAPI docs via Swagger — the frontend uses them for types

Frontend:

- TipTap for the rich text editing base
- openapi-fetch, openapi-react-query, openapi-typescript for a typed API client

General:

- Include this prompt in `/docs`.
- The README should describe the project generically (it is not unique to one person).
- `CLAUDE.md` holds what an agent should always know, linking to `/docs` for the rest.
- **yarn** is the package manager.
- Separate work into relevant commits.
