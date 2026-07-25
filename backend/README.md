# Backend - PDF Toolkit & QR Generator Dashboard

## Setup cepat
```bash
npm install
cp .env.example .env
# edit .env - isi DB credential, JWT_SECRET (random), COOKIE_SECRET (random, beda dari JWT_SECRET)

npm run migrate          # bikin semua tabel di MariaDB
npm run create-user -- --username=admin --email=admin@example.com --password=passwordkuat123

npm run dev               # dev mode (nodemon)
# atau production:
pm2 start ecosystem.config.js
```

## Status implementasi (per sesi ini)
Sudah jalan:
- Auth: login/logout (JWT), TANPA endpoint register (sesuai aturan keras)
- guestQuotaCheck middleware - persis sesuai spek CLAUDE.md, atomic increment
- PDF compress - job-based (worker_threads), TAPI kompresi masih pakai pdf-lib re-save
  (efeknya TIPIS - lihat TODO di src/jobs/pdfWorker.js soal Ghostscript)
- PDF convert - endpoint & job flow ada, TAPI actual conversion BELUM diimplementasi
  (butuh keputusan: poppler-utils `pdftoppm` atau lib lain)
- QR generate - full jalan (qrcode npm lib), server-side biar kena guest quota + activity log
- History & Presets - full CRUD dasar, khusus user login
- Migration schema lengkap + processing_jobs table (tambahan dari draft PRD)

Belum/sengaja di-skip (butuh konfirmasi/keputusan lo dulu):
- PDF merge/split/watermark/preview -> ini emang client-side per PRD, gak ada di backend
- PDF protect/unlock (password-protect) -> pdf-lib gak bisa, butuh qpdf/muhammara
- Token blacklist buat proper JWT logout invalidation
- Retention cleanup cron buat files_temp yang expired
- File download endpoint buat hasil job (sekarang cuma return output_path internal)

## Kenapa compress/convert job-based, bukan langsung proses?
CPU-bound operation kalau diproses sync bakal block Node event loop (single-threaded),
jadi request lain ikut nge-lag. Solusinya: terima file -> return job_id -> proses di
worker_thread terpisah -> client polling GET /api/pdf/jobs/:id.
