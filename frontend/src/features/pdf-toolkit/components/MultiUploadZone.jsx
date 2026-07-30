import { useRef } from 'react';

export default function MultiUploadZone({
  files, onFilesAdd, onRemove, onMove,
  accept = 'application/pdf', label = 'Tarik beberapa file PDF ke sini, atau klik buat pilih (bisa lebih dari 1)',
}) {
  const inputRef = useRef(null);
  const acceptedTypes = accept.split(',');

  function handleDrop(e) {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []).filter((f) => acceptedTypes.includes(f.type));
    if (dropped.length) onFilesAdd(dropped);
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-dashed border-2 border-accent-muted/40 hover:border-accent-muted rounded-xl p-8 text-center cursor-pointer transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => e.target.files?.length && onFilesAdd(Array.from(e.target.files))}
        />
        <span className="material-symbols-outlined text-4xl text-accent-muted mb-2 block">upload_file</span>
        <p className="font-body text-body text-on-surface">{label}</p>
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between bg-base-dark rounded-lg px-4 py-2 border border-accent-muted/10"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-body text-caption text-accent-muted w-5">{idx + 1}</span>
                <span className="font-body text-body text-on-surface truncate">{file.name}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  disabled={idx === 0}
                  onClick={() => onMove(idx, idx - 1)}
                  className="text-accent-muted hover:text-highlight disabled:opacity-20 disabled:hover:text-accent-muted"
                  title="Naikkan urutan"
                >
                  <span className="material-symbols-outlined text-lg">arrow_upward</span>
                </button>
                <button
                  disabled={idx === files.length - 1}
                  onClick={() => onMove(idx, idx + 1)}
                  className="text-accent-muted hover:text-highlight disabled:opacity-20 disabled:hover:text-accent-muted"
                  title="Turunkan urutan"
                >
                  <span className="material-symbols-outlined text-lg">arrow_downward</span>
                </button>
                <button
                  onClick={() => onRemove(idx)}
                  className="text-accent-muted hover:text-error"
                  title="Hapus"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
