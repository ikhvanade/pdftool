# Frontend - CozyDash (PDF Toolkit & QR Generator)

## Setup
```bash
npm install
npm run dev      # dev server, port 5173, proxy /api -> localhost:3003
npm run build    # production build -> dist/
```

## Struktur folder (sesuai CLAUDE.md)
```
src/
  components/       # Shared: AppShell, Sidebar, TopBar, Button, Card, ProtectedRoute
  features/
    auth/           # LoginPage + LoginForm
    dashboard/      # DashboardPage + ToolCard, RecentlyUsedCarousel, StatsWidget, TipsWidget
    pdf-toolkit/     # PdfToolkitPage + Compress/Convert/Protect/ComingSoon panel, usePdfJob hook
    qr-generator/    # QrGeneratorPage + QrInputPanel, QrPreviewPanel
    history/        # HistoryPage + HistoryFilters, HistoryTable
    settings/       # SettingsPage + ProfileSection, PresetsSection, SecuritySection
  lib/api.js        # Axios client, semua fungsi manggil endpoint backend
  store/authStore.js # Zustand - token & user state
  styles/index.css
```

## Status implementasi - FULL tested end-to-end (backend + frontend jalan bareng)
Sudah jalan & wired ke backend beneran:
- Login/logout (JWT) via `/api/auth/*`
- Guest quota badge (live dari `/api/guest/quota`)
- PDF Compress/Convert/Protect - upload, job polling, download (wired ke `/api/pdf/*`)
- QR Generator - live preview CLIENT-SIDE (pake lib `qrcode`, gak kena quota),
  export/download manggil backend `/api/qr/generate` (baru di sini kena quota + history)
- History - list, filter, delete (wired ke `/api/history`)
- Presets - default level compress (wired ke `/api/presets`)

## Keputusan desain yang beda dari Stitch asli (dikonfirmasi user)
1. Widget "Upgrade ke Pro" di dashboard DIHAPUS (kontradiksi PRD - gratis selamanya),
   diganti widget "100% Privat".
2. Font heading pakai **Epilogue** (bukan "Goat Font" - user gak punya file fontnya).
3. Palette disederhanain ke 4 token resmi `design.md` (base-dark, surface,
   accent-muted, highlight) + error/success - BUKAN ~30 token Material Design 3
   dari hasil Stitch mentah.
4. Live QR preview dipindah ke client-side (bukan manggil backend tiap keystroke)
   supaya gak nguras guest quota.

## Belum diimplementasi (jujur, bukan silent fail)
- **Merge/Split/Watermark PDF** - placeholder "Coming Soon". Ini rencananya
  client-side pakai `pdf-lib` di browser (sesuai PRD §6.2), belum dikerjakan.
- **Ganti password** - form ada di Settings tapi di-disable, backend endpoint-nya
  belum ada.
- **Preset warna QR default** - struktur backend udah support (`tool_type: qr_generate`),
  tapi belum ada form UI-nya di Settings.
- **Accent intensity slider / adaptive card ordering** (hyper-personalization
  §6.4, priority Could) - belum diimplementasi.

## Known vulnerability (accepted risk, didokumentasikan)
`npm audit` bakal nunjukin 4 vulnerability:
- `esbuild` (moderate, DEV-ONLY) - cuma exploitable kalau dev server ke-expose
  ke internet. Fix butuh Vite v7/v8 (breaking change). Aman selama dev server
  cuma diakses lokal/internal network.
- `react-router` (high, RSC Mode CSRF) - vuln ini spesifik ke React Server
  Components mode, yang SAMA SEKALI GAK dipakai di project ini (kita pure
  client-side SPA pakai BrowserRouter biasa). Non-issue buat attack surface kita,
  tapi dicatat di sini biar transparan.

## Deployment (Nginx + build statis)
```bash
npm run build
# copy isi dist/ ke server, serve via Nginx (sesuai CLAUDE.md deployment notes)
# Nginx config: route /api/* ke backend port 3003, sisanya serve dist/ sebagai static
```
