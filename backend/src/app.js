const express = require('express');
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

const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser(env.cookieSecret)); // secret buat signed cookie (guest_token)

app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

app.use('/api/auth', authRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/presets', presetsRoutes);
app.use('/api/guest', guestRoutes);

// 404 buat route yang gak match
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'ENDPOINT_NOT_FOUND' });
});

// Error handler WAJIB paling akhir
app.use(errorHandler);

module.exports = app;
