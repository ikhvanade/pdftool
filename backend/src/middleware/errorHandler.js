// Error dari fileFilter multer (format file ditolak) itu error biasa tanpa
// .status, jadi dulu jatuh ke 500. Padahal itu kesalahan input user -> 400.
const CLIENT_ERRORS = {
  ONLY_PDF_ALLOWED: 'ONLY_PDF_ALLOWED',
  ONLY_IMAGE_ALLOWED: 'ONLY_IMAGE_ALLOWED',
  UNSUPPORTED_IMAGE_FORMAT: 'UNSUPPORTED_IMAGE_FORMAT',
};

function errorHandler(err, req, res, next) {
  if (err.name === 'ZodError') {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', details: err.errors });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, error: 'FILE_TOO_LARGE' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ success: false, error: 'TOO_MANY_FILES' });
  }
  if (CLIENT_ERRORS[err.message]) {
    return res.status(400).json({ success: false, error: CLIENT_ERRORS[err.message] });
  }

  console.error('[error]', err);
  const status = err.status || 500;
  const message = status === 500 ? 'INTERNAL_SERVER_ERROR' : err.message;
  return res.status(status).json({ success: false, error: message });
}

module.exports = errorHandler;
