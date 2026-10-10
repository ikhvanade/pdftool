#!/usr/bin/env node
const fs = require('fs');
const pool = require('../src/config/db');
const env = require('../src/config/env');

function safeUnlink(filePath) {
  if (!filePath) return;
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); }
  catch (err) { console.error(`[cleanup] Gagal hapus file ${filePath}:`, err.message); }
}

async function cleanupFilesTemp() {
  const [rows] = await pool.execute('SELECT id, file_path FROM files_temp WHERE expires_at < NOW()');
  for (const row of rows) safeUnlink(row.file_path);
  if (rows.length > 0) await pool.execute('DELETE FROM files_temp WHERE expires_at < NOW()');
  console.log(`[cleanup] files_temp: ${rows.length} entry expired dibersihin`);
}

async function cleanupProcessingJobs() {
  const [rows] = await pool.query(
    `SELECT id, input_path, output_path FROM processing_jobs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [env.storage.retentionDays]
  );
  for (const row of rows) { safeUnlink(row.input_path); safeUnlink(row.output_path); }
  if (rows.length > 0) {
    const ids = rows.map((r) => r.id);
    await pool.query(`DELETE FROM processing_jobs WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
  }
  console.log(`[cleanup] processing_jobs: ${rows.length} job lama dibersihin`);
}

async function main() {
  try { await cleanupFilesTemp(); await cleanupProcessingJobs(); }
  catch (err) { console.error('[cleanup] Error:', err); process.exitCode = 1; }
  finally { await pool.end(); }
}
main();
