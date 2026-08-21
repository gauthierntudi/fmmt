# FMMT Next — inscription

Migration Next.js / Prisma / PostgreSQL du flux d'inscription FMMT. Le site PHP reste intact à la racine du monorepo.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Prisma + PostgreSQL
- next-intl (FR / EN)
- Zod + React Hook Form (wizard)
- Resend (emails)
- ExcelJS (export admin)

## Déploiement VPS (OVH)

Voir [deploy/ovh/DEPLOY.md](deploy/ovh/DEPLOY.md) — cible : `ubuntu@51.255.36.135`, domaine `fmmt.events`.

Repo GitHub : https://github.com/gauthierntudi/fmmt

```bash
# Prod sur VPS (Postgres non exposé, app sur 127.0.0.1:3000)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### GitHub Actions

Push sur `main` → workflow **Deploy VPS** (SSH + `docker compose`).

Secrets GitHub requis (`Settings → Secrets and variables → Actions`) :

| Secret | Exemple |
|--------|---------|
| `VPS_HOST` | `51.255.36.135` |
| `VPS_USER` | `ubuntu` |
| `VPS_SSH_PRIVATE_KEY` | clé privée SSH (contenu complet) |
| `VPS_APP_DIR` | `/opt/fmmt` (optionnel) |
| `VPS_PORT` | `22` (optionnel) |

## Docker

### Production locale (Postgres + app)

```bash
cd fmmt-next
cp .env.example .env   # renseigner RESEND_* / ADMIN_* / AUTH_SECRET
docker compose up --build
```

- App : http://localhost:3000  
- Postgres : `localhost:5435` (user/pass/db = `fmmt` par défaut)  
- Les migrations Prisma partent automatiquement via le service `migrate`

```bash
npm run docker:up      # up -d --build
npm run docker:logs    # logs web
npm run docker:down
```

### Dev hot-reload dans Docker

```bash
docker compose --profile dev up --build
# ou : npm run docker:dev
```

Ne lance pas le service `web` prod en même temps (même port 3000).

### Variables utiles

| Variable | Défaut | Rôle |
|----------|--------|------|
| `POSTGRES_DB` / `USER` / `PASSWORD` | `fmmt` | Base Docker |
| `POSTGRES_PORT` | `5435` | Port hôte Postgres (évite le conflit avec Postgres local) |
| `APP_PORT` | `3000` | Port hôte Next |
| `DATABASE_URL` | (auto dans Compose) | URL Prisma |
| `RESEND_API_KEY` / `RESEND_FROM` | — | Emails |
| `ADMIN_PASSWORD` / `AUTH_SECRET` | — | Admin |

## Setup local (sans Docker app)

Postgres peut rester en Docker (`docker compose up db -d`) pendant que tu lances Next sur l’hôte :

```bash
cd fmmt-next
cp .env.example .env
# DATABASE_URL=postgresql://fmmt:fmmt@localhost:5435/fmmt?schema=public
npm install
npx prisma migrate dev
npm run dev
```

## Routes

| URL | Rôle |
|-----|------|
| `/fr` / `/en` | Accueil minimal + CTA inscription |
| `/fr/inscription` | Wizard d'inscription (FR) |
| `/en/register` | Wizard d'inscription (EN) |
| `/fr/inscription/success` | Confirmation |
| `/admin/login` | Auth admin (mot de passe `ADMIN_PASSWORD`) |
| `/admin/participants` | Liste + détail + export Excel |
| `POST /api/register` | Création participant |

## Règles métier

- Champs requis : email, nom, prenom, typeInscription, pays, telephone, fonction, lettreInvitation
- **RDC** (`paysCode=CD`) : voyage non requis, hôtel optionnel
- **Hors RDC** : voyage + hôtel + roomType requis
- Email unique → `409 DUPLICATE_EMAIL`
- Prix chambre recalculé côté serveur depuis `src/lib/hotels.ts`
- Emails participant + admin via Resend : échec d'envoi n'annule pas l'inscription

## Variables d'environnement

Voir `.env.example` :

- `DATABASE_URL`
- `RESEND_API_KEY`, `RESEND_FROM` (ex. `FMMT <noreply@fmmt.events>` — domaine vérifié sur Resend)
- `RESEND_FROM_NAME` (optionnel si `RESEND_FROM` contient déjà le nom)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`
- `APP_URL` (ex. `https://fmmt.events`)

## Structure utile

```
src/app/[locale]/inscription/   # pages publiques
src/app/api/register/            # API inscription
src/app/admin/                   # back-office
src/lib/hotels.ts                # catalogue hôtels (source unique)
src/lib/validations/register.ts  # Zod + règles RDC
prisma/schema.prisma
```
