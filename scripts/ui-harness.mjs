import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const sites = JSON.parse(await readFile(new URL('../data/sites.json', import.meta.url), 'utf8'));
const elements = new Map();
const listeners = new Map();

function mockElement(id) {
  return {
    id,
    value: '',
    innerHTML: '',
    hidden: false,
    options: [{ value: '' }],
    setAttribute() {},
    insertAdjacentHTML(_position, html) {
      const values = [...html.matchAll(/<option value="([^"]+)">/g)].map((m) => m[1]);
      this.options.push(...values.map((value) => ({ value })));
    },
    addEventListener(type, handler) {
      listeners.set(`${id}:${type}`, handler);
    },
  };
}

for (const id of ['search-input','category-select','reset-button','result-count','active-filter','data-status','directory-grid','empty-state','load-error']) {
  elements.set(id, mockElement(id));
}

globalThis.document = { querySelector: (selector) => elements.get(selector.slice(1)) };
globalThis.window = { location: { search: '' } };
globalThis.fetch = async () => ({ ok: true, async json() { return sites; } });

await import(pathToFileURL('/mnt/data/chess-directory/js/app.js').href);
await new Promise((resolve) => setTimeout(resolve, 0));

const grid = elements.get('directory-grid');
const count = elements.get('result-count');
if (Number(count.textContent) !== sites.length) throw new Error(`Initial count mismatch: ${count.textContent}`);

const search = elements.get('search-input');
search.value = 'lichess';
listeners.get('search-input:input')({ target: search });
const searchCount = Number(count.textContent);
if (!(searchCount > 0 && searchCount < sites.length)) throw new Error(`Search test failed: ${searchCount}`);
if (!grid.innerHTML.includes('lichess.org')) throw new Error('Search result markup missing expected URL.');

listeners.get('reset-button:click')();
const category = elements.get('category-select');
category.value = 'Puzzle';
listeners.get('category-select:change')({ target: category });
const puzzleCount = Number(count.textContent);
const expectedPuzzle = sites.filter((s) => s.categories.includes('Puzzle')).length;
if (puzzleCount !== expectedPuzzle) throw new Error(`Puzzle filter mismatch: ${puzzleCount} != ${expectedPuzzle}`);

listeners.get('reset-button:click')();
if (Number(count.textContent) !== sites.length) throw new Error('Reset did not restore full dataset.');
const links = [...grid.innerHTML.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
if (links.length !== sites.length) throw new Error(`Visit-link count mismatch: ${links.length}`);
if (links.some((url) => !/^https?:\/\//.test(url))) throw new Error('Invalid visit href found.');

console.log(`PASS: initial=${sites.length}; search=${searchCount}; puzzle=${puzzleCount}; visit-links=${links.length}; reset=ok.`);
