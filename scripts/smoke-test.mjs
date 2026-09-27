import { readFile } from 'node:fs/promises';

const sites = JSON.parse(await readFile(new URL('../data/sites.json', import.meta.url), 'utf8'));

const required = ['search-input', 'category-select', 'reset-button', 'result-count', 'directory-grid'];
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
for (const id of required) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Kontrol UI hilang: ${id}`);
}

const app = await readFile(new URL('../js/app.js', import.meta.url), 'utf8');
for (const token of ['fetch(\'data/sites.json\'', 'matches(site)', 'Kunjungi Website', 'target="_blank"', 'category']) {
  if (!app.includes(token)) throw new Error(`Logika UI tidak ditemukan: ${token}`);
}

const puzzleMatches = sites.filter((s) => s.categories.includes('Puzzle'));
const lichessSearch = sites.filter((s) => `${s.name} ${s.url} ${s.description}`.toLowerCase().includes('lichess'));
if (!puzzleMatches.length) throw new Error('Filter Puzzle tidak menghasilkan dataset.');
if (!lichessSearch.length) throw new Error('Search Lichess tidak menghasilkan dataset.');
if (sites.some((s) => !/^https?:\/\//.test(s.url))) throw new Error('Ada URL non-http(s).');
if (new Set(sites.map((s) => s.url.replace(/\/+$/, '').toLowerCase())).size !== sites.length) throw new Error('Ada duplikat URL.');

console.log(`PASS: search semantic dataset=${lichessSearch.length}; Puzzle=${puzzleMatches.length}; visit links=${sites.length}.`);
