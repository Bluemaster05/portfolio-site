# Backend (`/server`)

NestJS + MikroORM (PostgreSQL). Serves the admin CRUD API, the read-only public API, and OpenAPI
docs.

## Module layout

```
server/src/
├── main.ts                 bootstrap (helmet, cookies, CSRF, CORS, validation, Swagger)
├── app.module.ts
├── mikro-orm.config.ts     shared by the app and the MikroORM CLI
├── openapi.ts              Swagger document builder (used by main.ts and openapi:export)
├── common/                 decorators, guards, DTO helpers, shared types
├── auth/                   login / refresh / logout / csrf, JWT strategy, refresh tokens
├── users/                  admin user entity + service
├── api-tokens/             read-only API tokens for the public site (admin CRUD + guard)
├── site/                   SiteSettings singleton: site meta, profile, section toggles
├── projects/               ┐
├── experience/             │ content modules: entity, DTOs, AdminController (/api/admin/...),
├── education/              │ PublicController (/api/public/...), service
├── honors/                 │
├── blog/                   ┘
├── media/                  image/video uploads: POST /api/admin/media, GET /api/media/:key (see Uploads.md)
├── migrations/             MikroORM migrations
└── seeders/                MikroORM seeders (admin user, default settings, dev API token)
```

Each content module follows the same pattern:

- `entities/<name>.entity.ts` — MikroORM entity (decorators from `@mikro-orm/decorators/legacy`).
- `dto/` — `Create<Name>Dto`, `Update<Name>Dto` (`PartialType`), `<Name>ResponseDto`.
- `<name>.service.ts` — data access via `EntityManager`.
- `<name>.admin.controller.ts` — `/api/admin/<name>`; JWT protected (global guard).
- `<name>.public.controller.ts` — `/api/public/<name>`; `@ApiTokenAuth('<name>:read')`, published
  items only, 404 when the section is disabled.

## Conventions

- **OpenAPI is the contract.** Every controller method has `@ApiOperation` and response decorators
  with a DTO type; every DTO property is documented (the Nest Swagger CLI plugin infers most of it
  from types + class-validator, add `@ApiProperty` where inference is not enough). Use stable
  `operationId`s (the default `Controller_method`) — the frontend relies on generated types.
- Return **response DTOs**, never raw entities with secrets (password hashes, token hashes).
- Validate input with `class-validator`. Rich text fields use `@IsRichTextDoc()`, dates use
  `@IsPartialDate()` (`YYYY`, `YYYY-MM`, `YYYY-MM-DD`), links use `@IsSafeUrl()`, image fields use `@IsImageSource()` (`/media/…` or http(s)) or
  `ImageDto[]` for lists with alt text.
- Optional nullable text fields take `@IsOptional() @EmptyToNull()` so clients clear them by
  sending `''`. Don't use it on non-null columns (e.g. `summary`, which defaults to `''`).
- DTO instances declare every field, so absent fields are `undefined`: apply updates with
  `definedOnly(dto)` (as `ContentService` does), never by assigning the DTO directly.
- Content items have `published: boolean` and `sortOrder: number`. Public endpoints filter on
  `published` and order by `sortOrder`, then date.
- After changing controllers/DTOs: `yarn openapi:export` and commit `server/openapi.json`, then
  regenerate the frontend types.

## Database rules

- **Never** write ad-hoc scripts that connect to PostgreSQL and run manual SQL.
- Schema changes: edit entities → `yarn migration:create` → review the generated file →
  `yarn migration:up`.
- Seed data: MikroORM seeders in `src/seeders/` (`yarn db:seed`, `yarn db:fresh`).
- Seeders in `main` must stay generic. Personal content belongs in the database or a personal
  branch's seeder.

## Scripts

| Script                 | What it does                                                |
| ---------------------- | ----------------------------------------------------------- |
| `yarn start:dev`       | Watch mode on port 4000                                     |
| `yarn build`           | Compile to `dist/`                                          |
| `yarn openapi:export`  | Write `openapi.json` without starting the server or DB      |
| `yarn migration:create`| Generate a migration from entity changes                    |
| `yarn migration:up`    | Apply pending migrations                                    |
| `yarn db:seed`         | Run `DatabaseSeeder`                                        |
| `yarn db:fresh`        | Drop + recreate schema and seed (development only)          |
| `yarn test`            | Unit tests (vitest)                                         |

## Environment

See `server/.env.example`. Key variables: `DB_*`, `JWT_SECRET`, `CSRF_SECRET`, `CORS_ORIGIN`,
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SEED_API_TOKEN`, `UPLOAD_DIR`, `MAX_UPLOAD_MB`,
`MAX_VIDEO_UPLOAD_MB`.
