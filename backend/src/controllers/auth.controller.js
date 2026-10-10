const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const userModel = require('../models/user.model');
const pool = require('../config/db');
const env = require('../config/env');
const { ok, fail } = require('../utils/response');

// PENTING: file ini SENGAJA tidak punya fungsi `register`.
// Sesuai CLAUDE.md rule #8 - akun cuma dibuat manual lewat scripts/create-user.js.

const loginSchema = z.object({
  identifier: z.string().min(1, 'Username/email wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
    }
    const { identifier, password } = parsed.data;
    const user = await userModel.findByUsernameOrEmail(identifier);

    const dummyHash = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8lHwYzZm.QRWSbP0m1EJHf1jvbdX7O';
    const passwordHash = user ? user.password_hash : dummyHash;
    const isValid = await bcrypt.compare(password, passwordHash);

    if (!user || !isValid) return fail(res, 'INVALID_CREDENTIALS', 401);

    const token = jwt.sign({ sub: user.id, username: user.username }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

    return ok(res, {
      token,
      user: {
        id: user.id, username: user.username, email: user.email,
        fullName: user.full_name, avatarPath: user.avatar_path, theme: user.theme,
      },
    });
  } catch (err) {
    next(err);
  }
}

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
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
    }
    const { currentPassword, newPassword } = parsed.data;

    const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return fail(res, 'USER_NOT_FOUND', 404);

    const isValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isValid) return fail(res, 'CURRENT_PASSWORD_INCORRECT', 401);

    const newHash = await bcrypt.hash(newPassword, 10);
    await userModel.updatePasswordHash(req.user.id, newHash);

    return ok(res, { message: 'Password berhasil diganti' });
  } catch (err) {
    next(err);
  }
}

const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter').max(50),
  email: z.string().email('Format email gak valid'),
  fullName: z.string().max(100).nullable().optional(),
});

async function updateProfile(req, res, next) {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
    }
    const { username, email, fullName } = parsed.data;

    try {
      await userModel.updateProfile(req.user.id, { username, email, fullName });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return fail(res, 'USERNAME_OR_EMAIL_TAKEN', 409);
      throw err;
    }

    // Username ikut di-sign ke JWT, jadi terbitin token baru biar frontend
    // gak perlu logout-login manual abis ganti username.
    const newToken = jwt.sign({ sub: req.user.id, username }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

    const updated = await userModel.findById(req.user.id);
    return ok(res, {
      token: newToken,
      user: {
        id: updated.id, username: updated.username, email: updated.email,
        fullName: updated.full_name, avatarPath: updated.avatar_path, theme: updated.theme,
      },
    });
  } catch (err) {
    next(err);
  }
}

const updateThemeSchema = z.object({ theme: z.enum(['light', 'dark']) });

// Theme disimpen per-user di DB (bukan cuma localStorage) sesuai
// design.md §2 "hyper-personalization... persisted per-user".
async function updateTheme(req, res, next) {
  try {
    const parsed = updateThemeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
    }
    await userModel.updateTheme(req.user.id, parsed.data.theme);
    return ok(res, { theme: parsed.data.theme });
  } catch (err) {
    next(err);
  }
}

async function updateAvatar(req, res, next) {
  try {
    if (!req.file) return fail(res, 'NO_FILE_UPLOADED', 400);
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    await userModel.updateAvatar(req.user.id, avatarPath);
    return ok(res, { avatarPath });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, changePassword, updateProfile, updateTheme, updateAvatar };
