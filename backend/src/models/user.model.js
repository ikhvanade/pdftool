const pool = require('../config/db');

async function findByUsernameOrEmail(identifier) {
  const [rows] = await pool.execute(
    'SELECT id, username, email, password_hash, full_name, avatar_path, theme FROM users WHERE username = ? OR email = ? LIMIT 1',
    [identifier, identifier]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, username, email, full_name, avatar_path, theme, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

async function createUser({ username, email, passwordHash }) {
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, passwordHash]
  );
  return result.insertId;
}

async function updatePasswordHash(userId, passwordHash) {
  await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
}

async function updateProfile(userId, { username, email, fullName }) {
  await pool.execute(
    'UPDATE users SET username = ?, email = ?, full_name = ? WHERE id = ?',
    [username, email, fullName ?? null, userId]
  );
}

async function updateAvatar(userId, avatarPath) {
  await pool.execute('UPDATE users SET avatar_path = ? WHERE id = ?', [avatarPath, userId]);
}

async function updateTheme(userId, theme) {
  await pool.execute('UPDATE users SET theme = ? WHERE id = ?', [theme, userId]);
}

module.exports = {
  findByUsernameOrEmail, findById, createUser,
  updatePasswordHash, updateProfile, updateAvatar, updateTheme,
};
