const QRCode = require('qrcode');
const sharp = require('sharp');
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
  // Logo base64 data URL (misal "data:image/png;base64,...") - opsional,
  // CUMA didukung buat format PNG (embed di SVG butuh effort beda, belum
  // diimplementasi di v1 ini). Dibatasi ~1.4MB base64 (~1MB file asli)
  // biar gak ada yang kirim gambar raksasa lewat JSON body.
  logoBase64: z.string().max(1_400_000).nullable().optional(),
});

async function embedLogo(qrBuffer, logoBase64, qrSizePx) {
  const matches = logoBase64.match(/^data:(image\/(?:png|jpeg|jpg));base64,(.+)$/);
  if (!matches) {
    throw new Error('LOGO_FORMAT_INVALID');
  }
  const logoBuffer = Buffer.from(matches[2], 'base64');

  // Logo di-resize ke ~22% lebar QR - proporsi aman biar QR masih ke-scan
  // (dikombinasi errorCorrectionLevel 'H' yang di-set di generate()).
  const logoSize = Math.round(qrSizePx * 0.22);
  const resizedLogo = await sharp(logoBuffer)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  const offset = Math.round((qrSizePx - logoSize) / 2);

  return sharp(qrBuffer)
    .composite([{ input: resizedLogo, left: offset, top: offset }])
    .png()
    .toBuffer();
}

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

    const { text, darkColor, lightColor, format, logoBase64 } = parsed.data;
    const qrSizePx = 512;

    const options = {
      color: { dark: darkColor, light: lightColor },
      width: qrSizePx,
      margin: 2,
      // Kalau ada logo, naikin error correction ke 'H' (30% toleransi rusak)
      // biar QR tetap ke-scan walau sebagian ke-tutup logo di tengah.
      errorCorrectionLevel: logoBase64 ? 'H' : 'M',
    };

    let output;
    if (format === 'svg') {
      // Logo embed BELUM didukung buat SVG - diabaikan dengan senyap kalau
      // dikirim, karena compositing raster image ke SVG butuh implementasi
      // terpisah (encode sebagai <image> tag base64 di dalam SVG).
      output = await QRCode.toString(text, { ...options, type: 'svg' });
    } else {
      const qrBuffer = await QRCode.toBuffer(text, options);
      const finalBuffer = logoBase64 ? await embedLogo(qrBuffer, logoBase64, qrSizePx) : qrBuffer;
      output = `data:image/png;base64,${finalBuffer.toString('base64')}`;
    }

    if (req.incrementGuestUsage) await req.incrementGuestUsage();

    // Non-blocking - jangan tunda response cuma buat nunggu insert history
    // kelar (ini yang bikin export QR kerasa lambat sebelumnya).
    if (req.user) {
      pool
        .execute(
          `INSERT INTO activity_log (user_id, tool_type, file_name, action) VALUES (?, 'qr_generate', NULL, 'generate')`,
          [req.user.id]
        )
        .catch((err) => console.error('[activity_log] Gagal insert:', err.message));
    }

    return ok(res, { format, output });
  } catch (err) {
    if (err.message === 'LOGO_FORMAT_INVALID') {
      return fail(res, 'LOGO_FORMAT_INVALID', 400);
    }
    next(err);
  }
}

module.exports = { generate };
