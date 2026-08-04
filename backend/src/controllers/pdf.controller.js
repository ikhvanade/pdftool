const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const pool = require('../config/db');
const { ok, fail } = require('../utils/response');
const { enqueueJob } = require('../jobs/pdfJobQueue');

// Endpoint compress/convert/protect SENGAJA gak langsung proses & return
// hasilnya di response yang sama. Semua operasi ini CPU-bound - kalau
// diproses sync di request handler, request lain (termasuk login user lain)
// bisa ke-block. Lihat catatan review awal.
//
// Flow: client upload -> server bikin job row (status pending) -> return job_id ->
// job diproses di background (worker_threads, lihat jobs/pdfJobQueue.js) ->
// client polling GET /api/pdf/jobs/:id sampe status = done ->
// download via GET /api/pdf/download/:id

// Cek kepemilikan job: user login cuma boleh akses job miliknya sendiri,
// guest cuma boleh akses job dari guest_token yang sama (cookie yang sama).
// Tanpa ini, siapapun yang nebak/dapet job UUID orang lain bisa liat status,
// error message, bahkan download hasil PDF orang lain.
function isJobOwner(job, req) {
  if (req.user) return job.user_id === req.user.id;
  if (req.guestToken) return job.guest_token === req.guestToken;
  return false;
}

async function compress(req, res, next) {
  try {
    if (!req.file) return fail(res, 'NO_FILE_UPLOADED', 400);

    const level = ['low', 'medium', 'high'].includes(req.body.level) ? req.body.level : 'medium';
    const jobId = uuidv4();

    await pool.execute(
      `INSERT INTO processing_jobs (id, user_id, guest_token, job_type, status, input_path)
       VALUES (?, ?, ?, 'pdf_compress', 'pending', ?)`,
      [jobId, req.user ? req.user.id : null, req.guestToken || null, req.file.path]
    );

    enqueueJob({
      jobId,
      type: 'pdf_compress',
      inputPath: req.file.path,
      options: { level },
      userId: req.user ? req.user.id : null,
      originalName: req.file.originalname,
    });

    // Increment guest usage di sini karena job SUDAH diterima & antri
    // (bukan nunggu selesai proses, karena bisa makan waktu lama).
    if (req.incrementGuestUsage) await req.incrementGuestUsage();

    return ok(res, { jobId, status: 'pending' }, 202);
  } catch (err) {
    next(err);
  }
}

async function convert(req, res, next) {
  try {
    if (!req.file) return fail(res, 'NO_FILE_UPLOADED', 400);

    const targetFormat = ['png', 'jpg', 'jpeg'].includes(req.body.format) ? req.body.format : 'png';
    const jobId = uuidv4();

    await pool.execute(
      `INSERT INTO processing_jobs (id, user_id, guest_token, job_type, status, input_path)
       VALUES (?, ?, ?, 'pdf_convert', 'pending', ?)`,
      [jobId, req.user ? req.user.id : null, req.guestToken || null, req.file.path]
    );

    enqueueJob({
      jobId,
      type: 'pdf_convert',
      inputPath: req.file.path,
      options: { targetFormat },
      userId: req.user ? req.user.id : null,
      originalName: req.file.originalname,
    });

    if (req.incrementGuestUsage) await req.incrementGuestUsage();

    return ok(res, { jobId, status: 'pending' }, 202);
  } catch (err) {
    next(err);
  }
}

const protectSchema = z.object({
  password: z.string().min(4, 'Password minimal 4 karakter').max(128),
});

async function protect(req, res, next) {
  try {
    if (!req.file) return fail(res, 'NO_FILE_UPLOADED', 400);

    const parsed = protectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const jobId = uuidv4();

    await pool.execute(
      `INSERT INTO processing_jobs (id, user_id, guest_token, job_type, status, input_path)
       VALUES (?, ?, ?, 'pdf_protect', 'pending', ?)`,
      [jobId, req.user ? req.user.id : null, req.guestToken || null, req.file.path]
    );

    // Password CUMA dilempar ke worker in-memory, TIDAK PERNAH disimpan ke DB.
    enqueueJob({
      jobId,
      type: 'pdf_protect',
      inputPath: req.file.path,
      options: { password: parsed.data.password },
      userId: req.user ? req.user.id : null,
      originalName: req.file.originalname,
    });

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
      'SELECT id, user_id, guest_token, job_type, status, output_path, error_message, created_at, updated_at FROM processing_jobs WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return fail(res, 'JOB_NOT_FOUND', 404);

    const job = rows[0];
    if (!isJobOwner(job, req)) return fail(res, 'FORBIDDEN', 403);

    delete job.user_id;
    delete job.guest_token;
    return ok(res, job);
  } catch (err) {
    next(err);
  }
}

async function downloadJob(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      'SELECT * FROM processing_jobs WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return fail(res, 'JOB_NOT_FOUND', 404);

    const job = rows[0];
    if (!isJobOwner(job, req)) return fail(res, 'FORBIDDEN', 403);
    if (job.status !== 'done') return fail(res, 'JOB_NOT_READY', 409);

    return res.download(job.output_path);
  } catch (err) {
    next(err);
  }
}

async function toWord(req, res, next) {
  try {
    if (!req.file) return fail(res, 'NO_FILE_UPLOADED', 400);

    const jobId = uuidv4();

    await pool.execute(
      `INSERT INTO processing_jobs (id, user_id, guest_token, job_type, status, input_path)
       VALUES (?, ?, ?, 'pdf_to_word', 'pending', ?)`,
      [jobId, req.user ? req.user.id : null, req.guestToken || null, req.file.path]
    );

    enqueueJob({
      jobId,
      type: 'pdf_to_word',
      inputPath: req.file.path,
      options: {},
      userId: req.user ? req.user.id : null,
      originalName: req.file.originalname,
    });

    if (req.incrementGuestUsage) await req.incrementGuestUsage();

    return ok(res, { jobId, status: 'pending' }, 202);
  } catch (err) {
    next(err);
  }
}

module.exports = { compress, convert, protect, toWord, getJobStatus, downloadJob };
