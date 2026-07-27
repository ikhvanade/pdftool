const { parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

// Semua command di sini pakai execFile (BUKAN exec/shell string), jadi input
// user (path, level, password) TIDAK pernah lewat shell interpretation.
// Path/nama file hasil upload kita yang generate sendiri (uuid), jadi aman,
// tapi tetap dijaga di level ini sebagai defense-in-depth.

const GS_PRESETS = {
  low: '/screen',   // kompresi paling agresif, kualitas paling rendah, size paling kecil
  medium: '/ebook',
  high: '/printer', // kualitas tinggi, kompresi lebih ringan
};

async function compressPdf(inputPath, outputPath, level) {
  const preset = GS_PRESETS[level] || GS_PRESETS.medium;
  await execFileAsync('gs', [
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',
    `-dPDFSETTINGS=${preset}`,
    '-dNOPAUSE',
    '-dBATCH',
    '-dQUIET',
    `-sOutputFile=${outputPath}`,
    inputPath,
  ]);

  if (!fs.existsSync(outputPath)) {
    throw new Error('Ghostscript selesai tapi output file gak ada - cek instalasi Ghostscript di server');
  }
}

async function convertPdfToImages(inputPath, outputPrefix, format) {
  const flag = format === 'jpg' || format === 'jpeg' ? '-jpeg' : '-png';
  await execFileAsync('pdftoppm', [flag, '-r', '150', inputPath, outputPrefix]);

  const dir = path.dirname(outputPrefix);
  const base = path.basename(outputPrefix);
  const ext = flag === '-jpeg' ? 'jpg' : 'png';
  const files = fs.readdirSync(dir)
    .filter((f) => f.startsWith(base) && f.endsWith(`.${ext}`))
    .sort()
    .map((f) => path.join(dir, f));

  if (files.length === 0) {
    throw new Error('pdftoppm selesai tapi gak ada file output - cek instalasi poppler-utils di server');
  }
  return files;
}

async function protectPdf(inputPath, outputPath, password) {
  // qpdf --encrypt <user-password> <owner-password> 256 -- input output
  // User & owner password sama persis (simplifikasi v1) - owner password
  // idealnya beda (buat kontrol permission cetak/edit), tapi PRD cuma minta
  // "password protect", bukan permission granular.
  await execFileAsync('qpdf', [
    '--encrypt', password, password, '256',
    '--',
    inputPath,
    outputPath,
  ]);

  if (!fs.existsSync(outputPath)) {
    throw new Error('qpdf selesai tapi output file gak ada - cek instalasi qpdf di server');
  }
}

async function run() {
  const { jobId, type, inputPath, options } = workerData;
  const outputDir = path.join(path.dirname(inputPath), '..', 'processed');
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    if (type === 'pdf_compress') {
      const outputPath = path.join(outputDir, `${jobId}.pdf`);
      await compressPdf(inputPath, outputPath, options.level);
      parentPort.postMessage({ success: true, outputPath });
    } else if (type === 'pdf_convert') {
      const outputPrefix = path.join(outputDir, jobId);
      const files = await convertPdfToImages(inputPath, outputPrefix, options.targetFormat);

      if (files.length === 1) {
        parentPort.postMessage({ success: true, outputPath: files[0] });
      } else {
        const zipPath = path.join(outputDir, `${jobId}.zip`);
        await execFileAsync('zip', ['-j', zipPath, ...files]);
        // Hapus PNG/JPG mentahan - udah ke-copy ke dalam zip, kalau dibiarin
        // bakal jadi sampah di disk yang gak ke-track cleanup script
        // (cuma output_path/zip yang ke-record di processing_jobs).
        files.forEach((f) => fs.unlinkSync(f));
        parentPort.postMessage({ success: true, outputPath: zipPath });
      }
    } else if (type === 'pdf_protect') {
      const outputPath = path.join(outputDir, `${jobId}.pdf`);
      await protectPdf(inputPath, outputPath, options.password);
      parentPort.postMessage({ success: true, outputPath });
    } else {
      throw new Error(`UNKNOWN_JOB_TYPE: ${type}`);
    }
  } catch (err) {
    const detail = err.stderr ? err.stderr.toString().trim() : err.message;
    parentPort.postMessage({ success: false, error: detail });
  }
}

run();
