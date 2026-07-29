const { z } = require('zod');
const pool = require('../config/db');
const { ok } = require('../utils/response');

// Endpoint ini KHUSUS buat operasi yang diproses 100% di client (merge/split/
// watermark pake pdf-lib di browser) - backend gak pernah "tau" operasi itu
// kejadian karena gak ada file yang diupload/diproses di server. Makanya perlu
// endpoint terpisah biar tetep kecatet di activity_log & muncul di history/stats/chart.
//
// TIDAK ada guestQuotaCheck di sini SENGAJA - operasi client-side memang
// unlimited buat semua orang (gak makan resource server), quota cuma berlaku
// buat operasi yang beneran diproses backend (compress/convert/protect/qr).
// Endpoint ini requireAuth karena guest emang gak dapet history tersimpan
// (sesuai PRD §6.1 & §6.6).

const logSchema = z.object({
  tool_type: z.enum(['pdf_merge', 'pdf_split', 'pdf_watermark']),
  file_name: z.string().max(255).nullable().optional(),
});

async function logActivity(req, res, next) {
  try {
    const parsed = logSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        details: parsed.error.flatten().fieldErrors,
      });
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
