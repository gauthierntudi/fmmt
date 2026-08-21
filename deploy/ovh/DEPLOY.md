# Déploiement VPS OVH — FMMT

## Serveur

| | |
|---|---|
| IPv4 | `51.255.36.135` |
| User | `ubuntu` |
| App dir | `/opt/fmmt` |
| Domaine | `fmmt.events` (+ `www`) |
| GitHub | https://github.com/gauthierntudi/fmmt |

```bash
ssh ubuntu@51.255.36.135
```

## Déploiement via GitHub Actions (recommandé)

1. Sur le VPS : Docker + Nginx (une fois) — `setup-vps.sh`
2. Sur le VPS : accès Git au repo (deploy key read-only ou clé machine)
3. Créer `/opt/fmmt/.env` (ne jamais le committer)
4. Dans le repo GitHub → **Settings → Secrets and variables → Actions** :

| Secret | Valeur |
|--------|--------|
| `VPS_HOST` | `51.255.36.135` |
| `VPS_USER` | `ubuntu` |
| `VPS_SSH_PRIVATE_KEY` | clé privée dont la publique est dans `~ubuntu/.ssh/authorized_keys` |
| `VPS_APP_DIR` | `/opt/fmmt` (optionnel) |

5. Push sur `main` (ou **Actions → Deploy VPS → Run workflow**)

Le workflow pull dans `/opt/fmmt` puis rebuild Docker Compose.

## 1. DNS

| Host | Type | Valeur |
|------|------|--------|
| `fmmt.events` | A | `51.255.36.135` |
| `www` | A | `51.255.36.135` |

## 2. Premier setup VPS

```bash
cd fmmt-next
scp -r deploy/ovh ubuntu@51.255.36.135:~/
ssh ubuntu@51.255.36.135
sudo bash ~/ovh/setup-vps.sh
```

## 3. Clone Git sur le VPS

```bash
ssh ubuntu@51.255.36.135
ssh -T git@github.com   # vérifier l'accès

sudo mkdir -p /opt/fmmt && sudo chown ubuntu:ubuntu /opt/fmmt
git clone git@github.com:gauthierntudi/fmmt.git /opt/fmmt

cp /opt/fmmt/deploy/ovh/env.production.example /opt/fmmt/.env
nano /opt/fmmt/.env

cd /opt/fmmt
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## 4. HTTPS

```bash
sudo certbot --nginx -d fmmt.events -d www.fmmt.events
```

## Mises à jour

- `git push origin main` → Actions Deploy
- Fallback : `./deploy/ovh/deploy.sh`

## Secrets `.env` sur le VPS

- `POSTGRES_PASSWORD`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `RESEND_API_KEY`
