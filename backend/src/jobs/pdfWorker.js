const { parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

// PENTING - keterbatasan jujur:
// pdf-lib TIDAK punya kompresi gambar/asset beneran (cuma bisa re-save dengan
// object streams biar sedikit lebih kecil, gak sebanding Ghostscript/qpdf).
// Untuk compress yang beneran signifikan, opsi realistis:
//   1. Ghostscript (`gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook ...`) via child_process
//   2. qpdf buat structural optimization
// Worker ini gue kasih kerangka yang jalan (pakai pdf-lib compact save)
// tapi TODO: ganti ke Ghostscript kalau butuh compression ratio yang lebih besar.
// Ini keputusan yang perlu dikonfirmasi user dulu (install Ghostscript di server).

async function run() {
  const { jobId, type, inputPath, options } = workerData;
  const outputDir = path.join(path.dirname(inputPath), '..', 'processed');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${jobId}.pdf`);

  try {
    if (type === 'pdf_compress') {
      const bytes = fs.readFileSync(inputPath);
      const pdfDoc = await PDFDocument.load(bytes);
      const compressed = await pdfDoc.save({ useObjectStreams: true });
      fs.writeFileSync(outputPath, compressed);
    } else if (type === 'pdf_convert') {
      // Convert PDF->image butuh rendering (pdfjs-dist di Node + canvas, atau
      // poppler-utils `pdftoppm`). Belum diimplementasi di skeleton ini -
      // butuh keputusan mau pakai library/tool apa dulu.
      throw new Error('PDF_CONVERT_NOT_IMPLEMENTED_YET');
    } else {
      throw new Error(`UNKNOWN_JOB_TYPE: ${type}`);
    }

    parentPort.postMessage({ success: true, outputPath });
  } catch (err) {
    parentPort.postMessage({ success: false, error: err.message });
  }
}

run();
