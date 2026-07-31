const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const env = require('./env');

// Folder terpisah dari upload PDF, dan folder ini PUBLIC (di-serve statis
// lewat express.static di app.js) karena isinya gambar yang HARUS bisa
// diakses siapapun yang scan QR - beda dari storage/uploads yang private.
const qrImageDir = path.join(env.storage.dir, 'qr-images');
fs.mkdirSync(qrImageDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, qrImageDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB cukup buat foto biasa
  fileFilter: (req, file, cb) => {
    if (!['image/png', 'image/jpeg'].includes(file.mimetype)) {
      return cb(new Error('ONLY_IMAGE_ALLOWED'));
    }
    cb(null, true);
  },
});

module.exports = uploadImage;
