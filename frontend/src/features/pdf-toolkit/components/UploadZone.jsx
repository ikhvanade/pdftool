import { useRef, useState } from 'react';

export default function UploadZone({ file, onFileSelect, accept = 'application/pdf' }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-dashed border-2 rounded-xl p-8 text-center cursor-pointer transition-colors ${
        dragging ? 'border-highlight bg-highlight/5' : 'border-accent-muted/40 hover:border-accent-muted'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
      />
      <span className="material-symbols-outlined text-4xl text-accent-muted mb-2 block">upload_file</span>
      {file ? (
        <p className="font-body text-body text-on-surface">{file.name}</p>
      ) : (
        <>
          <p className="font-body text-body text-on-surface">Tarik file PDF ke sini, atau klik buat pilih</p>
          <p className="font-body text-caption text-accent-muted mt-1">Maksimal 50MB</p>
        </>
      )}
    </div>
  );
}
