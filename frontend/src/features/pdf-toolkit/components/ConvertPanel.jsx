import { useState } from 'react';
import { pdfApi } from '../../../lib/api';
import { usePdfJob } from '../usePdfJob';
import UploadZone from './UploadZone';
import JobStatusPanel from './JobStatusPanel';
import Button from '../../../components/Button';

export default function ConvertPanel() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('png');
  const { status, error, run, reset, downloadUrl } = usePdfJob();

  function handleSubmit() {
    if (!file) return;
    run(() => pdfApi.convert(file, format));
  }

  function handleReset() {
    setFile(null);
    reset();
  }

  return (
    <div>
      <UploadZone file={file} onFileSelect={setFile} />

      <div className="mt-4">
        <p className="font-body text-body text-accent-muted mb-2">Format output</p>
        <div className="flex gap-2">
          {['png', 'jpg'].map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-4 py-2 rounded-lg font-body text-body border uppercase transition-colors ${
                format === f
                  ? 'bg-highlight text-base-dark border-highlight'
                  : 'border-accent-muted/30 text-on-surface hover:border-accent-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="font-body text-caption text-accent-muted mt-2">
          PDF multi-halaman otomatis di-zip jadi satu file.
        </p>
      </div>

      <Button
        variant="primary"
        icon="image"
        className="mt-6"
        disabled={!file || status === 'uploading' || status === 'processing'}
        onClick={handleSubmit}
      >
        Convert ke Gambar
      </Button>

      <JobStatusPanel status={status} error={error} downloadUrl={downloadUrl} onReset={handleReset} />
    </div>
  );
}
