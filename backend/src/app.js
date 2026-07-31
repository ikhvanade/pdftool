const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const pdfRoutes = require('./routes/pdf.routes');
const qrRoutes = require('./routes/qr.routes');
const historyRoutes = require('./routes/history.routes');
const presetsRoutes = require('./routes/presets.routes');
const guestRoutes = require('./routes/guest.routes');
const activityRoutes = require('./routes/activity.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser(env.cookieSecret)); // secret buat signed cookie (guest_token)

// Gambar yang di-upload user buat fitur "QR dari gambar" - HARUS publik &
// bisa diakses dari mana aja (siapapun yang scan QR-nya, dari device/browser
// apapun). helmet() defaultnya set Cross-Origin-Resource-Policy: same-origin
// yang bakal MEMBLOKIR akses cross-origin ke gambar ini - di-override khusus
// buat path ini.
app.use(
  '/uploads/qr-images',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(env.storage.dir, 'qr-images'))
);

app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

app.use('/api/auth', authRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/presets', presetsRoutes);
app.use('/api/guest', guestRoutes);
app.use('/api/activity', activityRoutes);

// 404 buat route yang gak match
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'ENDPOINT_NOT_FOUND' });
});

// Error handler WAJIB paling akhir
app.use(errorHandler);

module.exports = app;
