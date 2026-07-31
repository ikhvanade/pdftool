const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const sharp = require('sharp');
const { z } = require('zod');
const { ok, fail } = require('../utils/response');
const pool = require('../config/db');
const env = require('../config/env');

// Palette hex dari design.md - dipakai buat batasi warna default,
// tapi PRD §6.3 bilang "custom hex" juga boleh, jadi kita validasi format hex-nya
// aja (bukan wajib dari 4 warna ini), biar user tetap bisa custom.
const hexColorRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

async function embedLogo(qrBuffer, logoBase64, qrSizePx) {
  const matches = logoBase64.match(/^data:(image\/(?:png|jpeg|jpg));base64,(.+)$/);
  if (!matches) {
    throw new Error('LOGO_FORMAT_INVALID');
  }
  const logoBuffer = Buffer.from(matches[2], 'base64');

  // Logo di-resize ke ~22% lebar QR - proporsi aman biar QR masih ke-scan
  // (dikombinasi errorCorrectionLevel 'H' yang di-set di generateQrImage()).
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

// Helper bersama dipake `generate` (encode text/URL) DAN `generateFromImage`
// (encode URL publik gambar yang di-upload) - biar logic QR+logo compositing
// gak duplikat di 2 tempat.
async function generateQrImage({ text, darkColor, lightColor, format, logoBase64 }) {
  const qrSizePx = 512;
  const options = {
    color: { dark: darkColor, light: lightColor },
    width: qrSizePx,
    margin: 2,
    errorCorrectionLevel: logoBase64 ? 'H' : 'M',
  };

  if (format === 'svg') {
    // Logo embed BELUM didukung buat SVG - diabaikan dengan senyap kalau
    // dikirim, karena compositing raster image ke SVG butuh implementasi
    // terpisah (encode sebagai <image> tag base64 di dalam SVG).
    const svg = await QRCode.toString(text, { ...options, type: 'svg' });
    return svg;
  }

  const qrBuffer = await QRCode.toBuffer(text, options);
  const finalBuffer = logoBase64 ? await embedLogo(qrBuffer, logoBase64, qrSizePx) : qrBuffer;
  return `data:image/png;base64,${finalBuffer.toString('base64')}`;
}

async function logQrActivity(req) {
  if (!req.user) return;
  pool
    .execute(
      `INSERT INTO activity_log (user_id, tool_type, file_name, action) VALUES (?, 'qr_generate', NULL, 'generate')`,
      [req.user.id]
    )
    .catch((err) => console.error('[activity_log] Gagal insert:', err.message));
}

const generateSchema = z.object({
  text: z.string().min(1, 'Text/URL wajib diisi').max(2000),
  darkColor: z.string().regex(hexColorRegex).default('#222831'),
  lightColor: z.string().regex(hexColorRegex).default('#DFD0B8'),
  format: z.enum(['png', 'svg']).default('png'),
  // Logo base64 data URL (misal "data:image/png;base64,...") - opsional,
  // CUMA didukung buat format PNG. Dibatasi ~1.4MB base64 (~1MB file asli)
  // biar gak ada yang kirim gambar raksasa lewat JSON body.
  logoBase64: z.string().max(1_400_000).nullable().optional(),
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

    const output = await generateQrImage(parsed.data);

    if (req.incrementGuestUsage) await req.incrementGuestUsage();
    logQrActivity(req); // non-blocking, jangan tunda response

    return ok(res, { format: parsed.data.format, output });
  } catch (err) {
    if (err.message === 'LOGO_FORMAT_INVALID') {
      return fail(res, 'LOGO_FORMAT_INVALID', 400);
    }
    next(err);
  }
}

const generateFromImageBodySchema = z.object({
  darkColor: z.string().regex(hexColorRegex).default('#222831'),
  lightColor: z.string().regex(hexColorRegex).default('#DFD0B8'),
  format: z.enum(['png', 'svg']).default('png'),
});

// Fitur "QR dari gambar" - upload gambar -> disimpan di server -> dapet URL
// publik -> URL itu yang di-encode ke QR (BUKAN gambar mentahnya, karena QR
// code gak punya kapasitas buat nyimpen data sebesar file gambar - lihat
// penjelasan yang udah didiskusikan sebelumnya).
async function generateFromImage(req, res, next) {
  try {
    if (!req.file) return fail(res, 'NO_FILE_UPLOADED', 400);

    const parsed = generateFromImageBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    if (!env.publicUrl) {
      return fail(res, 'PUBLIC_URL_NOT_CONFIGURED', 500);
    }

    // Simpen ke files_temp biar ke-track cleanup cron (retention policy sama
    // kayak file PDF - lihat scripts/cleanup-expired-files.js)
    const expiresAt = new Date(Date.now() + env.storage.retentionDays * 24 * 60 * 60 * 1000);
    await pool.execute(
      'INSERT INTO files_temp (user_id, file_path, expires_at) VALUES (?, ?, ?)',
      [req.user ? req.user.id : null, req.file.path, expiresAt]
    );

    const imageUrl = `${env.publicUrl}/uploads/qr-images/${path.basename(req.file.path)}`;
    const output = await generateQrImage({ ...parsed.data, text: imageUrl });

    if (req.incrementGuestUsage) await req.incrementGuestUsage();
    logQrActivity(req);

    return ok(res, { format: parsed.data.format, output, imageUrl });
  } catch (err) {
    next(err);
  }
}

module.exports = { generate, generateFromImage };
