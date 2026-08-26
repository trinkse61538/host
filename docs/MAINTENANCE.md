# Host Control Center maintenance notes

## Runtime boundaries

- `src/app/`: application shell and providers.
- `src/domain/`: business-facing TypeScript models.
- `src/features/`: UI grouped by feature.
- `src/infrastructure/`: Firebase, Google Sheets, notifications and static-media adapters.
- `src/shared/`: reusable UI and utility code.

Feature components should not call Firebase APIs directly. Firestore writes belong in
`src/infrastructure/firebase/apartmentRepository.ts`.

## Static media

Current check-in and parking image paths are repository-managed under `public/media/`.
The historical encrypted vault has been moved out of `public/` into
`migration/legacy-secure/` so GitHub Pages no longer deploys it.

Treat `migration/` as offline migration material only.

## Compatibility fallbacks still in runtime

Two compatibility sources intentionally remain for now:

- `src/features/checkin/agentDirectory.ts`
- `src/features/parking/parkingDefaults.ts`

They prevent data loss for apartments whose migrated Firestore documents have not yet
materialized all Agent / Parking fields.

Do **not** delete these files until every production apartment has been audited in
Firestore. Once that audit is complete, materialize the missing values into Firestore,
remove the fallback imports, and then delete these files.

This is deliberately deferred instead of guessing that migration data is complete.

## Before merging changes

Run:

```bash
npm run check
```

The GitHub Pages workflow also runs tests and a production build before deployment.
