const QRCode = require('qrcode');
const { z } = require('zod');
const { ok, fail } = require('../utils/response');
const pool = require('../config/db');

// Palette hex dari design.md - dipakai buat batasi warna default,
// tapi PRD §6.3 bilang "custom hex" juga boleh, jadi kita validasi format hex-nya
// aja (bukan wajib dari 4 warna ini), biar user tetap bisa custom.
const hexColorRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

const generateSchema = z.object({
  text: z.string().min(1, 'Text/URL wajib diisi').max(2000),
  darkColor: z.string().regex(hexColorRegex).default('#222831'),
  lightColor: z.string().regex(hexColorRegex).default('#DFD0B8'),
  format: z.enum(['png', 'svg']).default('png'),
});

async function generate(req, res, next) {
  try {
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { text, darkColor, lightColor, format } = parsed.data;

    const options = {
      color: { dark: darkColor, light: lightColor },
      width: 512,
      margin: 2,
    };

    let output;
    if (format === 'svg') {
      output = await QRCode.toString(text, { ...options, type: 'svg' });
    } else {
      output = await QRCode.toDataURL(text, options); // base64 data URL
    }

    if (req.incrementGuestUsage) await req.incrementGuestUsage();

    if (req.user) {
      await pool.execute(
        `INSERT INTO activity_log (user_id, tool_type, file_name, action) VALUES (?, 'qr_generate', NULL, 'generate')`,
        [req.user.id]
      );
    }

    return ok(res, { format, output });
  } catch (err) {
    next(err);
  }
}

module.exports = { generate };
