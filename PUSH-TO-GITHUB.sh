#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/trinkse61538/host.git"

echo "Running local validation..."
npm install
npm test
npm run build

if [ ! -d .git ]; then
  git init
fi

git branch -M main
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

git add .
if ! git diff --cached --quiet; then
  git commit -m "Initial Host Control Center V3.1"
fi

git push -u origin main
