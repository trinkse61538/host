# Host Control Center V3

Maintainable apartment-operations app for `host.khaitringuyen.com`.

V3 keeps **Firebase Authentication + Firestore**, but removes Firebase Storage from the runtime. Check-in, parking and branding images are version-controlled in GitHub under `public/media/` and deployed with GitHub Pages.

## Architecture

```text
src/
├── app/                    # providers, access gate, application shell
├── config/                 # runtime configuration
├── domain/                 # business models
├── features/               # inventory, alerts, cleaner, Wi-Fi, check-in, management
├── infrastructure/
│   ├── firebase/           # Auth + Firestore only
│   ├── google/             # Google Sheets
│   ├── notifications/      # delivery adapters
│   └── staticMedia/        # static image path normalization/resolution
└── shared/                 # reusable UI and utilities

public/media/
├── branding/
├── parking/
└── checkin/
```

Core rules:
- Firebase Auth has one source of truth in `AuthProvider`.
- UI components do not call Firebase APIs directly.
- Firestore persistence lives in `infrastructure/firebase/apartmentRepository.ts`.
- Static photo path compatibility lives in `infrastructure/staticMedia/photoAssets.ts`.
- No GitHub token or Firebase Storage credential is embedded in the browser.
- GitHub manages image binaries; Firestore stores only lightweight path/caption metadata.

## Features

- Google/Firebase sign-in
- Admin / Editor / Viewer roles
- Google Sheets inventory dashboard + cached snapshot
- Shortage notifications via Telegram / Discord / Custom Webhook / Pushover
- Cleaner reminder builder
- Apartment Wi-Fi copy tools
- Check-in guides and static GitHub-hosted images
- Agent information + Agent/Building-Strata Airbnb policy warning
- Warning confirmation before copying agent email for blocked units
- Apartment CRUD + static image path editor
- Admin access management
- Dark mode, VI/EN shell preference and PWA shell
- GitHub Pages deployment workflow

## Local setup

```bash
cd ~/Desktop/host-khaitringuyen
cp .env.example .env.local
npm install
npm test
npm run build
npm run dev
```

## Legacy migration material

The live application uses repository-managed media under `public/media/`.

Historical migration instructions and the encrypted legacy vault are kept outside the
deployed PWA. See [`docs/MAINTENANCE.md`](./docs/MAINTENANCE.md) and
`docs/archive/` when working on legacy migration tasks.

## Firebase

Only Auth and the **default Firestore database** in Firebase project `host-a-8d0ca` are used at runtime. Deploy Firestore rules with:

```bash
firebase use host-a-8d0ca
firebase deploy --only firestore
```

There is intentionally no Firebase Storage runtime dependency. This Firebase project is independent from the legacy Airbnb Firebase project.

## GitHub Pages

The repo includes `CNAME` for `host.khaitringuyen.com` and `.github/workflows/deploy-pages.yml`.
Configure Pages to use **GitHub Actions**, then point DNS CNAME `host` to your GitHub Pages hostname.

## Media ownership

Live PWA assets are stored under `public/media/` and PWA icons under `public/icons/`.
The encrypted legacy image vault is retained only under `migration/legacy-secure/` and
is not shipped by GitHub Pages.

## Target repository for this package

This ZIP is prepared for `https://github.com/trinkse61538/host`. See `REPO-SETUP.md` or run `./PUSH-TO-GITHUB.sh` after local validation.
