# Direktori Website Catur

Direktori statis yang memisahkan dataset dari UI.

## Struktur

- `index.html` — markup halaman.
- `css/style.css` — layout dan responsive UI.
- `js/app.js` — loading dataset, search, filter, hit count, dan render card.
- `data/sites.json` — dataset website catur.
- `scripts/validate.mjs` — validasi jumlah, field, kategori, URL, placeholder, dan duplikat.
- `scripts/smoke-test.mjs` — smoke test logika UI dan dataset.

## Menjalankan

Jalankan melalui web server statis agar `fetch('data/sites.json')` bekerja:

```bash
python3 -m http.server 8080
```

Lalu buka `http://localhost:8080`.

## Validasi

```bash
node scripts/validate.mjs
node scripts/smoke-test.mjs
```

Validasi HTTP eksternal tidak dipalsukan oleh script. Dataset ini dikurasi dari sumber chess-resource aktif dan sejumlah URL diperiksa langsung melalui web saat penyusunan. Entrinya hanya menggunakan URL HTTP(S) nyata; status live setiap URL dapat berubah setelah dataset dibuat.
