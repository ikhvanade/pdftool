import { useState } from 'react';
import { pdfApi } from '../../../lib/api';
import { usePdfJob } from '../usePdfJob';
import UploadZone from './UploadZone';
import JobStatusPanel from './JobStatusPanel';
import Button from '../../../components/Button';

const LEVELS = [
  { id: 'low', label: 'Rendah', hint: 'Ukuran paling kecil' },
  { id: 'medium', label: 'Sedang', hint: 'Seimbang' },
  { id: 'high', label: 'Tinggi', hint: 'Kualitas terbaik' },
];

export default function CompressPanel() {
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState('medium');
  const { status, error, run, reset, downloadUrl } = usePdfJob();

  function handleSubmit() {
    if (!file) return;
    run(() => pdfApi.compress(file, level));
  }

  function handleReset() {
    setFile(null);
    reset();
  }

  return (
    <div>
      <UploadZone file={file} onFileSelect={setFile} />

      <div className="mt-4">
        <p className="font-body text-body text-accent-muted mb-2">Level kompresi</p>
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLevel(l.id)}
              className={`px-4 py-2 rounded-lg font-body text-body border transition-colors ${
                level === l.id
                  ? 'bg-highlight text-base-dark border-highlight'
                  : 'border-accent-muted/30 text-on-surface hover:border-accent-muted'
              }`}
            >
              {l.label}
              <span className="block text-caption opacity-70">{l.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="primary"
        icon="compress"
        className="mt-6"
        disabled={!file || status === 'uploading' || status === 'processing'}
        onClick={handleSubmit}
      >
        Kompres PDF
      </Button>

      <JobStatusPanel status={status} error={error} downloadUrl={downloadUrl} onReset={handleReset} />
    </div>
  );
}
