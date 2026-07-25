// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  if (err.name === 'ZodError') {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', details: err.errors });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, error: 'FILE_TOO_LARGE' });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'INTERNAL_SERVER_ERROR' : err.message;
  return res.status(status).json({ success: false, error: message });
}

module.exports = errorHandler;
