# Local test checklist

```bash
cd ~/Desktop/host-khaitringuyen
cp .env.example .env.local
npm install
npm test
npm run build
npm run dev
```

Check:

1. Google sign-in succeeds.
2. Inventory refreshes from Google Sheets.
3. Wi-Fi and Check-in records load from Firestore.
4. A photo with path `media/checkin/...` renders from `public/media/checkin/...`.
5. Saving an apartment writes `photos: [{ path, caption }]` to Firestore.
6. No request to `firebasestorage.app` appears in the browser Network panel.
7. Agent/Strata blocked units show `NO AIRBNB` and email-copy warning.
8. `npm test` and `npm run build` both pass before push.
