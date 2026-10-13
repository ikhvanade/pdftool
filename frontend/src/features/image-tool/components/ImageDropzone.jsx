import { useRef, useState } from 'react';
import Button from '../../../components/Button';

export const ACCEPT = 'image/jpeg,image/png,image/webp,image/tiff';

export default function ImageDropzone({ onFiles }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    onFiles(Array.from(e.dataTransfer.files || []));
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
        dragging ? 'border-primary bg-primary/10' : 'border-primary/50 bg-primary/5'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => { onFiles(Array.from(e.target.files || [])); e.target.value = ''; }}
      />
      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-surface border border-line flex items-center justify-center text-primary dark:text-accent-heading">
        <span className="material-symbols-outlined text-4xl">cloud_upload</span>
      </div>
      <h3 className="font-heading font-semibold text-h3 text-ink mb-1">Drag &amp; Drop Images Here</h3>
      <p className="font-body text-body text-muted mb-5">Supports JPG, JPEG, PNG, WEBP, and TIFF.</p>
      <Button className="mx-auto" icon="folder_open" onClick={() => inputRef.current?.click()}>Browse Files</Button>
    </div>
  );
}
