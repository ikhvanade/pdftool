const pool = require('../config/db');

async function findByUsernameOrEmail(identifier) {
  const [rows] = await pool.execute(
    'SELECT id, username, email, password_hash FROM users WHERE username = ? OR email = ? LIMIT 1',
    [identifier, identifier]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, username, email, created_at FROM users WHERE id = ? LIMIT 1',
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

module.exports = { findByUsernameOrEmail, findById, createUser, updatePasswordHash };
