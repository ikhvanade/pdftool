#!/usr/bin/env node
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  });
  return args;
}

async function main() {
  const { username, email, password } = parseArgs();
  if (!username || !email || !password) {
    console.error('Usage: npm run create-user -- --username=xxx --email=xxx --password=xxx');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password minimal 8 karakter.');
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );
    console.log(`User created: id=${result.insertId}, username=${username}`);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') console.error('Username atau email sudah dipakai.');
    else console.error('Gagal bikin user:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}
main();
