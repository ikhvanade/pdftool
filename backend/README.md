# Backend - PDF Toolkit & QR Generator Dashboard

## Setup cepat
```bash
# System dependencies (WAJIB install duluan sebelum npm install)
sudo apt update
sudo apt install -y ghostscript poppler-utils qpdf zip mariadb-server

npm install
cp .env.example .env
# edit .env - isi DB credential, JWT_SECRET (random), COOKIE_SECRET (random, beda dari JWT_SECRET)

npm run migrate          # bikin semua tabel + jalanin migration 002 (pdf_protect)
npm run create-user -- --username=admin --email=admin@example.com --password=passwordkuat123

npm run dev               # dev mode (nodemon)
# atau production:
pm2 start ecosystem.config.js
```

## Status implementasi (per sesi ini)
Sudah jalan & FULL tested (bukan cuma nulis kode, tapi bener2 dites end-to-end):
- Auth: login/logout (JWT), TANPA endpoint register (sesuai aturan keras)
- guestQuotaCheck middleware - atomic increment, gak block endpoint status/download
- PDF compress - job-based (worker_threads) + **Ghostscript** (`gs`), 3 level: low/medium/high
- PDF convert - job-based + **poppler-utils** (`pdftoppm`), multi-page otomatis di-zip
- PDF protect - job-based + **qpdf** (AES-256 encryption)
- Download endpoint `/api/pdf/download/:id` - dengan ownership check (user/guest cuma bisa download job miliknya sendiri)
- Cleanup script (`npm run cleanup`) - hapus file+row expired dari `processing_jobs` & `files_temp`
- QR generate - full jalan (qrcode npm lib), server-side biar kena guest quota + activity log
- History & Presets - full CRUD dasar, khusus user login
- Migration schema lengkap (001 + 002)

## System requirements di server
- Node.js
- MariaDB
- **Ghostscript** (`gs`) - buat compress
- **poppler-utils** (`pdftoppm`) - buat convert
- **qpdf** - buat protect
- **zip** - buat compress hasil convert multi-halaman jadi 1 file

## Setup cron cleanup (jalanin tiap jam)
```bash
crontab -e
# tambahin baris ini:
0 * * * * cd /path/ke/backend && /usr/bin/node scripts/cleanup-expired-files.js >> logs/cleanup.log 2>&1
```

## Belum/sengaja di-skip (butuh konfirmasi/keputusan lo dulu)
- PDF merge/split/watermark/preview -> ini emang client-side per PRD, gak ada di backend
- Token blacklist buat proper JWT logout invalidation

## Catatan jujur soal compress
Ghostscript compress efeknya BARU keliatan signifikan di PDF yang isinya gambar/scan
resolusi tinggi. PDF yang isinya teks doang (kayak hasil `pdf-lib` generate) malah
bisa JADI LEBIH BESAR gara-gara overhead re-encoding Ghostscript - itu normal,
bukan bug.

## Kenapa compress/convert/protect job-based, bukan langsung proses?
Semua ini CPU-bound (Ghostscript/poppler/qpdf itu proses eksternal) - kalau
ditunggu sync di request handler, request lain ikut nge-lag kalau ada beberapa
proses bersamaan. Solusinya: terima file -> return job_id -> proses di
worker_thread terpisah -> client polling GET /api/pdf/jobs/:id -> download via
GET /api/pdf/download/:id.

## Keamanan yang perlu diperhatikan
- Password buat PDF protect TIDAK PERNAH disimpan ke DB, cuma dilempar in-memory ke worker.
- Semua command ke `gs`/`pdftoppm`/`qpdf` pakai `execFile` (bukan `exec`/shell string),
  jadi input user gak lewat shell interpretation (defense-in-depth terhadap command injection).
- Endpoint status/download job punya ownership check - gak bisa sembarangan
  akses job ID orang lain walau ke-tebak UUID-nya.
