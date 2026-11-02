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

The examples use Ubuntu, `example.com`, a VPN subnet of `10.8.0.0/24`, `10.8.0.1` as the server's
address on the VPN, and `/opt/portfolio-site` for the code. Substitute your own.

## Where things run

Everything runs **on the server**; your own computer only pushes code to the git remote. On the
server, two kinds of commands appear below:

- **admin** — your normal login with `sudo`: installing software, systemd, firewall, Docker.
- **as portfolio** — prefixed with `sudo -u portfolio -H`: anything touching the code, `.env`
  files, or builds. A dedicated `portfolio` user owns the site and runs the services, so a bug in
  the site can't touch the rest of the machine.

## 1. Install software (admin)

**Docker** (from Docker's own repository; on Debian replace `ubuntu` with `debian` in both URLs):

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker run --rm hello-world
```

**Node.js and Yarn** (Node 22 or newer):

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g yarn
node -v && yarn -v
```

**cloudflared**:

```bash
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg > /dev/null
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' \
  | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt-get update && sudo apt-get install -y cloudflared
```

Also set up your VPN (WireGuard, Tailscale, …) and note the server's VPN address and the subnet
clients get (Tailscale: `100.64.0.0/10`).

## 2. Create the site user and get the code (admin)

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin portfolio
sudo git clone <your repo URL> /opt/portfolio-site
sudo chown -R portfolio:portfolio /opt/portfolio-site
```

If you keep personal styling on a branch, check it out:
`sudo -u portfolio -H git -C /opt/portfolio-site checkout <branch>`. For a private repository,
clone over HTTPS with a token or give the `portfolio` user a read-only deploy key, so later
`git pull`s work as that user.

## 3. API settings and database

Generate three secrets (JWT, CSRF, database password) — run this three times:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Create `server/.env` as portfolio and keep it private:

```bash
cd /opt/portfolio-site/server
sudo -u portfolio -H cp .env.example .env
sudo -u portfolio -H chmod 600 .env
sudo -u portfolio -H nano .env
```

Change these (and leave `SEED_API_TOKEN` unset):

```ini
NODE_ENV=production
DB_PASSWORD=<db secret>
POSTGRES_PASSWORD=<same db secret>
JWT_SECRET=<secret>
CSRF_SECRET=<another secret>
CORS_ORIGIN=http://10.8.0.1:3000
ADMIN_ALLOWED_IPS=10.8.0.0/24
# The admin is plain HTTP inside the VPN; browsers drop Secure cookies over HTTP
COOKIE_SECURE=false
ADMIN_EMAIL=<you>
ADMIN_PASSWORD=<strong password>
```

Start PostgreSQL (admin — Docker needs root; it reads the `.env` you just wrote). It listens on
`127.0.0.1:5433` only and restarts with the machine:

```bash
cd /opt/portfolio-site/server && sudo docker compose up -d
```

Build the API, create the tables, and seed the admin account and default settings (as portfolio):

```bash
cd /opt/portfolio-site/server
sudo -u portfolio -H yarn install
sudo -u portfolio -H yarn build
sudo -u portfolio -H yarn migration:up
sudo -u portfolio -H yarn db:seed
```

## 4. Frontend settings and build (as portfolio)

```bash
cd /opt/portfolio-site/frontend
sudo -u portfolio -H nano .env.production
```

```ini
API_URL=http://127.0.0.1:4000
NEXT_PUBLIC_API_URL=http://10.8.0.1:4000
ADMIN_ALLOWED_IPS=10.8.0.0/24
TRUSTED_CLIENT_IP_HEADER=cf-connecting-ip
# Filled in at step 8
PORTFOLIO_API_TOKEN=
```

`NEXT_PUBLIC_API_URL` is compiled into the browser bundle, so set it **before** building and
rebuild after changing it. Only the admin portal uses it.

`TRUSTED_CLIENT_IP_HEADER` matters: every request through the tunnel arrives from `127.0.0.1`
with an `X-Forwarded-For` the visitor can fake, but Cloudflare always overwrites
`CF-Connecting-IP`. Requests over the VPN don't carry it and are checked by their own address.

```bash
sudo -u portfolio -H chmod 600 .env.production
sudo -u portfolio -H yarn install
sudo -u portfolio -H yarn build
```

## 5. Services (admin)

Two systemd services run the API and the website as `portfolio` and restart them on crashes and
reboots. Check the `node` path with `which node` (NodeSource installs `/usr/bin/node`).

`sudo nano /etc/systemd/system/portfolio-api.service`:

```ini
[Unit]
Description=Portfolio API
After=network-online.target docker.service
Wants=network-online.target

[Service]
User=portfolio
WorkingDirectory=/opt/portfolio-site/server
ExecStart=/usr/bin/node dist/main
Restart=always

[Install]
WantedBy=multi-user.target
```

`sudo nano /etc/systemd/system/portfolio-web.service`:

```ini
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
sudo systemctl daemon-reload
sudo systemctl enable --now portfolio-api portfolio-web
systemctl status portfolio-api portfolio-web
journalctl -u portfolio-api -f      # logs; Ctrl+C to stop following
```

## 6. Firewall (admin)

Only the VPN may reach ports 3000 and 4000; cloudflared connects over localhost, which `ufw`
doesn't filter. Allow SSH first so you don't lock yourself out, plus your VPN's port if it needs
one (WireGuard: `51820/udp`; Tailscale: none).

```bash
sudo ufw allow OpenSSH
sudo ufw default deny incoming
sudo ufw allow from 10.8.0.0/24 to any port 3000,4000 proto tcp
sudo ufw enable
```

## 7. Cloudflare Tunnel (admin)

```bash
cloudflared tunnel login
cloudflared tunnel create portfolio
sudo mkdir -p /etc/cloudflared && sudo mv ~/.cloudflared/*.json /etc/cloudflared/
sudo nano /etc/cloudflared/config.yml
```

The tunnel only forwards the public site; `/admin` and `/api` stop at Cloudflare:

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

Delete any existing `A` record for the domain in Cloudflare's DNS first, then:

```bash
cloudflared tunnel route dns portfolio example.com
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

## 8. First sign-in

Connected to the VPN, open `http://10.8.0.1:3000/admin` and sign in with `ADMIN_EMAIL` /
`ADMIN_PASSWORD`. Create a read-only API token, put it in `frontend/.env.production` as
`PORTFOLIO_API_TOKEN`, then `sudo systemctl restart portfolio-web`.

## Check it

- `https://example.com` shows the site; `https://example.com/admin` is a 404.
- Off the VPN, `http://10.8.0.1:3000` doesn't answer at all.
- On the VPN, the admin signs in and uploads work.

## Updating

```bash
cd /opt/portfolio-site
sudo -u portfolio -H git pull
cd server && sudo -u portfolio -H yarn install && sudo -u portfolio -H yarn build && sudo -u portfolio -H yarn migration:up
cd ../frontend && sudo -u portfolio -H yarn install && sudo -u portfolio -H yarn build
sudo systemctl restart portfolio-api portfolio-web
```

## Backups

Back up the database together with `server/uploads/` — content refers to uploaded files by key:

```bash
sudo docker compose -f /opt/portfolio-site/server/docker-compose.yml exec -T postgres \
  pg_dump -U portfolio portfolio > portfolio-$(date +%F).sql
sudo tar czf uploads-$(date +%F).tgz -C /opt/portfolio-site/server uploads
```
