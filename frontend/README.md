# Portfolio Site (`/frontend`)

Next.js app with the server-rendered public site and the `/admin` portal. See
[../docs/Frontend.md](../docs/Frontend.md) for structure and conventions, and
[../docs/GettingStarted.md](../docs/GettingStarted.md) for setup.

```bash
cp .env.example .env.local
yarn install
yarn dev               # http://localhost:3000 and http://localhost:3000/admin
```

After the API changes run `yarn openapi:generate` (reads `../server/openapi.json`).
