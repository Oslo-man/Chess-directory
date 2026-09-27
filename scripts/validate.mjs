import { readFile } from 'node:fs/promises';

const file = new URL('../data/sites.json', import.meta.url);
const sites = JSON.parse(await readFile(file, 'utf8'));
const allowed = new Set([
  'Bermain Online', 'Bot / AI', 'Puzzle', 'Belajar', 'Analisis', 'Database',
  'Berita', 'Video', 'Turnamen', 'Komunitas', 'Tools', 'Buku / Materi', 'Varian'
]);
const badTokens = /(?:example\.com|example\.org|localhost|127\.0\.0\.1|placeholder|yourdomain|fake|fiktif|test-site)/i;

const errors = [];
if (sites.length < 300) errors.push(`Jumlah entri hanya ${sites.length}; minimal 300.`);

const canonical = (url) => url.replace(/\/+$/, '').toLowerCase();
const seen = new Map();
for (const [index, site] of sites.entries()) {
  const n = index + 1;
  for (const key of ['name', 'url', 'description']) {
    if (typeof site[key] !== 'string' || !site[key].trim()) errors.push(`Baris ${n}: ${key} kosong/tidak valid.`);
  }
  if (!Array.isArray(site.categories) || site.categories.length === 0) errors.push(`Baris ${n}: kategori kosong.`);
  for (const category of site.categories ?? []) {
    if (!allowed.has(category)) errors.push(`Baris ${n}: kategori tidak diizinkan: ${category}`);
  }
  try {
    const url = new URL(site.url);
    if (!['http:', 'https:'].includes(url.protocol)) errors.push(`Baris ${n}: URL bukan HTTP(S): ${site.url}`);
  } catch {
    errors.push(`Baris ${n}: URL tidak valid: ${site.url}`);
  }
  if (badTokens.test(site.url) || badTokens.test(site.name) || badTokens.test(site.description)) {
    errors.push(`Baris ${n}: terdeteksi token placeholder/fiktif.`);
  }
  const key = canonical(site.url);
  if (seen.has(key)) errors.push(`Duplikat URL: ${site.url} (baris ${seen.get(key)} dan ${n}).`);
  else seen.set(key, n);
}

const descriptionsShort = sites.filter((site) => site.description.trim().length < 20).length;
if (descriptionsShort) errors.push(`${descriptionsShort} deskripsi terlalu singkat.`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`PASS: ${sites.length} entri; ${seen.size} URL unik; struktur dan placeholder check lulus.`);
console.log('NOTE: verifikasi status HTTP eksternal tetap bergantung pada koneksi web; script ini tidak mengarang status 200.');
