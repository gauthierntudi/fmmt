#!/usr/bin/env bash
# Deploy / update FMMT on the VPS from your Mac.
# Usage (from fmmt-next/):
#   ./deploy/ovh/deploy.sh
#
# Optional env:
#   VPS_HOST=ubuntu@51.255.36.135
#   REMOTE_DIR=/opt/fmmt
#   SSH_KEY=~/.ssh/id_ed25519
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VPS_HOST="${VPS_HOST:-ubuntu@51.255.36.135}"
REMOTE_DIR="${REMOTE_DIR:-/opt/fmmt}"
SSH_OPTS=()
if [[ -n "${SSH_KEY:-}" ]]; then
  SSH_OPTS+=(-i "$SSH_KEY")
fi

echo "==> Sync ${ROOT} → ${VPS_HOST}:${REMOTE_DIR}"
rsync -az --delete \
  "${SSH_OPTS[@]}" \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude 'coverage' \
  --exclude '*.log' \
  "${ROOT}/" "${VPS_HOST}:${REMOTE_DIR}/"

echo "==> Build & restart on VPS"
ssh "${SSH_OPTS[@]}" "${VPS_HOST}" "cd '${REMOTE_DIR}' && \
  if [[ ! -f .env ]]; then echo 'MISSING ${REMOTE_DIR}/.env — create it first'; exit 1; fi && \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build"

echo "OK — check https://fmmt.events (or http://${VPS_HOST#*@} until DNS/SSL ready)"
