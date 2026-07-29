import { useState } from 'react';
import { watermarkPdf, downloadBytes } from '../pdfClient';
import { activityApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import UploadZone from './UploadZone';
import Button from '../../../components/Button';

export default function WatermarkPanel() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.3);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const user = useAuthStore((s) => s.user);

  async function handleApply() {
    if (!file || !text) return;
    setStatus('processing');
    setError(null);
    try {
      const bytes = await watermarkPdf(file, { text, opacity });
      downloadBytes(bytes, 'hasil-watermark.pdf');
      setStatus('done');

      if (user) {
        activityApi.log('pdf_watermark', file.name).catch(() => {});
      }
    } catch (err) {
      setStatus('failed');
      setError('Gagal nambahin watermark - pastiin file PDF valid.');
    }
  }

  return (
    <div>
      <UploadZone file={file} onFileSelect={setFile} />

      <div className="mt-4">
        <label className="block font-body text-body text-accent-muted mb-2" htmlFor="watermark-text">
          Teks watermark
        </label>
        <input
          id="watermark-text"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Contoh: CONFIDENTIAL, DRAFT, dll"
          className="w-full px-4 py-3 bg-base-dark border border-accent-muted/30 rounded-lg text-on-surface placeholder-accent-muted/50 focus:ring-2 focus:ring-highlight outline-none font-body text-body"
        />
      </div>

      <div className="mt-4">
        <label className="block font-body text-body text-accent-muted mb-2" htmlFor="opacity-slider">
          Transparansi ({Math.round(opacity * 100)}%)
        </label>
        <input
          id="opacity-slider"
          type="range"
          min="0.1"
          max="0.8"
          step="0.05"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="w-full accent-highlight"
        />
      </div>

      <p className="font-body text-caption text-accent-muted mt-2">
        Catatan: v1 cuma support watermark teks diagonal di tengah halaman, belum
        support upload logo/gambar (bisa ditambah kalau dibutuhin).
      </p>

      <Button
        variant="primary"
        icon="water_drop"
        className="mt-6"
        disabled={!file || !text || status === 'processing'}
        onClick={handleApply}
      >
        {status === 'processing' ? 'Memproses...' : 'Tambahkan Watermark'}
      </Button>

      {status === 'done' && (
        <p className="font-body text-body text-success mt-3">Berhasil! File udah otomatis ke-download.</p>
      )}
      {status === 'failed' && error && <p className="font-body text-body text-error mt-3">{error}</p>}
    </div>
  );
}
