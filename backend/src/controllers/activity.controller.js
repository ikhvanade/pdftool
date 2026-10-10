const { z } = require('zod');
const pool = require('../config/db');
const { ok } = require('../utils/response');

// Endpoint khusus buat operasi client-side (merge/split/watermark PDF,
// image-to-pdf) yang gak lewat backend processing, jadi gak otomatis
// kecatet - lihat diskusi bug sebelumnya soal history gak muncul.
const logSchema = z.object({
  tool_type: z.enum(['pdf_merge', 'pdf_split', 'pdf_watermark', 'image_to_pdf']),
  file_name: z.string().max(255).nullable().optional(),
});

async function logActivity(req, res, next) {
  try {
    const parsed = logSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
    }
    const { tool_type, file_name } = parsed.data;
    await pool.execute(
      `INSERT INTO activity_log (user_id, tool_type, file_name, action) VALUES (?, ?, ?, 'process')`,
      [req.user.id, tool_type, file_name || null]
    );
    return ok(res, { logged: true }, 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { logActivity };
