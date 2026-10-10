const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('./env');

async function run() {
  const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  const connection = await mysql.createConnection({
    host: env.db.host, port: env.db.port, user: env.db.user,
    password: env.db.password, database: env.db.database, multipleStatements: true,
  });

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`[migrate] Running ${file} ...`);
      await connection.query(sql);
      console.log(`[migrate] Done: ${file}`);
    }
    console.log('[migrate] All migrations applied.');
  } finally {
    await connection.end();
  }
}

run().catch((err) => { console.error('[migrate] Failed:', err); process.exit(1); });
