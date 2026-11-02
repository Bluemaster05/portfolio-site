# Deployment

One way to self-host on a Linux machine: the public site reaches the internet through a
**Cloudflare Tunnel**, while the admin portal and the API are reachable **only over a VPN**. Nothing
listens on a public port, the internet has no route to `/admin` or the API, and admin uploads go
straight to the API (no proxy body-size limit).

```
internet ──▶ Cloudflare ──tunnel──▶ cloudflared ──▶ Next.js :3000   (public pages, /media)
                                                       │
VPN client ──────────────────────────────────────────▶ ├─ Next.js :3000/admin
            └────────────────────────────────────────▶ └─ API :4000  (sign-in, admin, uploads)
                                                          API ──▶ PostgreSQL (localhost only)
```

The examples use `example.com`, a VPN subnet of `10.8.0.0/24`, and `10.8.0.1` as the server's
address on the VPN. Substitute your own.

## 1. Prerequisites

- Node.js 22+, Yarn 1 (`corepack enable`), Docker (or PostgreSQL 15+)
- A VPN into the server — WireGuard, Tailscale, or similar. Note the server's VPN address and the
  subnet clients get (Tailscale: `100.64.0.0/10`).
- A Cloudflare account with the domain's DNS on Cloudflare

## 2. Database

Keep PostgreSQL on localhost — Docker publishes ports past `ufw`, so `docker-compose.yml` binds
`127.0.0.1:5433`.

```bash
cd server && cp .env.example .env && docker compose up -d
```

## 3. API

`server/.env`, in addition to the database settings:

```ini
NODE_ENV=production
JWT_SECRET=<long random string>
CSRF_SECRET=<another one>
CORS_ORIGIN=http://10.8.0.1:3000
ADMIN_ALLOWED_IPS=10.8.0.0/24
# The admin is plain HTTP inside the VPN; browsers drop Secure cookies over HTTP
COOKIE_SECURE=false
ADMIN_EMAIL=<you>
ADMIN_PASSWORD=<strong password>
# Leave SEED_API_TOKEN unset in production
```

```bash
yarn install && yarn build && yarn migration:up && yarn db:seed
```

## 4. Frontend

`frontend/.env.production`. `NEXT_PUBLIC_API_URL` is compiled into the browser bundle, so set it
**before** building and rebuild after changing it. Only the admin portal uses it.

```ini
API_URL=http://127.0.0.1:4000
NEXT_PUBLIC_API_URL=http://10.8.0.1:4000
ADMIN_ALLOWED_IPS=10.8.0.0/24
TRUSTED_CLIENT_IP_HEADER=cf-connecting-ip
PORTFOLIO_API_TOKEN=<created in step 7>
```

`TRUSTED_CLIENT_IP_HEADER` matters: every request through the tunnel arrives from `127.0.0.1`
with an `X-Forwarded-For` the visitor can fake, but Cloudflare always overwrites
`CF-Connecting-IP`. Requests over the VPN don't carry it and are checked by their own address.

```bash
yarn install && yarn build
```

## 5. Services

Run both as systemd services (adjust the user, paths, and `node` location — `which node`):

```ini
# /etc/systemd/system/portfolio-api.service
[Unit]
Description=Portfolio API
After=network-online.target docker.service

[Service]
User=portfolio
WorkingDirectory=/opt/portfolio-site/server
ExecStart=/usr/bin/node dist/main
Restart=always

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/portfolio-web.service
[Unit]
Description=Portfolio website
After=portfolio-api.service

[Service]
User=portfolio
WorkingDirectory=/opt/portfolio-site/frontend
ExecStart=/usr/bin/node node_modules/.bin/next start -p 3000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now portfolio-api portfolio-web
```

## 6. Firewall

Only the VPN may reach ports 3000 and 4000; cloudflared connects over localhost, which `ufw`
doesn't filter. Nothing else needs to be open (plus SSH and your VPN's port, e.g. WireGuard's
`51820/udp`).

```bash
sudo ufw default deny incoming
sudo ufw allow from 10.8.0.0/24 to any port 3000,4000 proto tcp
sudo ufw enable
```

## 7. Cloudflare Tunnel

```bash
cloudflared tunnel login
cloudflared tunnel create portfolio
sudo mkdir -p /etc/cloudflared && sudo mv ~/.cloudflared/*.json /etc/cloudflared/
```

`/etc/cloudflared/config.yml` — the tunnel only forwards the public site; `/admin` and `/api` stop
at Cloudflare:

```yaml
tunnel: <tunnel UUID>
credentials-file: /etc/cloudflared/<tunnel UUID>.json

ingress:
  - hostname: example.com
    path: ^/(admin|api)(/|$)
    service: http_status:404
  - hostname: example.com
    service: http://127.0.0.1:3000
  - service: http_status:404
```

```bash
cloudflared tunnel route dns portfolio example.com
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

Then, connected to the VPN, open `http://10.8.0.1:3000/admin`, sign in, create a read-only API
token, put it in `PORTFOLIO_API_TOKEN`, and restart `portfolio-web`.

## Check it

- `https://example.com` shows the site; `https://example.com/admin` is a 404.
- Off the VPN, `http://10.8.0.1:3000` doesn't answer at all.
- On the VPN, the admin signs in and uploads work.

## Updating and backups

```bash
git pull
cd server && yarn install && yarn build && yarn migration:up
cd ../frontend && yarn install && yarn build
sudo systemctl restart portfolio-api portfolio-web
```

Back up the database (`pg_dump`) together with `server/uploads/` — content refers to uploaded
files by key.
