const { Worker } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const CONCURRENCY = 2;
let activeCount = 0;
const queue = [];

function enqueueImageJob(job) {
  queue.push(job);
  processNext();
}

// processing_jobs.input_path cuma nyimpen file PERTAMA dari batch, jadi cleanup
// cron gak bakal nemu file ke-2 dst (bocor di storage/uploads selamanya).
// Solusi: input emang gak dibutuhin lagi setelah diproses -> hapus semua di sini.
function deleteInputs(job) {
  for (const f of job.files) {
    fs.promises.unlink(f.path).catch(() => {});
  }
}

async function processNext() {
  if (activeCount >= CONCURRENCY || queue.length === 0) return;
  const job = queue.shift();
  activeCount += 1;

  await pool.execute("UPDATE processing_jobs SET status = 'processing' WHERE id = ?", [job.jobId]);
  const worker = new Worker(path.join(__dirname, 'imageWorker.js'), { workerData: job });

  worker.on('message', async (result) => {
    if (result.success) {
      await pool.execute("UPDATE processing_jobs SET status = 'done', output_path = ? WHERE id = ?", [result.outputPath, job.jobId]);
      if (job.userId) {
        pool.execute(
          `INSERT INTO activity_log (user_id, tool_type, file_name, action) VALUES (?, ?, ?, 'process')`,
          [job.userId, job.type, job.originalName || null]
        ).catch((err) => console.error('[activity_log] Gagal insert:', err.message));
      }
    } else {
      await pool.execute("UPDATE processing_jobs SET status = 'failed', error_message = ? WHERE id = ?", [result.error, job.jobId]);
    }
    deleteInputs(job);
  });

  worker.on('error', async (err) => {
    await pool.execute("UPDATE processing_jobs SET status = 'failed', error_message = ? WHERE id = ?", [err.message, job.jobId]);
    deleteInputs(job);
  });

  worker.on('exit', () => { activeCount -= 1; processNext(); });
}

module.exports = { enqueueImageJob };
