import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  writeBatch,
} from 'firebase/firestore';
import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
} from 'firebase/storage';

const OLD_CONFIG = {
  projectId: 'gen-lang-client-0674849112',
  appId: '1:701129305498:web:8af96c94988c82c76f9e23',
  apiKey: 'AIzaSyAqBRukH-eKCjgtPikHHuay7B0EmVU_TDA',
  authDomain: 'gen-lang-client-0674849112.firebaseapp.com',
  storageBucket: 'gen-lang-client-0674849112.firebasestorage.app',
  messagingSenderId: '701129305498',
};

const NEW_CONFIG = {
  projectId: 'host-a-8d0ca',
  appId: '1:945997311371:web:36824f573c02c0260f938e',
  apiKey: 'AIzaSyC5vPR9lPL7H6-I-Hx6qdcq0qdlwYgc2Bc',
  authDomain: 'host-a-8d0ca.firebaseapp.com',
  messagingSenderId: '945997311371',
};

const OLD_ADMIN = 'khaitri15@gmail.com';
const NEW_ADMIN = 'henrynguyenfw@gmail.com';

const oldApp = initializeApp(OLD_CONFIG, 'old-airbnb');
const newApp = initializeApp(NEW_CONFIG, 'new-host');

const oldAuth = getAuth(oldApp);
const newAuth = getAuth(newApp);
const oldDb = getFirestore(oldApp, 'airbnb');
const newDb = getFirestore(newApp);
const oldStorage = getStorage(oldApp);

await Promise.all([
  setPersistence(oldAuth, inMemoryPersistence),
  setPersistence(newAuth, inMemoryPersistence),
]);

const state = {
  oldUser: null,
  newUser: null,
  snapshot: null,
};

const $ = selector => document.querySelector(selector);
const logNode = $('#log');
const summaryNode = $('#summary');
const backupButton = $('#backup');
const migrateButton = $('#migrate');
const mediaButton = $('#media');

function log(message, kind = 'info') {
  const stamp = new Date().toLocaleTimeString();
  logNode.textContent += `\n[${stamp}] ${kind.toUpperCase()}  ${message}`;
  logNode.scrollTop = logNode.scrollHeight;
}

function emailOf(user) {
  return (user?.email || '').toLowerCase();
}

function setUserLabel(selector, user, expected) {
  const node = $(selector);
  if (!user) {
    node.textContent = 'Not signed in';
    node.className = 'status';
    return;
  }
  const ok = emailOf(user) === expected;
  node.textContent = `${user.email}${ok ? ' ✓' : ` — expected ${expected}`}`;
  node.className = `status ${ok ? 'ok' : 'bad'}`;
}

function updateButtons() {
  const hasOld = Boolean(state.oldUser);
  const hasNew = Boolean(state.newUser);
  const hasSnapshot = Boolean(state.snapshot);
  backupButton.disabled = !hasSnapshot;
  migrateButton.disabled = !(hasOld && hasNew && hasSnapshot);
  mediaButton.disabled = !(hasOld && hasSnapshot && state.snapshot.mediaPaths.length);
}

function provider() {
  const next = new GoogleAuthProvider();
  next.setCustomParameters({ prompt: 'select_account' });
  return next;
}

async function login(auth, side) {
  log(`Opening ${side.toUpperCase()} Firebase sign-in…`);
  const result = await signInWithPopup(auth, provider());
  const user = result.user;

  if (side === 'old') {
    state.oldUser = user;
    setUserLabel('#old-user', user, OLD_ADMIN);
  } else {
    state.newUser = user;
    setUserLabel('#new-user', user, NEW_ADMIN);
  }

  const expected = side === 'old' ? OLD_ADMIN : NEW_ADMIN;
  log(`${side.toUpperCase()} signed in as ${user.email}.`, emailOf(user) === expected ? 'success' : 'warn');
  updateButtons();
}

async function readCollection(name) {
  const snapshot = await getDocs(collection(oldDb, name));
  return snapshot.docs.map(item => ({
    id: item.id,
    data: item.data(),
  }));
}

function collectMediaPaths(apartments) {
  const paths = new Set();
  for (const apartment of apartments) {
    const photos = Array.isArray(apartment.data?.photos) ? apartment.data.photos : [];
    for (const photo of photos) {
      if (photo && typeof photo.storagePath === 'string' && photo.storagePath.trim()) {
        paths.add(photo.storagePath.trim().replace(/^\/+/, ''));
      }
    }
  }
  return [...paths].sort();
}

async function preview() {
  if (!state.oldUser) throw new Error('Sign in to OLD Firebase first.');

  log('Reading old Firestore collections…');
  const [apartments, access] = await Promise.all([
    readCollection('apartments'),
    readCollection('access'),
  ]);

  const mediaPaths = collectMediaPaths(apartments);
  state.snapshot = {
    capturedAt: new Date().toISOString(),
    source: {
      projectId: OLD_CONFIG.projectId,
      databaseId: 'airbnb',
    },
    apartments,
    access,
    mediaPaths,
  };

  summaryNode.innerHTML = `
    <div><strong>${apartments.length}</strong><span>Apartments</span></div>
    <div><strong>${access.length}</strong><span>Access accounts</span></div>
    <div><strong>${mediaPaths.length}</strong><span>Check-in media files</span></div>
  `;

  log(`Preview complete: ${apartments.length} apartments, ${access.length} access accounts, ${mediaPaths.length} media paths.`, 'success');
  updateButtons();
}

function jsonReplacer(_key, value) {
  if (value && typeof value.toDate === 'function') {
    return { __type: 'firestore-timestamp', iso: value.toDate().toISOString() };
  }
  if (value && typeof value.latitude === 'number' && typeof value.longitude === 'number') {
    return { __type: 'firestore-geopoint', latitude: value.latitude, longitude: value.longitude };
  }
  return value;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadBackup() {
  if (!state.snapshot) throw new Error('Preview the old data first.');
  const body = JSON.stringify(state.snapshot, jsonReplacer, 2);
  downloadBlob(
    new Blob([body], { type: 'application/json' }),
    `host-old-firebase-backup-${new Date().toISOString().slice(0, 10)}.json`,
  );
  log('JSON backup downloaded.', 'success');
}

async function writeDocuments(collectionName, items) {
  const CHUNK_SIZE = 400;
  for (let start = 0; start < items.length; start += CHUNK_SIZE) {
    const batch = writeBatch(newDb);
    const chunk = items.slice(start, start + CHUNK_SIZE);
    for (const item of chunk) {
      batch.set(doc(newDb, collectionName, item.id), item.data, { merge: true });
    }
    await batch.commit();
    log(`Wrote ${Math.min(start + chunk.length, items.length)}/${items.length} ${collectionName} documents.`);
  }
}

async function migrateFirestore() {
  if (!state.snapshot) throw new Error('Preview the old data first.');
  if (!state.newUser) throw new Error('Sign in to NEW Firebase first.');

  if (emailOf(state.newUser) !== NEW_ADMIN) {
    const proceed = confirm(
      `You are signed in to NEW Firebase as ${state.newUser.email}, not ${NEW_ADMIN}. Continue anyway?`,
    );
    if (!proceed) return;
  }

  const confirmed = confirm(
    `Copy ${state.snapshot.apartments.length} apartments and ${state.snapshot.access.length} access documents into host-a-8d0ca/(default)?\n\nExisting destination documents are merged and are NOT deleted.`,
  );
  if (!confirmed) return;

  log('Starting Firestore migration…');
  await writeDocuments('apartments', state.snapshot.apartments);
  await writeDocuments('access', state.snapshot.access);

  const adminBatch = writeBatch(newDb);
  adminBatch.set(
    doc(newDb, 'access', NEW_ADMIN),
    {
      email: NEW_ADMIN,
      role: 'admin',
      active: true,
      displayName: 'Henry Nguyen',
    },
    { merge: true },
  );
  await adminBatch.commit();

  log('Ensured Henry is an active admin in the new access collection.', 'success');
  log('Firestore migration complete.', 'success');
  alert('Firestore migration complete. Reload host.khaitringuyen.com after GitHub Pages has the matching media files.');
}

async function downloadMedia() {
  if (!state.snapshot?.mediaPaths?.length) throw new Error('No old Storage paths found.');
  if (!window.JSZip) throw new Error('JSZip failed to load. Check your internet connection and reload this page.');

  const zip = new window.JSZip();
  const failures = [];
  let completed = 0;

  log(`Downloading ${state.snapshot.mediaPaths.length} old Firebase Storage files…`);

  for (const storagePath of state.snapshot.mediaPaths) {
    try {
      const url = await getDownloadURL(storageRef(oldStorage, storagePath));
      const response = await fetch(`/__fetch-media?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const cleanPath = storagePath.replace(/^\/+/, '');
      zip.file(`media/checkin/${cleanPath}`, blob);
      completed += 1;
      log(`Media ${completed}/${state.snapshot.mediaPaths.length}: ${cleanPath}`);
    } catch (error) {
      failures.push({
        storagePath,
        error: error instanceof Error ? error.message : String(error),
      });
      log(`Failed media: ${storagePath}`, 'warn');
    }
  }

  zip.file(
    'migration-report.json',
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        requested: state.snapshot.mediaPaths.length,
        downloaded: completed,
        failures,
      },
      null,
      2,
    ),
  );

  log('Compressing media ZIP…');
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  downloadBlob(blob, `host-checkin-media-${new Date().toISOString().slice(0, 10)}.zip`);
  log(
    `Media ZIP downloaded: ${completed} files, ${failures.length} failures.`,
    failures.length ? 'warn' : 'success',
  );
}

async function guarded(action) {
  try {
    await action();
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    log(message, 'error');
    alert(message);
  }
}

$('#login-old').addEventListener('click', () => guarded(() => login(oldAuth, 'old')));
$('#login-new').addEventListener('click', () => guarded(() => login(newAuth, 'new')));
$('#preview').addEventListener('click', () => guarded(preview));
$('#backup').addEventListener('click', () => guarded(async () => downloadBackup()));
$('#migrate').addEventListener('click', () => guarded(migrateFirestore));
$('#media').addEventListener('click', () => guarded(downloadMedia));
$('#clear-log').addEventListener('click', () => {
  logNode.textContent = 'Ready.';
});

updateButtons();
