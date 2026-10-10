const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const env = require('./env');

// Folder buat gambar QR upload - HARUS public (di-serve statis) karena
// dipake fitur "QR dari gambar" yang linknya wajib bisa diakses siapapun.
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
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!['image/png', 'image/jpeg'].includes(file.mimetype)) return cb(new Error('ONLY_IMAGE_ALLOWED'));
    cb(null, true);
  },
});

module.exports = uploadImage;
