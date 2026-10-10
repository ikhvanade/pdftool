const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const pool = require('../config/db');
const { ok, fail } = require('../utils/response');
const { enqueueImageJob } = require('../jobs/imageJobQueue');

function isJobOwner(job, req) {
  if (req.user) return job.user_id === req.user.id;
  if (req.guestToken) return job.guest_token === req.guestToken;
  return false;
}

async function createJob(req, res, type, options) {
  if (!req.files || req.files.length === 0) return fail(res, 'NO_FILE_UPLOADED', 400);
  const jobId = uuidv4();

  await pool.execute(
    `INSERT INTO processing_jobs (id, user_id, guest_token, job_type, status, input_path) VALUES (?, ?, ?, ?, 'pending', ?)`,
    [jobId, req.user ? req.user.id : null, req.guestToken || null, type, req.files[0].path]
  );

  enqueueImageJob({
    jobId, type,
    files: req.files.map((f) => ({ path: f.path, originalName: f.originalname })),
    options,
    userId: req.user ? req.user.id : null,
    originalName: req.files.length === 1 ? req.files[0].originalname : `${req.files.length} file`,
  });

  if (req.incrementGuestUsage) await req.incrementGuestUsage();
  return ok(res, { jobId, status: 'pending' }, 202);
}

const compressSchema = z.object({ preset: z.enum(['normal', 'sedang', 'ekstrim']).default('sedang') });

async function compress(req, res, next) {
  try {
    const parsed = compressSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
    }
    await createJob(req, res, 'image_compress', parsed.data);
  } catch (err) {
    next(err);
  }
}

const resizeSchema = z.object({
  printSize: z.enum(['2x3', '3x4', '4x6']).optional(),
  customWidth: z.coerce.number().int().positive().max(10000).optional(),
  customHeight: z.coerce.number().int().positive().max(10000).optional(),
}).refine((d) => d.printSize || (d.customWidth && d.customHeight), {
  message: 'Wajib pilih printSize ATAU isi customWidth+customHeight',
});

async function resize(req, res, next) {
  try {
    const parsed = resizeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
    }
    await createJob(req, res, 'image_resize', parsed.data);
  } catch (err) {
    next(err);
  }
}

const convertSchema = z.object({ format: z.enum(['jpeg', 'png', 'webp']) });

async function convert(req, res, next) {
  try {
    const parsed = convertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
    }
    await createJob(req, res, 'image_convert', parsed.data);
  } catch (err) {
    next(err);
  }
}

async function getJobStatus(req, res, next) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, user_id, guest_token, job_type, status, output_path, error_message, created_at, updated_at FROM processing_jobs WHERE id = ? LIMIT 1',
      [req.params.id]
    );
    if (rows.length === 0) return fail(res, 'JOB_NOT_FOUND', 404);
    const job = rows[0];
    if (!isJobOwner(job, req)) return fail(res, 'FORBIDDEN', 403);
    delete job.user_id; delete job.guest_token;
    return ok(res, job);
  } catch (err) {
    next(err);
  }
}

async function downloadJob(req, res, next) {
  try {
    const [rows] = await pool.execute('SELECT * FROM processing_jobs WHERE id = ? LIMIT 1', [req.params.id]);
    if (rows.length === 0) return fail(res, 'JOB_NOT_FOUND', 404);
    const job = rows[0];
    if (!isJobOwner(job, req)) return fail(res, 'FORBIDDEN', 403);
    if (job.status !== 'done') return fail(res, 'JOB_NOT_READY', 409);
    return res.download(job.output_path);
  } catch (err) {
    next(err);
  }
}

module.exports = { compress, resize, convert, getJobStatus, downloadJob };
