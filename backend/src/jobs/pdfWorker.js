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

async function convertPdfToWord(inputPath, outputPath, jobId) {
  const outputDir = path.dirname(outputPath);

  // Setiap job pake profile LibreOffice terpisah (folder temp unik per jobId).
  // WAJIB karena job queue bisa jalan 2 soffice bersamaan (CONCURRENCY=2 di
  // pdfJobQueue.js) - tanpa ini, instance kedua bakal gagal karena "profile
  // sudah dipakai proses lain" (soffice cuma boleh 1 instance per profile).
  const profileDir = path.join('/tmp', `lo_profile_${jobId}`);

  try {
    // --infilter="writer_pdf_import" itu KUNCI - tanpa ini, LibreOffice buka
    // PDF via Draw (treat sebagai gambar vektor per halaman), yang GAGAL
    // di-export ke .docx. Dengan filter ini, PDF dibuka sebagai dokumen
    // Writer (teks reflow-able) baru bisa di-convert ke Word beneran.
    await execFileAsync('soffice', [
      '--headless',
      '--infilter=writer_pdf_import',
      '--convert-to', 'docx:MS Word 2007 XML',
      '--outdir', outputDir,
      `-env:UserInstallation=file://${profileDir}`,
      inputPath,
    ], { timeout: 60000 }); // 60 detik timeout - dokumen kompleks/gede bisa lama

    // soffice nge-generate nama file dari basename input (bukan nama custom),
    // jadi perlu di-rename ke outputPath (${jobId}.docx) yang kita mau.
    const inputBasename = path.basename(inputPath, path.extname(inputPath));
    const generatedPath = path.join(outputDir, `${inputBasename}.docx`);

    if (!fs.existsSync(generatedPath)) {
      throw new Error('LibreOffice selesai tapi output .docx gak ada - kemungkinan PDF corrupt atau isinya cuma gambar/scan (butuh OCR, belum didukung)');
    }
    fs.renameSync(generatedPath, outputPath);
  } finally {
    // Bersihin profile temp - kalau dibiarin numpuk di /tmp tiap job.
    fs.rmSync(profileDir, { recursive: true, force: true });
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
    } else if (type === 'pdf_to_word') {
      const outputPath = path.join(outputDir, `${jobId}.docx`);
      await convertPdfToWord(inputPath, outputPath, jobId);
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
