# Deploy to trinkse61538/host

Target repository: `https://github.com/trinkse61538/host`

## First push from macOS

```bash
cd ~/Desktop/host
git init
git branch -M main
git remote add origin https://github.com/trinkse61538/host.git
git add .
git commit -m "Initial Host Control Center V3.1"
git push -u origin main
```

The target repository is currently empty, so this is a clean initial push.

## GitHub Pages

Repository → **Settings → Pages** → Source: **GitHub Actions**.

The included workflow `.github/workflows/deploy-pages.yml` builds and deploys `dist/` whenever `main` is pushed.

## Custom domain

The package already contains:

```text
CNAME
host.khaitringuyen.com
```

At your DNS provider create:

```text
Type: CNAME
Name: host
Target: trinkse61538.github.io
```

Then in GitHub Pages set custom domain to `host.khaitringuyen.com` and enable HTTPS.

## Firebase Auth authorized domains

Firebase Console → Authentication → Settings → Authorized domains. Ensure these are allowed:

```text
host.khaitringuyen.com
trinkse61538.github.io
```

The app continues using the existing Firebase project and the named Firestore database `airbnb`.

## Validate before first push

```bash
npm install
npm test
npm run build
```

`node_modules/` and `dist/` are intentionally not included in the ZIP; GitHub Actions creates them during build.
