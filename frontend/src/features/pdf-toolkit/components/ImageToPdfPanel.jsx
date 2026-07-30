import { useState } from 'react';
import { imagesToPdf, downloadBytes } from '../pdfClient';
import { activityApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import MultiUploadZone from './MultiUploadZone';
import Button from '../../../components/Button';

export default function ImageToPdfPanel() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const user = useAuthStore((s) => s.user);

  function handleFilesAdd(newFiles) {
    setFiles((prev) => [...prev, ...newFiles]);
    setStatus('idle');
  }

  function handleRemove(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleMove(from, to) {
    setFiles((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  }

  async function handleConvert() {
    if (files.length === 0) return;
    setStatus('processing');
    setError(null);
    try {
      const bytes = await imagesToPdf(files);
      downloadBytes(bytes, 'hasil-gambar-ke-pdf.pdf');
      setStatus('done');

      if (user) {
        activityApi.log('image_to_pdf', 'hasil-gambar-ke-pdf.pdf').catch(() => {});
      }
    } catch (err) {
      setStatus('failed');
      setError('Gagal convert - pastiin semua file gambar valid (JPG/PNG).');
    }
  }

  return (
    <div>
      <MultiUploadZone
        files={files}
        onFilesAdd={handleFilesAdd}
        onRemove={handleRemove}
        onMove={handleMove}
        accept="image/png,image/jpeg"
        label="Upload/Tarik beberapa gambar (JPG/PNG) ke sini, urutan jadi urutan halaman PDF"
      />

      <Button
        variant="primary"
        icon="picture_as_pdf"
        className="mt-6"
        disabled={files.length === 0 || status === 'processing'}
        onClick={handleConvert}
      >
        {status === 'processing' ? 'Mengonversi...' : `Convert ${files.length} Gambar ke PDF`}
      </Button>

      {status === 'done' && (
        <p className="font-body text-body text-success mt-3">Berhasil! File udah otomatis ke-download.</p>
      )}
      {status === 'failed' && error && <p className="font-body text-body text-error mt-3">{error}</p>}
    </div>
  );
}
