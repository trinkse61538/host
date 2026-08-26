import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const passphrase = process.env.PWA_ACCESS_PASSPHRASE || process.argv[2] || '';
const vaultDir = path.join(projectRoot, 'public', 'legacy-secure');
const envelopePath = path.join(vaultDir, 'secure-data.json');
const outputDir = path.join(projectRoot, 'migration-output', 'legacy-checkin-images');

if (!passphrase || passphrase.length < 16) {
  console.error('Missing legacy vault key.');
  console.error('Run: PWA_ACCESS_PASSPHRASE="your-old-key" npm run decrypt:legacy-media');
  process.exit(1);
}
if (!fs.existsSync(envelopePath)) {
  console.error(`Legacy package not found: ${envelopePath}`);
  process.exit(1);
}

function decrypt(ciphertextWithTag, key, iv) {
  if (ciphertextWithTag.length < 17) throw new Error('Encrypted payload is too short.');
  const tag = ciphertextWithTag.subarray(ciphertextWithTag.length - 16);
  const ciphertext = ciphertextWithTag.subarray(0, ciphertextWithTag.length - 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

const envelope = JSON.parse(fs.readFileSync(envelopePath, 'utf8'));
const key = crypto.pbkdf2Sync(
  passphrase,
  Buffer.from(envelope.kdf.salt, 'base64'),
  envelope.kdf.iterations,
  32,
  'sha256',
);

let payload;
try {
  const decrypted = decrypt(
    Buffer.from(envelope.data.ciphertext, 'base64'),
    key,
    Buffer.from(envelope.data.iv, 'base64'),
  );
  payload = JSON.parse(decrypted.toString('utf8'));
} catch (error) {
  console.error('Unable to decrypt the legacy vault. The key is probably incorrect.');
  process.exit(2);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

let count = 0;
for (const [originalUrl, descriptor] of Object.entries(payload.assets || {})) {
  const encryptedName = path.basename(descriptor.file || '');
  const encryptedPath = path.join(vaultDir, 'assets', encryptedName);
  if (!fs.existsSync(encryptedPath)) {
    console.warn(`Missing encrypted asset: ${encryptedName}`);
    continue;
  }

  const fileName = path.basename(originalUrl);
  const decrypted = decrypt(
    fs.readFileSync(encryptedPath),
    key,
    Buffer.from(descriptor.iv, 'base64'),
  );
  fs.writeFileSync(path.join(outputDir, fileName), decrypted);
  count += 1;
}

const manifest = {
  exportedAt: new Date().toISOString(),
  images: count,
  checkinRecords: Array.isArray(payload.checkin) ? payload.checkin.length : 0,
  source: 'public/legacy-secure',
};
fs.writeFileSync(
  path.join(projectRoot, 'migration-output', 'legacy-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

console.log(`Decrypted ${count} legacy image(s) into:`);
console.log(path.relative(projectRoot, outputDir));
console.log('Review them before copying any image into public/media/checkin/.');
console.log('Do not publish lockbox/access-code photos as public static assets unless you accept that risk.');
