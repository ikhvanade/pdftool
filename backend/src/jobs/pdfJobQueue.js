const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');
const pool = require('../config/db');
const env = require('../config/env');

// Queue sederhana in-memory dengan concurrency limit, jalan di dalam proses
// Node yang sama tapi kerjaan berat dilempar ke worker_threads (thread terpisah)
// biar main event loop (yang nanganin HTTP request) tetap responsif.
//
// CATATAN JUJUR: ini BUKAN production-grade job queue (kalau server restart/PM2
// reload, job yang lagi jalan/pending di memory hilang - job row di DB bakal
// nyangkut di status 'processing' selamanya). Untuk v1 personal project scale-nya
// kecil jadi acceptable. Kalau mau proper: pindah ke BullMQ + Redis (v2).

const CONCURRENCY = 2;
let activeCount = 0;
const queue = [];

function enqueueJob(job) {
  queue.push(job);
  processNext();
}

async function processNext() {
  if (activeCount >= CONCURRENCY || queue.length === 0) return;

  const job = queue.shift();
  activeCount += 1;

  await pool.execute(
    "UPDATE processing_jobs SET status = 'processing' WHERE id = ?",
    [job.jobId]
  );

  const worker = new Worker(path.join(__dirname, 'pdfWorker.js'), {
    workerData: job,
  });

  worker.on('message', async (result) => {
    if (result.success) {
      await pool.execute(
        "UPDATE processing_jobs SET status = 'done', output_path = ? WHERE id = ?",
        [result.outputPath, job.jobId]
      );
    } else {
      await pool.execute(
        "UPDATE processing_jobs SET status = 'failed', error_message = ? WHERE id = ?",
        [result.error, job.jobId]
      );
    }
  });

  worker.on('error', async (err) => {
    await pool.execute(
      "UPDATE processing_jobs SET status = 'failed', error_message = ? WHERE id = ?",
      [err.message, job.jobId]
    );
  });

  worker.on('exit', () => {
    activeCount -= 1;
    processNext();
  });
}

module.exports = { enqueueJob };
