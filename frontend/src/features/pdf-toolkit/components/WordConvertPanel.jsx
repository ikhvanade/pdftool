import { useState } from 'react';
import { pdfApi } from '../../../lib/api';
import { usePdfJob } from '../usePdfJob';
import UploadZone from './UploadZone';
import JobStatusPanel from './JobStatusPanel';
import Button from '../../../components/Button';

export default function WordConvertPanel() {
  const [file, setFile] = useState(null);
  const { status, error, run, reset, downloadUrl } = usePdfJob();

  function handleSubmit() {
    if (!file) return;
    run(() => pdfApi.toWord(file));
  }

  function handleReset() {
    setFile(null);
    reset();
  }

  return (
    <div>
      <UploadZone file={file} onFileSelect={setFile} />

      <p className="font-body text-caption text-accent-muted mt-3">
        Kualitas hasil convert paling bagus buat PDF berbasis teks (bukan hasil
        scan/foto). Layout kompleks (tabel rumit, multi-kolom) bisa aja gak
        persis 100% sama kayak aslinya - ini keterbatasan teknologi convert
        PDF↔Word secara umum, bukan cuma di sini.
      </p>

      <Button
        variant="primary"
        icon="description"
        className="mt-4"
        disabled={!file || status === 'uploading' || status === 'processing'}
        onClick={handleSubmit}
      >
        Convert ke Word
      </Button>

      <JobStatusPanel status={status} error={error} downloadUrl={downloadUrl} onReset={handleReset} />
    </div>
  );
}
