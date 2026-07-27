#!/usr/bin/env node
// Jalanin via OS cron (BUKAN setInterval di dalam app), konsisten sama pola
// cron existing (mysqldump dkk). Contoh crontab, jalan tiap jam:
//   0 * * * * cd /path/ke/backend && /usr/bin/node scripts/cleanup-expired-files.js >> logs/cleanup.log 2>&1
//
// Yang dibersihin:
// 1. files_temp yang expired (kalau ada yang isi tabel ini)
// 2. processing_jobs (+ file input/output-nya di disk) yang lebih tua dari
//    FILE_RETENTION_DAYS - ini tempat file compress/convert/protect beneran
//    disimpen di v1 (bukan lewat files_temp).

const fs = require('fs');
const pool = require('../src/config/db');
const env = require('../src/config/env');

function safeUnlink(filePath) {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error(`[cleanup] Gagal hapus file ${filePath}:`, err.message);
  }
}

async function cleanupFilesTemp() {
  const [rows] = await pool.execute(
    'SELECT id, file_path FROM files_temp WHERE expires_at < NOW()'
  );
  for (const row of rows) {
    safeUnlink(row.file_path);
  }
  if (rows.length > 0) {
    await pool.execute('DELETE FROM files_temp WHERE expires_at < NOW()');
  }
  console.log(`[cleanup] files_temp: ${rows.length} entry expired dibersihin`);
}

async function cleanupProcessingJobs() {
  const [rows] = await pool.query(
    `SELECT id, input_path, output_path FROM processing_jobs
     WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [env.storage.retentionDays]
  );

  for (const row of rows) {
    safeUnlink(row.input_path);
    safeUnlink(row.output_path);
  }

  if (rows.length > 0) {
    const ids = rows.map((r) => r.id);
    await pool.query(
      `DELETE FROM processing_jobs WHERE id IN (${ids.map(() => '?').join(',')})`,
      ids
    );
  }
  console.log(`[cleanup] processing_jobs: ${rows.length} job lama (>${env.storage.retentionDays} hari) dibersihin`);
}

async function main() {
  try {
    await cleanupFilesTemp();
    await cleanupProcessingJobs();
  } catch (err) {
    console.error('[cleanup] Error:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
