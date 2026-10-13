import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { imageApi } from '../../lib/api';
import { useImageJob } from './useImageJob';
import Card from '../../components/Card';
import Button from '../../components/Button';
import JobStatusPanel from '../pdf-toolkit/components/JobStatusPanel';
import ImageDropzone from './components/ImageDropzone';
import StagedFiles from './components/StagedFiles';
import OperationPanel, { OPERATIONS } from './components/OperationPanel';
import CompressOptions from './components/CompressOptions';
import ResizeOptions from './components/ResizeOptions';
import ConvertOptions from './components/ConvertOptions';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
const MAX_FILES = 20;
const MAX_MB = 50;

export default function ImageToolPage() {
  const [params] = useSearchParams();
  const initialOp = OPERATIONS.some((o) => o.id === params.get('op')) ? params.get('op') : 'compress';

  const [files, setFiles] = useState([]);
  const [notice, setNotice] = useState(null);
  const [operation, setOperation] = useState(initialOp);
  const [preset, setPreset] = useState('sedang');
  const [size, setSize] = useState('3x4');
  const [custom, setCustom] = useState({ width: '', height: '' });
  const [format, setFormat] = useState('webp');
  const { status, error, run, reset, downloadUrl } = useImageJob();

  const busy = status === 'uploading' || status === 'processing';

  function addFiles(incoming) {
    const accepted = incoming.filter((f) => ALLOWED.includes(f.type) && f.size <= MAX_MB * 1024 * 1024);
    const rejected = incoming.length - accepted.length;
    const room = MAX_FILES - files.length;
    const kept = accepted.slice(0, Math.max(room, 0));
    const overflow = accepted.length - kept.length;

    setFiles((prev) => [...prev, ...kept]);
    const msgs = [];
    if (rejected) msgs.push(`${rejected} file diabaikan (format gak didukung atau lebih dari ${MAX_MB}MB)`);
    if (overflow) msgs.push(`${overflow} file kelebihan (maksimal ${MAX_FILES} file)`);
    setNotice(msgs.length ? msgs.join('. ') + '.' : null);
    if (status !== 'idle') reset();
  }

  function removeFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    if (status !== 'idle') reset();
  }

  const customValid = Number(custom.width) > 0 && Number(custom.height) > 0;
  const canProcess = files.length > 0 && !busy && (operation !== 'resize' || size !== 'custom' || customValid);

  function handleProcess() {
    if (operation === 'compress') run(() => imageApi.compress(files, preset));
    else if (operation === 'resize') {
      run(() => imageApi.resize(files, size === 'custom'
        ? { customWidth: custom.width, customHeight: custom.height }
        : { printSize: size }));
    } else run(() => imageApi.convert(files, format));
  }

  function handleReset() {
    setFiles([]);
    setNotice(null);
    reset();
  }

  const settingsTitle = { compress: 'Compress Settings', resize: 'Resize Settings', convert: 'Convert Settings' }[operation];

  return (
    <>
      <section>
        <h2 className="font-heading font-bold text-h1 text-ink dark:text-accent-heading mb-2">Image Tool</h2>
        <p className="font-body text-body-lg text-muted">Compress, resize, dan convert foto - termasuk ukuran pas foto cetak.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-grid">
        <div className="lg:col-span-8 space-y-gutter-grid">
          <ImageDropzone onFiles={addFiles} />
          {notice && <p className="font-mono text-[12px] text-error">{notice}</p>}
          {files.length > 0 && <StagedFiles files={files} onRemove={removeFile} onFiles={addFiles} />}
        </div>

        <div className="lg:col-span-4 space-y-gutter-grid">
          <OperationPanel value={operation} onChange={(op) => { setOperation(op); if (status !== 'idle') reset(); }} />

          <Card>
            <h3 className="font-heading font-semibold text-h3 text-ink mb-4">{settingsTitle}</h3>
            {operation === 'compress' && <CompressOptions value={preset} onChange={setPreset} />}
            {operation === 'resize' && (
              <ResizeOptions
                size={size}
                onSizeChange={setSize}
                customWidth={custom.width}
                customHeight={custom.height}
                onCustomChange={(key, v) => setCustom((c) => ({ ...c, [key]: v }))}
              />
            )}
            {operation === 'convert' && <ConvertOptions value={format} onChange={setFormat} />}
          </Card>

          <div>
            <Button className="w-full" icon="play_arrow" disabled={!canProcess} onClick={handleProcess}>
              {busy ? 'Memproses...' : 'Process Files'}
            </Button>
            {files.length > 1 && status === 'idle' && (
              <p className="font-mono text-[11px] text-muted mt-2">Lebih dari 1 file - hasilnya otomatis di-ZIP.</p>
            )}
            <JobStatusPanel status={status} error={error} downloadUrl={downloadUrl} onReset={handleReset} />
          </div>
        </div>
      </div>
    </>
  );
}
