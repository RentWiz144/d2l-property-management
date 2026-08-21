#!/usr/bin/env bash
# ChoZen Postiz installer — run as root on a fresh Ubuntu 24.04 server.
# Usage:  bash install.sh postiz.yourdomain.com
set -euo pipefail

DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then
  echo "ERROR: pass your subdomain, e.g.:  bash install.sh postiz.chozenunlimited.com"
  exit 1
fi
echo "==> Installing Postiz for https://$DOMAIN"

echo "==> [1/5] Installing Docker..."
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

echo "==> [2/5] Writing config to /opt/postiz..."
mkdir -p /opt/postiz
cp docker-compose.yml /opt/postiz/docker-compose.yml
sed -i "s/postiz\.YOURDOMAIN\.com/$DOMAIN/g" /opt/postiz/docker-compose.yml

echo "==> [3/5] Installing Caddy for automatic HTTPS..."
if ! command -v caddy >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https curl gnupg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  apt-get update -qq
  apt-get install -y -qq caddy
fi
printf '%s {\n    reverse_proxy localhost:5000\n}\n' "$DOMAIN" > /etc/caddy/Caddyfile
systemctl restart caddy

echo "==> [4/5] Starting Postiz (first run pulls images, ~2-4 min)..."
cd /opt/postiz
docker compose up -d

echo "==> [5/5] Waiting for Postiz to come up..."
for i in $(seq 1 60); do
  if curl -sf http://localhost:5000 >/dev/null 2>&1; then
    echo ""
    echo "SUCCESS. Open https://$DOMAIN in your browser and create your admin account."
    exit 0
  fi
  sleep 5
done
echo "Postiz is still starting. Check progress with:  docker compose -f /opt/postiz/docker-compose.yml logs -f"
