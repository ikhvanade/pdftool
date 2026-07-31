import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

// Semua fungsi di sini jalan 100% di browser (client-side), sesuai arsitektur
// PRD.md §6.2 - "proses ringan tetap client-side (pdf-lib/pdfjs)". Gak ada
// network call ke backend, jadi gak kena guest quota & gak bebanin server.

export async function getPageCount(file) {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  return doc.getPageCount();
}

export async function mergePdfs(files) {
  const mergedDoc = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    const pages = await mergedDoc.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => mergedDoc.addPage(page));
  }
  return mergedDoc.save();
}

// Parse string range kayak "1-3,5,7-9" jadi array index 0-based: [0,1,2,4,6,7,8]
export function parsePageRanges(rangeStr, totalPages) {
  const indices = new Set();
  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    const match = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) throw new Error(`Format range tidak valid: "${part}" (contoh yang benar: 1-3,5,7-9)`);

    const start = parseInt(match[1], 10);
    const end = match[2] ? parseInt(match[2], 10) : start;

    if (start < 1 || end > totalPages || start > end) {
      throw new Error(`Range "${part}" di luar batas (dokumen cuma ${totalPages} halaman)`);
    }
    for (let i = start; i <= end; i++) indices.add(i - 1);
  }

  if (indices.size === 0) throw new Error('Tidak ada halaman yang valid dari input range itu');
  return Array.from(indices).sort((a, b) => a - b);
}

// mode 'range' -> 1 file PDF hasil extract sesuai range
// mode 'each'  -> array of {name, bytes} satu file per halaman (buat di-zip)
export async function splitPdf(file, mode, rangeStr) {
  const bytes = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(bytes);
  const totalPages = sourceDoc.getPageCount();

  if (mode === 'range') {
    const indices = parsePageRanges(rangeStr, totalPages);
    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(sourceDoc, indices);
    pages.forEach((p) => newDoc.addPage(p));
    return [{ name: 'hasil-split.pdf', bytes: await newDoc.save() }];
  }

  // mode 'each': satu file per halaman
  const results = [];
  for (let i = 0; i < totalPages; i++) {
    const newDoc = await PDFDocument.create();
    const [page] = await newDoc.copyPages(sourceDoc, [i]);
    newDoc.addPage(page);
    results.push({ name: `halaman-${i + 1}.pdf`, bytes: await newDoc.save() });
  }
  return results;
}

export async function watermarkPdfText(file, { text, opacity = 0.3, fontSize = 48, rotationDeg = -45 }) {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.58, 0.54, 0.47), // accent-muted (#948979) dari design.md
      opacity,
      rotate: degrees(rotationDeg),
    });
  });

  return doc.save();
}

// Watermark pake gambar/logo - ditaro di tengah tiap halaman, ukurannya
// disesuaikan proporsional ke lebar halaman biar konsisten di semua ukuran
// kertas (bukan ukuran piksel asli gambar, yang bisa kegedean/kekecilan).
export async function watermarkPdfImage(file, imageFile, { opacity = 0.3, widthRatio = 0.4, rotationDeg = -45 }) {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);

  const imageBytes = await imageFile.arrayBuffer();
  const isPng = imageFile.type === 'image/png';
  const image = isPng ? await doc.embedPng(imageBytes) : await doc.embedJpg(imageBytes);
  const aspectRatio = image.height / image.width;

  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const drawWidth = width * widthRatio;
    const drawHeight = drawWidth * aspectRatio;
    page.drawImage(image, {
      x: width / 2 - drawWidth / 2,
      y: height / 2 - drawHeight / 2,
      width: drawWidth,
      height: drawHeight,
      opacity,
      rotate: degrees(rotationDeg),
    });
  });

  return doc.save();
}

export async function imagesToPdf(files) {
  const doc = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const isPng = file.type === 'image/png';
    const image = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);

    // Halaman disesuaikan ke dimensi gambar asli (dalam points, 1px = 1pt) -
    // biar gak ada distorsi/crop, beda dari kalau dipaksa fit ke ukuran A4 tetap.
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }

  return doc.save();
}

export function downloadBytes(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
