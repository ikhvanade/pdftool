import { useState } from 'react';
import { watermarkPdfText, watermarkPdfImage, downloadBytes } from '../pdfClient';
import { activityApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import UploadZone from './UploadZone';
import Button from '../../../components/Button';

export default function WatermarkPanel() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('text'); // 'text' | 'image'
  const [text, setText] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [opacity, setOpacity] = useState(0.3);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const user = useAuthStore((s) => s.user);

  function handleLogoSelect(f) {
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  }

  async function handleApply() {
    if (!file) return;
    if (mode === 'text' && !text) return;
    if (mode === 'image' && !logoFile) return;

    setStatus('processing');
    setError(null);
    try {
      const bytes =
        mode === 'text'
          ? await watermarkPdfText(file, { text, opacity })
          : await watermarkPdfImage(file, logoFile, { opacity });

      downloadBytes(bytes, 'hasil-watermark.pdf');
      setStatus('done');

      if (user) {
        activityApi.log('pdf_watermark', file.name).catch(() => {});
      }
    } catch (err) {
      setStatus('failed');
      setError('Gagal menambahkan watermark - pastikan file PDF & gambar valid.');
    }
  }

  return (
    <div>
      <UploadZone file={file} onFileSelect={setFile} />

      <div className="mt-4">
        <p className="font-body text-body text-accent-muted mb-2">Jenis watermark</p>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('text')}
            className={`px-4 py-2 rounded-lg font-body text-body border transition-colors ${
              mode === 'text' ? 'bg-highlight text-base-dark border-highlight' : 'border-accent-muted/30 text-on-surface hover:border-accent-muted'
            }`}
          >
            Teks
          </button>
          <button
            onClick={() => setMode('image')}
            className={`px-4 py-2 rounded-lg font-body text-body border transition-colors ${
              mode === 'image' ? 'bg-highlight text-base-dark border-highlight' : 'border-accent-muted/30 text-on-surface hover:border-accent-muted'
            }`}
          >
            Logo / Gambar
          </button>
        </div>
      </div>

      {mode === 'text' ? (
        <div className="mt-4">
          <label className="block font-body text-body text-accent-muted mb-2" htmlFor="watermark-text">
            Teks watermark
          </label>
          <input
            id="watermark-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Contoh: DRAFT, 10-10-2026 dll"
            className="w-full px-4 py-3 bg-base-dark border border-accent-muted/30 rounded-lg text-on-surface placeholder-accent-muted/50 focus:ring-2 focus:ring-highlight outline-none font-body text-body"
          />
        </div>
      ) : (
        <div className="mt-4">
          <label className="block font-body text-body text-accent-muted mb-2">Upload logo/gambar</label>
          <label className="block border-dashed border-2 border-accent-muted/40 hover:border-accent-muted rounded-xl p-4 text-center cursor-pointer transition-colors">
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleLogoSelect(e.target.files[0])}
            />
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="max-h-24 mx-auto rounded" />
            ) : (
              <p className="font-body text-body text-on-surface">Klik buat pilih gambar (JPG/PNG)</p>
            )}
          </label>
        </div>
      )}

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
        Watermark ditaro diagonal di tengah tiap halaman.
      </p>

      <Button
        variant="primary"
        icon="water_drop"
        className="mt-6"
        disabled={!file || (mode === 'text' ? !text : !logoFile) || status === 'processing'}
        onClick={handleApply}
      >
        {status === 'processing' ? 'Memproses...' : 'Tambahkan Watermark'}
      </Button>

      {status === 'done' && (
        <p className="font-body text-body text-success mt-3">Berhasil! File sudah otomatis didownload.</p>
      )}
      {status === 'failed' && error && <p className="font-body text-body text-error mt-3">{error}</p>}
    </div>
  );
}
