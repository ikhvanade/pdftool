const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const userModel = require('../models/user.model');
const pool = require('../config/db');
const env = require('../config/env');
const { ok, fail } = require('../utils/response');

// PENTING: file ini SENGAJA tidak punya fungsi `register`.
// Sesuai CLAUDE.md rule #8 - akun cuma dibuat manual lewat scripts/create-user.js.
// Jangan tambahin endpoint register di sini tanpa konfirmasi eksplisit dari user.

const loginSchema = z.object({
  identifier: z.string().min(1, 'Username/email wajib diisi'), // username ATAU email
  password: z.string().min(1, 'Password wajib diisi'),
});

async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { identifier, password } = parsed.data;
    const user = await userModel.findByUsernameOrEmail(identifier);

    // Selalu compare bcrypt walau user gak ketemu, hindari timing attack
    // yang bisa dipake buat enumerasi username valid vs tidak.
    const dummyHash = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8lHwYzZm.QRWSbP0m1EJHf1jvbdX7O';
    const passwordHash = user ? user.password_hash : dummyHash;
    const isValid = await bcrypt.compare(password, passwordHash);

    if (!user || !isValid) {
      return fail(res, 'INVALID_CREDENTIALS', 401);
    }

    const token = jwt.sign(
      { sub: user.id, username: user.username },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );

    return ok(res, {
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

// Stateless JWT -> logout ini cuma formalitas di server (client yang buang token).
// Lihat catatan review: kalau butuh proper invalidation, perlu token blacklist table.
async function logout(req, res) {
  return ok(res, { message: 'Logged out' });
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
});

async function changePassword(req, res, next) {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        details: parsed.error.flatten().fieldErrors,
      });
    }
    const { currentPassword, newPassword } = parsed.data;

    // req.user di-attach oleh middleware requireAuth (lihat auth.routes.js)
    const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return fail(res, 'USER_NOT_FOUND', 404);

    const isValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isValid) return fail(res, 'CURRENT_PASSWORD_INCORRECT', 401);

    const newHash = await bcrypt.hash(newPassword, 10);
    await userModel.updatePasswordHash(req.user.id, newHash);

    // Catatan: karena JWT stateless, token yang lagi dipake di device lain
    // TETEP valid sampe expire (7 hari) walau password udah diganti. Ini
    // trade-off yang sama kayak logout - kalau butuh invalidate semua sesi
    // lain pas ganti password, perlu token blacklist/versioning (belum ada di v1).
    return ok(res, { message: 'Password berhasil diganti' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, changePassword };
