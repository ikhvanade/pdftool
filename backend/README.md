# Backend - PDFTool by Vann

## Status: BACKEND SELESAI (frontend + rebrand visual nyusul terpisah)

## Setup
```bash
npm install
cp .env.example .env
# isi DB credential, JWT_SECRET, COOKIE_SECRET, PUBLIC_URL

npm run migrate
npm run create-user -- --username=admin --email=admin@example.com --password=passwordkuat123
npm run dev
```

## System requirements (WAJIB install di server)
```bash
sudo apt install ghostscript poppler-utils qpdf zip --no-install-recommends libreoffice-writer
```

## Endpoint baru sesi ini (Image Compressor/Resizer, PRD §6.7)
- `POST /api/image/compress` - body: `preset` (normal|sedang|ekstrim), multipart `files[]`
- `POST /api/image/resize` - body: `printSize` (2x3|3x4|4x6) ATAU `customWidth`+`customHeight`, multipart `files[]`
- `POST /api/image/convert` - body: `format` (jpeg|png|webp), multipart `files[]`
- `GET /api/image/jobs/:id`, `GET /api/image/download/:id` - sama pattern kayak PDF

Semua 3 endpoint: guestQuotaCheck, job-based (worker_threads), batch multi-file
(auto-zip kalau >1 file), pake `sharp` (bukan ImageMagick).

## Endpoint baru lain (dari sesi-sesi sebelumnya, tetap ada)
- Auth: login, logout, change-password, update profile (`full_name` baru), update theme, upload avatar
- PDF: compress, convert, protect, to-word (LibreOffice), merge/split/watermark (client-side, gak ada di backend)
- QR: generate (+ embed logo), generate-from-image
- History, Presets, Guest quota, Activity log

## PENTING - migration 005 nambah kolom baru di `users`
`full_name`, `avatar_path`, `theme` (default 'dark'). Jalanin `npm run migrate` di server buat apply.

## Belum dikerjain di sesi ini (nyusul)
- Frontend: rebrand visual total (sidebar 4 item, palette biru light/dark, font Inter+JetBrains Mono)
- Frontend: halaman Image Tool (upload multi-file, panel compress/resize/convert)
- Theme toggle UI di Settings
- Upload avatar UI

## Testing
Belum sempat dites end-to-end di sesi ini (fokus ngirim progress dulu). WAJIB
dites manual: migrate jalan bersih, dan endpoint /api/image/* pake curl
sebelum dipakein di frontend.
