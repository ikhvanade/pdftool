import { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { getPageCount, splitPdf, downloadBytes } from '../pdfClient';
import { activityApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import UploadZone from './UploadZone';
import Button from '../../../components/Button';

export default function SplitPanel() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(null);
  const [mode, setMode] = useState('range'); // 'range' | 'each'
  const [rangeStr, setRangeStr] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!file) {
      setPageCount(null);
      return;
    }
    getPageCount(file)
      .then(setPageCount)
      .catch(() => setError('Gagal baca file - pastiin ini PDF valid.'));
  }, [file]);

  async function handleSplit() {
    setStatus('processing');
    setError(null);
    try {
      const results = await splitPdf(file, mode, rangeStr);

      if (results.length === 1) {
        downloadBytes(results[0].bytes, results[0].name);
      } else {
        const zip = new JSZip();
        results.forEach((r) => zip.file(r.name, r.bytes));
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hasil-split.zip';
        a.click();
        URL.revokeObjectURL(url);
      }
      setStatus('done');

      if (user) {
        activityApi.log('pdf_split', file.name).catch(() => {});
      }
    } catch (err) {
      setStatus('failed');
      setError(err.message || 'Gagal split PDF.');
    }
  }

  return (
    <div>
      <UploadZone file={file} onFileSelect={setFile} />

      {pageCount && (
        <p className="font-body text-caption text-accent-muted mt-2">
          Dokumen ini punya {pageCount} halaman.
        </p>
      )}

      <div className="mt-4">
        <p className="font-body text-body text-accent-muted mb-2">Mode split</p>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('range')}
            className={`px-4 py-2 rounded-lg font-body text-body border transition-colors ${
              mode === 'range'
                ? 'bg-highlight text-base-dark border-highlight'
                : 'border-accent-muted/30 text-on-surface hover:border-accent-muted'
            }`}
          >
            Ambil Halaman Tertentu
          </button>
          <button
            onClick={() => setMode('each')}
            className={`px-4 py-2 rounded-lg font-body text-body border transition-colors ${
              mode === 'each'
                ? 'bg-highlight text-base-dark border-highlight'
                : 'border-accent-muted/30 text-on-surface hover:border-accent-muted'
            }`}
          >
            Pisah Tiap Halaman
          </button>
        </div>
      </div>

      {mode === 'range' && (
        <div className="mt-4">
          <label className="block font-body text-body text-accent-muted mb-2" htmlFor="range-input">
            Halaman yang mau diambil
          </label>
          <input
            id="range-input"
            type="text"
            value={rangeStr}
            onChange={(e) => setRangeStr(e.target.value)}
            placeholder="Contoh: 1-3,5,7-9"
            className="w-full px-4 py-3 bg-base-dark border border-accent-muted/30 rounded-lg text-on-surface placeholder-accent-muted/50 focus:ring-2 focus:ring-highlight outline-none font-body text-body"
          />
        </div>
      )}

      {mode === 'each' && (
        <p className="font-body text-caption text-accent-muted mt-4">
          Hasilnya bakal jadi satu file, isinya satu PDF per halaman.
        </p>
      )}

      <Button
        variant="primary"
        icon="call_split"
        className="mt-6"
        disabled={!file || (mode === 'range' && !rangeStr) || status === 'processing'}
        onClick={handleSplit}
      >
        {status === 'processing' ? 'Memproses...' : 'Split PDF'}
      </Button>

      {status === 'done' && (
        <p className="font-body text-body text-success mt-3">Berhasil! File sudah otomatis ke-download.</p>
      )}
      {status === 'failed' && error && <p className="font-body text-body text-error mt-3">{error}</p>}
    </div>
  );
}
