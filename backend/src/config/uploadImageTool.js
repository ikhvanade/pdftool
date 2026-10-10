const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const env = require('./env');

// Multer khusus fitur Image Compressor/Resizer (PRD §6.7) - terima banyak
// file sekaligus (batch), format lebih luas dari uploadImage.js (yang itu
// khusus fitur QR-dari-gambar, PNG/JPEG doang).
const imageToolDir = path.join(env.storage.dir, 'uploads');
fs.mkdirSync(imageToolDir, { recursive: true });

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imageToolDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const uploadImageTool = multer({
  storage,
  limits: { fileSize: env.storage.maxUploadMb * 1024 * 1024, files: 20 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) return cb(new Error('UNSUPPORTED_IMAGE_FORMAT'));
    cb(null, true);
  },
});

module.exports = uploadImageTool;
