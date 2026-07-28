import { useState } from 'react';
import { mergePdfs, downloadBytes } from '../pdfClient';
import MultiUploadZone from './MultiUploadZone';
import Button from '../../../components/Button';

export default function MergePanel() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | processing | done | failed
  const [error, setError] = useState(null);

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
