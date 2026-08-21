#!/usr/bin/env bash
# Bootstrap OVH VPS (Ubuntu) for FMMT — run once as root or with sudo.
# Usage: sudo bash deploy/ovh/setup-vps.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/fmmt}"
DOMAIN="${DOMAIN:-fmmt.events}"

echo "==> Updating system"
apt-get update -y
apt-get upgrade -y

echo "==> Installing Docker"
if ! command -v docker >/dev/null 2>&1; then
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

echo "==> Installing Nginx + Certbot"
apt-get install -y nginx certbot python3-certbot-nginx ufw fail2ban

echo "==> Firewall (22/80/443)"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> App directory ${APP_DIR}"
mkdir -p "${APP_DIR}"
mkdir -p /var/www/certbot

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "${SCRIPT_DIR}/nginx-fmmt.events.conf" ]]; then
  cp "${SCRIPT_DIR}/nginx-fmmt.events.conf" "/etc/nginx/sites-available/${DOMAIN}"
  ln -sfn "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
fi

# Allow deploy user to run docker without root
if id ubuntu &>/dev/null; then
  usermod -aG docker ubuntu
  chown -R ubuntu:ubuntu "${APP_DIR}"
fi

echo ""
echo "OK — next steps:"
echo "  1. Point DNS A ${DOMAIN} (+ www) → this server IP"
echo "  2. Copy app into ${APP_DIR} (rsync/git)"
echo "  3. Create ${APP_DIR}/.env from .env.example (strong secrets)"
echo "  4. cd ${APP_DIR} && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build"
echo "  5. sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "  6. Re-login as ubuntu so docker group applies"
