import { cp, mkdir, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const sourceRepo = resolve(process.argv[2] || join(homedir(), 'Desktop', 'airbnb'));
const targetRoot = resolve('public', 'media');

async function exists(path) {
  try { await stat(path); return true; } catch { return false; }
}

async function copyDirectory(source, target, label) {
  if (!(await exists(source))) {
    console.log(`skip: ${label} not found at ${source}`);
    return;
  }
  await mkdir(target, { recursive: true });
  await cp(source, target, { recursive: true, force: true });
  console.log(`copied: ${label} -> ${target}`);
}

await copyDirectory(join(sourceRepo, 'public', 'parking'), join(targetRoot, 'parking'), 'parking images');

const oldLogo = join(sourceRepo, 'public', 'logo.jpg');
if (await exists(oldLogo)) {
  await mkdir(join(targetRoot, 'branding'), { recursive: true });
  await cp(oldLogo, join(targetRoot, 'branding', 'logo.jpg'), { force: true });
  console.log('copied: logo.jpg -> public/media/branding/logo.jpg');
}

console.log('\nDone. Review the copied files, then git add/commit them.');
console.log('Check-in images stored only in Firebase Storage are not available inside the old Git repository.');
console.log('See MIGRATE-MEDIA.md for the one-time check-in migration layout.');
