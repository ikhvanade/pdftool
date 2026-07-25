const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { ok, fail } = require('../utils/response');
const { enqueueJob } = require('../jobs/pdfJobQueue');

// Endpoint ini SENGAJA gak langsung proses & return hasilnya di response yang sama.
// Compress/convert itu CPU-bound - kalau diproses sync di request handler,
// request lain (termasuk login user lain) bisa ke-block. Lihat catatan review awal.
//
// Flow: client upload -> server bikin job row (status pending) -> return job_id ->
// job diproses di background (worker_threads/child_process, lihat jobs/pdfJobQueue.js) ->
// client polling GET /api/pdf/jobs/:id sampe status = done, lalu download.

async function compress(req, res, next) {
  try {
    if (!req.file) {
      return fail(res, 'NO_FILE_UPLOADED', 400);
    }

    const jobId = uuidv4();
    const level = req.body.level || 'medium'; // low | medium | high

    await pool.execute(
      `INSERT INTO processing_jobs (id, user_id, guest_token, job_type, status, input_path)
       VALUES (?, ?, ?, 'pdf_compress', 'pending', ?)`,
      [jobId, req.user ? req.user.id : null, req.guestToken || null, req.file.path]
    );

    enqueueJob({ jobId, type: 'pdf_compress', inputPath: req.file.path, options: { level } });

    // Increment guest usage di sini karena job SUDAH diterima & antri
    // (bukan nunggu selesai proses, karena bisa makan waktu lama).
    // Kalau job gagal, ini tetap kehitung - trade-off yang wajar buat guest quota.
    if (req.incrementGuestUsage) await req.incrementGuestUsage();

    return ok(res, { jobId, status: 'pending' }, 202);
  } catch (err) {
    next(err);
  }
}

async function convert(req, res, next) {
  try {
    if (!req.file) {
      return fail(res, 'NO_FILE_UPLOADED', 400);
    }

    const jobId = uuidv4();
    const targetFormat = req.body.format || 'png'; // png | jpg

    await pool.execute(
      `INSERT INTO processing_jobs (id, user_id, guest_token, job_type, status, input_path)
       VALUES (?, ?, ?, 'pdf_convert', 'pending', ?)`,
      [jobId, req.user ? req.user.id : null, req.guestToken || null, req.file.path]
    );

    enqueueJob({ jobId, type: 'pdf_convert', inputPath: req.file.path, options: { targetFormat } });

    if (req.incrementGuestUsage) await req.incrementGuestUsage();

    return ok(res, { jobId, status: 'pending' }, 202);
  } catch (err) {
    next(err);
  }
}

async function getJobStatus(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      'SELECT id, job_type, status, output_path, error_message, created_at, updated_at FROM processing_jobs WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return fail(res, 'JOB_NOT_FOUND', 404);
    return ok(res, rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { compress, convert, getJobStatus };
