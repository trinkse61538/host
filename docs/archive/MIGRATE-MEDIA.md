# Media migration — GitHub-managed images

V3.1 does not use Firebase Storage at runtime.

## Already included in this ZIP

The latest successful GitHub Pages artifact from the old `airbnb` repository was used to restore the media that is actually present in GitHub deployment output:

- `public/media/parking/` — 19 parking JPG files
- `public/media/branding/logo.jpg` — old project logo
- `public/icons/` — PWA icons
- `public/legacy-secure/` — the old encrypted secure package, including 34 encrypted image blobs

So you do **not** need to manually copy the parking images or logo anymore.

## Why the old Check-in photos are not plaintext in the ZIP

There are two historical sources for Check-in photos:

1. The older protected PWA package stored images in GitHub as AES-GCM encrypted `.bin` files. Those encrypted files are included under `public/legacy-secure/`.
2. The newer app stores uploaded Check-in photos in Firebase Storage. Those files are not part of the GitHub repository or GitHub Pages artifact.

The encrypted GitHub files cannot be converted to JPG/PNG without the old vault passphrase (`PWA_ACCESS_PASSPHRASE`).

If you still know the old PWA access key, run:

```bash
cd ~/Desktop/host-khaitringuyen
PWA_ACCESS_PASSPHRASE="YOUR_OLD_KEY" npm run decrypt:legacy-media
```

The decrypted images will be written to:

```text
migration-output/legacy-checkin-images/
```

They are intentionally **not** written directly into `public/`.

## Security warning for Check-in media

Anything under `public/` is published by GitHub Pages and can be requested directly by URL, even though the React interface itself requires login.

Parking photos and branding are fine as public assets. Before moving Check-in photos into `public/media/checkin/`, review whether they expose:

- lockbox locations,
- keys/fobs,
- access codes,
- private entry instructions.

For sensitive Check-in photos, keep them encrypted rather than publishing plaintext static files.

## Current Firebase Storage-only photos

If a current Check-in image exists only under Firebase Storage path:

```text
apartment-media/<apartment-id>/<file-name>.jpg
```

it still needs a one-time export from Firebase because GitHub has no copy of those bytes. Preserve the hierarchy under:

```text
public/media/checkin/apartment-media/<apartment-id>/<file-name>.jpg
```

V3's compatibility resolver already translates old Firestore `storagePath` metadata to that location, so no bulk Firestore rewrite is required.
