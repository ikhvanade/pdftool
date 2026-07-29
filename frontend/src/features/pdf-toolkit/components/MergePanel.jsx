import { useState } from 'react';
import { mergePdfs, downloadBytes } from '../pdfClient';
import { activityApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import MultiUploadZone from './MultiUploadZone';
import Button from '../../../components/Button';

export default function MergePanel() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | processing | done | failed
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

  async function handleMerge() {
    if (files.length < 2) {
      setError('Minimal 2 file buat digabung.');
      setStatus('failed');
      return;
    }
    setStatus('processing');
    setError(null);
    try {
      const bytes = await mergePdfs(files);
      downloadBytes(bytes, 'hasil-merge.pdf');
      setStatus('done');

      // Log ke history - CUMA kalau user login (guest emang gak dapet history
      // tersimpan, sesuai PRD §6.1). Ini best-effort, kalau gagal gak perlu
      // gagalin keseluruhan proses karena file-nya udah berhasil di-download.
      if (user) {
        activityApi.log('pdf_merge', 'hasil-merge.pdf').catch(() => {});
      }
    } catch (err) {
      setStatus('failed');
      setError('Gagal gabungin PDF - pastiin semua file PDF valid (bukan corrupt/ke-password).');
    }
  }

  return (
    <div>
      <MultiUploadZone files={files} onFilesAdd={handleFilesAdd} onRemove={handleRemove} onMove={handleMove} />

      <Button
        variant="primary"
        icon="call_merge"
        className="mt-6"
        disabled={files.length < 2 || status === 'processing'}
        onClick={handleMerge}
      >
        {status === 'processing' ? 'Menggabungkan...' : `Gabungkan ${files.length} File`}
      </Button>

      {status === 'done' && (
        <p className="font-body text-body text-success mt-3">
          Berhasil! File udah otomatis ke-download.
        </p>
      )}
      {status === 'failed' && error && (
        <p className="font-body text-body text-error mt-3">{error}</p>
      )}
    </div>
  );
}
