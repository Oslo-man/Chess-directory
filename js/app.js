const state = {
  sites: [],
  filtered: [],
  query: '',
  category: '',
};

const els = {
  search: document.querySelector('#search-input'),
  category: document.querySelector('#category-select'),
  reset: document.querySelector('#reset-button'),
  count: document.querySelector('#result-count'),
  activeFilter: document.querySelector('#active-filter'),
  status: document.querySelector('#data-status'),
  grid: document.querySelector('#directory-grid'),
  empty: document.querySelector('#empty-state'),
  error: document.querySelector('#load-error'),
};

const normalize = (value) => String(value ?? '').toLocaleLowerCase('id-ID').trim();

function getAllCategories(sites) {
  return [...new Set(sites.flatMap((site) => site.categories))].sort((a, b) => a.localeCompare(b, 'id'));
}

function applyUrlState() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  const category = params.get('category');
  if (query) {
    state.query = query;
    els.search.value = query;
  }
  if (category && [...els.category.options].some((opt) => opt.value === category)) {
    state.category = category;
    els.category.value = category;
  }
}

function renderCategories() {
  const options = getAllCategories(state.sites)
    .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join('');
  els.category.insertAdjacentHTML('beforeend', options);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function matches(site) {
  const haystack = normalize([
    site.name,
    site.url,
    site.description,
    site.categories.join(' '),
  ].join(' '));

  const queryMatch = !state.query || haystack.includes(normalize(state.query));
  const categoryMatch = !state.category || site.categories.includes(state.category);
  return queryMatch && categoryMatch;
}

function render() {
  state.filtered = state.sites.filter(matches);
  els.count.textContent = state.filtered.length.toLocaleString('id-ID');
  els.activeFilter.textContent = state.category ? `Kategori: ${state.category}` : 'Semua kategori';
  els.status.textContent = `${state.sites.length.toLocaleString('id-ID')} entri dalam dataset`;

  const cards = state.filtered.map((site) => {
    const href = safeUrl(site.url);
    if (!href) return '';

    const tags = site.categories
      .map((category) => `<span class="category-tag">${escapeHtml(category)}</span>`)
      .join('');

    const domain = (() => {
      try { return new URL(href).hostname; } catch { return href; }
    })();

    return `
      <article class="site-card">
        <div class="card-top">
          <div>
            <h2>${escapeHtml(site.name)}</h2>
            <p class="site-domain">${escapeHtml(domain)}</p>
          </div>
        </div>
        <div class="category-list" aria-label="Kategori">${tags}</div>
        <p class="description">${escapeHtml(site.description)}</p>
        <a class="visit-button" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Kunjungi Website</a>
      </article>`;
  }).join('');

  els.grid.innerHTML = cards;
  els.grid.setAttribute('aria-busy', 'false');
  els.empty.hidden = Boolean(cards);
}

function resetFilters() {
  state.query = '';
  state.category = '';
  els.search.value = '';
  els.category.value = '';
  render();
}

async function loadData() {
  try {
    const response = await fetch('data/sites.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data) || !data.length) throw new Error('Dataset kosong');
    state.sites = data;
    renderCategories();
    applyUrlState();
    render();
  } catch (error) {
    console.error('Gagal memuat dataset:', error);
    els.grid.hidden = true;
    els.error.hidden = false;
    els.count.textContent = '0';
    els.status.textContent = 'Dataset gagal dimuat';
  }
}

els.search.addEventListener('input', (event) => {
  state.query = event.target.value;
  render();
});

els.category.addEventListener('change', (event) => {
  state.category = event.target.value;
  render();
});

els.reset.addEventListener('click', resetFilters);

loadData();
