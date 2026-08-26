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

## Import images from the old repo

If the old project is still at `~/Desktop/airbnb`:

```bash
npm run import:old-media
```

This imports Git-tracked parking images and the old logo. Check-in images that only exist in Firebase Storage need a one-time export; see [`MIGRATE-MEDIA.md`](./MIGRATE-MEDIA.md).

## Firebase

Only Auth and Firestore are used at runtime. Deploy Firestore rules with:

```bash
firebase deploy --only firestore
```

There is intentionally no `storage.rules` in V3 and no Storage section in `firebase.json`.

Existing Firestore documents remain readable. Legacy photo metadata containing `storagePath` is mapped to the expected static GitHub path without contacting Firebase Storage.

## GitHub Pages

The repo includes `CNAME` for `host.khaitringuyen.com` and `.github/workflows/deploy-pages.yml`.
Configure Pages to use **GitHub Actions**, then point DNS CNAME `host` to your GitHub Pages hostname.

## Included media in V3.1

This package already contains the media recovered from the old GitHub Pages deployment: 19 parking JPG files, the project logo, 3 PWA icons, and a backup of 34 encrypted legacy secure-image blobs. See `MIGRATE-MEDIA.md` for Check-in migration and the security note about publishing sensitive entry images as public static URLs.

## Target repository for this package

This ZIP is prepared for `https://github.com/trinkse61538/host`. See `REPO-SETUP.md` or run `./PUSH-TO-GITHUB.sh` after local validation.
