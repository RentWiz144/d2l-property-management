# ChoZen Postiz — Self-Hosted Setup

Everything here is pre-configured. Your JWT secret is already generated and baked into
`docker-compose.yml` — treat this folder as private.

## What you need first

1. A server: Hetzner CX22 (~$4.50/mo) or DigitalOcean droplet (~$6/mo), **Ubuntu 24.04**.
   Note its IP address.
2. A DNS A record: `postiz.yourdomain.com` → that IP.
   (Wait ~5 min after creating it before installing.)

## Install (one command)

SSH into the server, then:

```bash
ssh root@YOUR_SERVER_IP

# copy this folder up first, or clone the repo, then:
cd postiz-setup
bash install.sh postiz.yourdomain.com
```

That installs Docker, writes the config, sets up Caddy for automatic HTTPS,
and starts Postiz. Takes ~5 minutes. When it prints SUCCESS, open
`https://postiz.yourdomain.com` and create your admin account.

## Alternative: paste-in method (no file copying)

If it's easier, on the server run:

```bash
mkdir -p /opt/postiz && cd /opt/postiz
nano docker-compose.yml     # paste contents of docker-compose.yml, edit the domain
curl -fsSL https://get.docker.com | sh
docker compose up -d
```

Then install Caddy and use the `Caddyfile` here for HTTPS.

## Useful commands

```bash
cd /opt/postiz
docker compose logs -f                         # watch logs / debug
docker compose restart                         # restart
docker compose pull && docker compose up -d    # update Postiz
```

## After it's running

1. In Postiz: Settings → generate a **Public API key**.
2. Add Postiz as a custom connector in claude.ai → Settings → Connectors.
3. Tell Claude: **"check my posting engine"** — the `chozen-social-command` skill
   will find it and take over scheduling.

## Heads-up on connecting social accounts

Self-hosted Postiz needs your own developer app per platform (Meta for FB/IG/Threads,
TikTok, Google for YouTube). Meta and TikTok require app review, which can take days.
Postiz's docs have a "Providers" page with per-platform steps. This is the slow part —
not the server.

## Verify against upstream

Postiz's compose file occasionally changes. If the install errors on an unknown
environment variable or image tag, compare against the current file at
docs.postiz.com → Installation → Docker Compose, and paste any error here for help.
