// Static file server sederhana pake Express - alternatif dari `serve` CLI
// yang bermasalah parsing argument-nya di beberapa environment.
// SPA fallback pake app.use() TANPA path pattern (bukan app.get('*', ...)) -
// biar kompatibel baik di Express 4 maupun 5 (Express 5 ganti path-to-regexp
// yang gak lagi terima wildcard '*' polos).
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const DIST_DIR = path.join(__dirname, 'dist');

app.use(express.static(DIST_DIR));

// Fallback SPA - request apapun yang gak match file statis di atas, balikin index.html
app.use((req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[frontend-static] Serving ${DIST_DIR} on port ${PORT}`);
});
