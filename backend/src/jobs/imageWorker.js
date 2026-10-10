const { parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Parameter kompresi per preset - sesuai PRD.md §6.7 (angka draft, udah
// mendekati rekomendasi PRD: Normal q85 no-resize, Sedang q65 max1920px,
// Ekstrim q35 max1080px).
const COMPRESS_PRESETS = {
  normal: { quality: 85, maxDimension: null },
  sedang: { quality: 65, maxDimension: 1920 },
  ekstrim: { quality: 35, maxDimension: 1080 },
};

// Ukuran cetak standar Indonesia @ 300 DPI (px = cm / 2.54 * 300), sesuai
// tabel PRD.md §6.7.
const PRINT_SIZES = {
  '2x3': { width: 236, height: 354 },
  '3x4': { width: 354, height: 472 },
  '4x6': { width: 472, height: 709 },
};

function pickFormat(inputExt, requestedFormat) {
  if (requestedFormat) return requestedFormat;
  const ext = inputExt.replace('.', '').toLowerCase();
  if (['jpg', 'jpeg'].includes(ext)) return 'jpeg';
  if (ext === 'webp') return 'webp';
  if (ext === 'tiff' || ext === 'tif') return 'png'; // TIFF gak umum buat web output, default ke PNG
  return 'png';
}

async function applyFormatOutput(pipeline, format, quality) {
  if (format === 'jpeg' || format === 'jpg') return pipeline.jpeg({ quality, mozjpeg: true });
  if (format === 'webp') return pipeline.webp({ quality });
  if (format === 'png') return pipeline.png({ compressionLevel: 9 });
  return pipeline;
}

async function compressImage(inputPath, outputPath, preset) {
  const config = COMPRESS_PRESETS[preset] || COMPRESS_PRESETS.sedang;
  const ext = path.extname(inputPath);
  const format = pickFormat(ext, null);

  let pipeline = sharp(inputPath).rotate(); // .rotate() tanpa argumen = auto-orient dari EXIF
  if (config.maxDimension) {
    pipeline = pipeline.resize({
      width: config.maxDimension, height: config.maxDimension,
      fit: 'inside', withoutEnlargement: true,
    });
  }
  pipeline = await applyFormatOutput(pipeline, format, config.quality);
  await pipeline.toFile(outputPath);

  if (!fs.existsSync(outputPath)) throw new Error('sharp selesai tapi output file gak ada');
}

async function resizeImage(inputPath, outputPath, options) {
  let targetWidth, targetHeight;
  if (options.printSize && PRINT_SIZES[options.printSize]) {
    ({ width: targetWidth, height: targetHeight } = PRINT_SIZES[options.printSize]);
  } else if (options.customWidth && options.customHeight) {
    targetWidth = options.customWidth;
    targetHeight = options.customHeight;
  } else {
    throw new Error('Parameter resize gak lengkap - butuh printSize atau customWidth+customHeight');
  }

  const ext = path.extname(inputPath);
  const format = pickFormat(ext, null);

  let pipeline = sharp(inputPath).rotate().resize(targetWidth, targetHeight, {
    fit: 'cover', // 'cover' biar pas ukuran cetak persis (crop kalau perlu), bukan 'contain' yang nyisain border
    position: 'center',
  });
  // Fixed DPI 300 buat resize ukuran cetak, sesuai design.md §5.5.
  pipeline = pipeline.withMetadata({ density: 300 });
  pipeline = await applyFormatOutput(pipeline, format, 90);
  await pipeline.toFile(outputPath);

  if (!fs.existsSync(outputPath)) throw new Error('sharp selesai tapi output file gak ada');
}

async function convertImageFormat(inputPath, outputPath, targetFormat) {
  let pipeline = sharp(inputPath).rotate();
  pipeline = await applyFormatOutput(pipeline, targetFormat, 90);
  await pipeline.toFile(outputPath);
  if (!fs.existsSync(outputPath)) throw new Error('sharp selesai tapi output file gak ada');
}

function outputExtFor(inputPath, explicitFormat) {
  if (explicitFormat) return explicitFormat === 'jpeg' ? 'jpg' : explicitFormat;
  const ext = path.extname(inputPath).replace('.', '').toLowerCase();
  if (ext === 'tiff' || ext === 'tif') return 'png';
  return ext === 'jpeg' ? 'jpg' : ext;
}

async function run() {
  // Batch: workerData.files = [{ path, originalName }], bukan single file -
  // sesuai PRD.md §6.7 "batch processing, output ZIP kalau lebih dari 1 file".
  const { jobId, type, files, options } = workerData;
  const outputDir = path.join(path.dirname(files[0].path), '..', 'processed');
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    const outputPaths = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const outExt = outputExtFor(file.path, options.format);
      const outputPath = path.join(outputDir, `${jobId}-${i}.${outExt}`);

      if (type === 'image_compress') {
        await compressImage(file.path, outputPath, options.preset);
      } else if (type === 'image_resize') {
        await resizeImage(file.path, outputPath, options);
      } else if (type === 'image_convert') {
        await convertImageFormat(file.path, outputPath, options.format);
      } else {
        throw new Error(`UNKNOWN_JOB_TYPE: ${type}`);
      }
      outputPaths.push(outputPath);
    }

    if (outputPaths.length === 1) {
      parentPort.postMessage({ success: true, outputPath: outputPaths[0] });
    } else {
      const { execFile } = require('child_process');
      const { promisify } = require('util');
      const execFileAsync = promisify(execFile);
      const zipPath = path.join(outputDir, `${jobId}.zip`);
      await execFileAsync('zip', ['-j', zipPath, ...outputPaths]);
      outputPaths.forEach((p) => fs.unlinkSync(p));
      parentPort.postMessage({ success: true, outputPath: zipPath });
    }
  } catch (err) {
    parentPort.postMessage({ success: false, error: err.message });
  }
}

run();
