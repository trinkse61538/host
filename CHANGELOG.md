# Changelog

## 1.1.0 — Git-managed media

- Removed Firebase Storage initialization and all Storage SDK calls.
- Removed `storage.rules` and Storage deployment configuration.
- Changed apartment photo metadata from `{ storagePath, caption }` to `{ path, caption }`.
- Added backward-compatible mapping for legacy `storagePath` metadata without contacting Firebase Storage.
- Added repository asset resolver and unit tests.
- Added static media folders under `public/media/`.
- Added macOS media import script for the old Git-tracked parking images and logo.
- Replaced browser photo upload with a static photo path editor so no GitHub token is exposed in frontend code.
- Split management UI into smaller components for easier maintenance.
