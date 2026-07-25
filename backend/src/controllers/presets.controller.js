const { z } = require('zod');
const pool = require('../config/db');
const { ok, fail } = require('../utils/response');

const presetSchema = z.object({
  tool_type: z.enum(['pdf_compress', 'qr_generate']),
  config_json: z.record(z.any()),
  is_default: z.boolean().optional().default(false),
});

async function list(req, res, next) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, tool_type, config_json, is_default, created_at FROM presets WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const parsed = presetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        details: parsed.error.flatten().fieldErrors,
      });
    }
    const { tool_type, config_json, is_default } = parsed.data;

    // Kalau di-set sebagai default, unset default lain buat tool_type yang sama dulu
    if (is_default) {
      await pool.execute(
        'UPDATE presets SET is_default = FALSE WHERE user_id = ? AND tool_type = ?',
        [req.user.id, tool_type]
      );
    }

    const [result] = await pool.execute(
      'INSERT INTO presets (user_id, tool_type, config_json, is_default) VALUES (?, ?, ?, ?)',
      [req.user.id, tool_type, JSON.stringify(config_json), is_default]
    );

    return ok(res, { id: result.insertId }, 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };
