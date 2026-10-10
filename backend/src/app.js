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
const imageRoutes = require('./routes/image.routes');
const historyRoutes = require('./routes/history.routes');
const presetsRoutes = require('./routes/presets.routes');
const guestRoutes = require('./routes/guest.routes');
const activityRoutes = require('./routes/activity.routes');

const app = express();

// WAJIB - server ini jalan di belakang Cloudflare Tunnel/reverse proxy.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser(env.cookieSecret));

// Gambar publik (QR-dari-gambar) & avatar user - perlu diakses browser langsung.
app.use('/uploads/qr-images', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(env.storage.dir, 'qr-images')));

app.use('/uploads/avatars', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(env.storage.dir, 'avatars')));

app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

app.use('/api/auth', authRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/presets', presetsRoutes);
app.use('/api/guest', guestRoutes);
app.use('/api/activity', activityRoutes);

app.use('/api', (req, res) => res.status(404).json({ success: false, error: 'ENDPOINT_NOT_FOUND' }));

app.use(errorHandler);

module.exports = app;
