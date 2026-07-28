import { useState } from 'react';
import { pdfApi } from '../../../lib/api';
import { usePdfJob } from '../usePdfJob';
import UploadZone from './UploadZone';
import JobStatusPanel from './JobStatusPanel';
import Button from '../../../components/Button';

export default function ProtectPanel() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const { status, error, run, reset, downloadUrl } = usePdfJob();

  function handleSubmit() {
    if (!file || password.length < 4) return;
    run(() => pdfApi.protect(file, password));
  }

  function handleReset() {
    setFile(null);
    setPassword('');
    reset();
  }

  return (
    <div>
      <UploadZone file={file} onFileSelect={setFile} />

      <div className="mt-4">
        <label className="block font-body text-body text-accent-muted mb-2" htmlFor="protect-password">
          Password buat PDF ini
        </label>
        <input
          id="protect-password"
          type="password"
          minLength={4}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 4 karakter"
          className="w-full px-4 py-3 bg-base-dark border border-accent-muted/30 rounded-lg text-on-surface placeholder-accent-muted/50 focus:ring-2 focus:ring-highlight focus:border-transparent outline-none font-body text-body"
        />
        <p className="font-body text-caption text-accent-muted mt-2">
          Password ini gak disimpan di server kami sama sekali - inget-inget baik-baik.
        </p>
      </div>

      <Button
        variant="primary"
        icon="lock"
        className="mt-6"
        disabled={!file || password.length < 4 || status === 'uploading' || status === 'processing'}
        onClick={handleSubmit}
      >
        Kunci PDF dengan Password
      </Button>

      <JobStatusPanel status={status} error={error} downloadUrl={downloadUrl} onReset={handleReset} />
    </div>
  );
}
