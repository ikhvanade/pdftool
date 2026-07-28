import Button from '../../../components/Button';

export default function JobStatusPanel({ status, error, downloadUrl, onReset }) {
  if (status === 'idle') return null;

  return (
    <div className="mt-6 bg-base-dark rounded-lg border border-accent-muted/20 p-4">
      {(status === 'uploading' || status === 'processing') && (
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-highlight">progress_activity</span>
          <p className="font-body text-body text-on-surface">
            {status === 'uploading' ? 'Mengunggah file...' : 'Memproses di server...'}
          </p>
        </div>
      )}

      {status === 'done' && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-success">check_circle</span>
            <p className="font-body text-body text-on-surface">Selesai! File kamu siap diunduh.</p>
          </div>
          <div className="flex gap-2">
            <a href={downloadUrl} download>
              <Button variant="primary" icon="download">Download</Button>
            </a>
            <Button variant="ghost" onClick={onReset}>Proses File Lain</Button>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="font-body text-body text-error">{error}</p>
          </div>
          <Button variant="ghost" onClick={onReset}>Coba Lagi</Button>
        </div>
      )}
    </div>
  );
}
