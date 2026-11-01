# Portfolio API (`/server`)

NestJS + MikroORM (PostgreSQL) API for the portfolio site. See [../docs/Backend.md](../docs/Backend.md)
for structure and conventions, and [../docs/GettingStarted.md](../docs/GettingStarted.md) for setup.

```bash
cp .env.example .env
docker compose up -d
yarn install
yarn migration:up
yarn db:seed
yarn start:dev        # http://localhost:4000/api/docs
```

After changing a controller or DTO run `yarn openapi:export` and commit `openapi.json`.
