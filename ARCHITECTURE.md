# Architecture

## Boundary map

```text
React feature UI
      │
      ├── app/providers
      │      ├── AuthProvider
      │      ├── ApartmentProvider
      │      ├── InventoryProvider
      │      ├── ThemeProvider
      │      └── LocaleProvider
      │
      ├── domain/models.ts
      │
      └── infrastructure
             ├── firebase/auth.ts
             ├── firebase/apartmentRepository.ts   # Firestore only
             ├── google/sheets.ts
             ├── notifications/dispatch.ts
             └── staticMedia/photoAssets.ts
```

## Image ownership

Image binaries belong to Git, not the database:

```text
GitHub repository
  public/media/checkin/*
  public/media/parking/*
  public/media/branding/*
           │
           └── GitHub Pages / host.khaitringuyen.com

Firestore apartment document
  photos: [{ path, caption }]
```

A Firestore document never contains image bytes and the frontend never contains a GitHub write token.

## Legacy compatibility

Historical Firestore documents may contain:

```json
{"storagePath":"apartment-media/unit-1/photo.jpg","caption":"Door"}
```

The repository adapter normalizes it in memory to:

```json
{"path":"media/checkin/apartment-media/unit-1/photo.jpg","caption":"Door"}
```

No Firebase Storage SDK call is made. This allows a one-time file migration while keeping old Firestore data usable.
