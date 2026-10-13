import { useEffect, useRef, useState } from 'react';
import Card from '../../../components/Card';
import { formatBytes } from '../../../lib/formatBytes';
import { ACCEPT } from './ImageDropzone';

function Thumb({ file }) {
  const [url, setUrl] = useState(null);
  const canPreview = file.type !== 'image/tiff'; // browser gak bisa render TIFF

  useEffect(() => {
    if (!canPreview) return undefined;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file, canPreview]);

  return url ? (
    <img src={url} alt={file.name} className="w-full h-24 object-cover" />
  ) : (
    <div className="w-full h-24 flex items-center justify-center bg-page text-muted">
      <span className="material-symbols-outlined text-3xl">image</span>
    </div>
  );
}

export default function StagedFiles({ files, onRemove, onFiles }) {
  const inputRef = useRef(null);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-h3 text-ink">Staged Files</h3>
        <span className="font-mono text-[12px] px-3 py-1 rounded bg-primary/10 text-primary dark:text-accent-heading">
          {files.length} {files.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {files.map((file, idx) => (
          <div key={`${file.name}-${file.size}-${idx}`} className="relative border border-line rounded-lg overflow-hidden bg-surface">
            <Thumb file={file} />
            <button
              onClick={() => onRemove(idx)}
              title="Hapus dari daftar"
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-error"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
            <div className="p-2">
              <p className="font-mono text-[11px] text-ink truncate" title={file.name}>{file.name}</p>
              <p className="font-mono text-[10px] text-muted">{formatBytes(file.size)}</p>
            </div>
          </div>
        ))}

        <button
          onClick={() => inputRef.current?.click()}
          className="h-full min-h-[8.5rem] border border-dashed border-line rounded-lg flex items-center justify-center text-muted hover:border-primary hover:text-primary"
          title="Tambah file"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => { onFiles(Array.from(e.target.files || [])); e.target.value = ''; }}
        />
      </div>
    </Card>
  );
}
