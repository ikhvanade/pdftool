const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const env = require('./env');

const uploadDir = path.join(env.storage.dir, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// diskStorage = streaming ke disk, TIDAK load full file ke memory.
// Ini yang dimaksud rule #4 CLAUDE.md: "file upload besar wajib streaming".
// multer.memoryStorage() akan melanggar rule ini untuk file >20MB.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.storage.maxUploadMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('ONLY_PDF_ALLOWED'));
    }
    cb(null, true);
  },
});

module.exports = upload;
