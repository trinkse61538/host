# Move existing local repo to trinkse61538/host

If you already ran `git init`, `git add`, and `git commit`, do **not** start over.

Run:

```bash
cd ~/Desktop/host

git remote set-url origin https://github.com/trinkse61538/host.git
git remote -v
git push -u origin main
```

If `origin` does not exist:

```bash
git remote add origin https://github.com/trinkse61538/host.git
git push -u origin main
```

Your existing macOS GitHub credential for `trinkse61538` can stay in Keychain.
