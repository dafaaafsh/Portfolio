# Portfolio Hamada — Component Structure

Website ini menggunakan HTML component terpisah dengan JavaScript `fetch()`.

## Struktur folder

```text
portfolio-components/
├── assets/                  # Letakkan folder assets lama di sini
├── components/
│   ├── header.html
│   ├── hero.html
│   ├── about.html
│   ├── portfolio.html
│   ├── contact.html
│   ├── social.html
│   ├── footer.html
│   └── image-modal.html
├── js/
│   └── app.js
├── index.html
├── styles.css               # Letakkan styles.css lama di sini
├── LICENSE
└── README.md
```

## Menjalankan website

Karena komponen dimuat menggunakan `fetch()`, jangan membuka `index.html` langsung melalui `file://`.

Jalankan local server dari folder project, misalnya:

```bash
python -m http.server 5500
```

Lalu buka `http://localhost:5500`.

Di VS Code, bisa juga menggunakan extension **Live Server**.

## Catatan

- Pindahkan folder `assets` lama ke root project ini.
- Salin `styles.css` lama ke root project ini.
- `LICENSE` lama dapat tetap digunakan.
- Konten setiap section berada di file HTML masing-masing.
- Event, modal gambar, navigasi aktif, dan animasi scroll dikelola di `js/app.js`.
