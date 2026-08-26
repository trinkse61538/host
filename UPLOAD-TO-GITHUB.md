# First upload to a new GitHub repository (macOS)

Recommended repository name: `host`.

> Privacy note: this package currently contains the Agent contact fallback copied from the supplied spreadsheet in `src/features/checkin/agentDirectory.ts`. Prefer a **Private** GitHub repository. If you must make the repository public, move those contact details into Firestore first and remove the fallback file.

## 1. Prepare locally

Unzip the package so this folder exists:

```bash
~/Desktop/host-khaitringuyen
```

Then:

```bash
cd ~/Desktop/host-khaitringuyen
cp .env.example .env.local
npm install
npm test
npm run build
```

`npm install` creates `package-lock.json`. Keep and commit it.

## 2. Create the GitHub repository

GitHub → **New repository**

- Repository name: `host`
- Visibility: **Private** recommended
- Do **not** initialize README, `.gitignore`, or license because they already exist locally.

## 3. Push the source

Replace the remote URL if you choose another repository name:

```bash
cd ~/Desktop/host-khaitringuyen

git init
git add .
git commit -m "Initial Host Control Center rewrite"
git branch -M main
git remote add origin https://github.com/trinkse61538/host.git
git push -u origin main
```

## 4. GitHub Pages

If your GitHub plan supports Pages for this repository visibility:

1. Repository → **Settings** → **Pages**.
2. Under **Build and deployment**, choose **GitHub Actions**.
3. The included workflow will run tests and build the app.
4. Add `host.khaitringuyen.com` as the custom domain.

If Pages is unavailable for a private repo on your GitHub plan, keep the repo private and deploy the built `dist/` through Firebase Hosting or Cloudflare Pages instead.

## 5. DNS for `host.khaitringuyen.com`

For GitHub Pages, add a DNS record at your DNS provider:

```text
Type: CNAME
Name: host
Target: trinkse61538.github.io
```

Wait for DNS propagation, then enable **Enforce HTTPS** in GitHub Pages.

## 6. Firebase authorization

The V3 app uses the same Firebase project and named Firestore database `airbnb` by default.

If Firebase CLI is already installed:

```bash
firebase login
firebase use gen-lang-client-0674849112
firebase deploy --only firestore
```

Existing apartment documents remain compatible. Legacy photo metadata is mapped to Git-managed static paths without Firebase Storage. Before final deployment, run `npm run import:old-media` and follow `MIGRATE-MEDIA.md` for check-in images that existed only in Storage.
