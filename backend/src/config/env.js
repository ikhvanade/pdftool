require('dotenv').config();

function required(key) {
  const val = process.env[key];
  if (!val) {
    throw new Error(`[env] Missing required env var: ${key}. Cek .env kamu, contoh ada di .env.example`);
  }
  return val;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3003', 10),

  db: {
    host: required('DB_HOST'),
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME'),
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  },

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  cookieSecret: required('COOKIE_SECRET'),

  guestQuotaLimit: parseInt(process.env.GUEST_QUOTA_LIMIT || '5', 10),

  storage: {
    dir: process.env.STORAGE_DIR || './storage',
    retentionDays: parseInt(process.env.FILE_RETENTION_DAYS || '7', 10),
    maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB || '50', 10),
  },

  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',

  // Base URL publik server ini (misal https://pdftool.vannlabs.web.id) -
  // dipake buat generate link ke gambar yang di-upload user (fitur QR dari
  // gambar). WAJIB di-set manual di .env karena server gak selalu bisa nebak
  // domain publiknya sendiri dengan benar (apalagi di belakang Cloudflare
  // Tunnel/reverse proxy).
  publicUrl: process.env.PUBLIC_URL || null,
};
