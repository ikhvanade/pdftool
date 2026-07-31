import { useState } from 'react';
import { qrApi } from '../../../lib/api';
import Button from '../../../components/Button';

export default function ImageToQrPanel({ darkColor, lightColor, format }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | done | failed
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { output, imageUrl }

  function handleFileSelect(f) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setStatus('idle');
  }

  async function handleGenerate() {
    if (!file) return;
    setStatus('uploading');
    setError(null);
    try {
      const res = await qrApi.generateFromImage(file, darkColor, lightColor, format);
      setResult(res.data);
      setStatus('done');

      const href = format === 'svg'
        ? `data:image/svg+xml;utf8,${encodeURIComponent(res.data.output)}`
        : res.data.output;
      const a = document.createElement('a');
      a.href = href;
      a.download = `qrcode.${format}`;
      a.click();
    } catch (err) {
      setStatus('failed');
      const code = err.response?.data?.error;
      if (code === 'GUEST_QUOTA_EXCEEDED') {
        setError('Kuota gratis kamu udah habis. Login buat pemakaian unlimited.');
      } else if (code === 'PUBLIC_URL_NOT_CONFIGURED') {
        setError('Server belum di-setup buat fitur ini (PUBLIC_URL belum diisi admin).');
      } else {
        setError('Gagal generate QR dari gambar. Coba lagi.');
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-base-dark/50 border border-highlight/20 rounded-lg p-3">
        <p className="font-body text-caption text-accent-muted">
          <span className="text-highlight font-medium">Cara kerja:</span> gambar
          kamu di-upload & disimpan di server ini, lalu QR-nya encode LINK ke
          gambar tersebut (bukan gambarnya langsung - QR code gak punya kapasitas
          buat nyimpen data sebesar file gambar). Siapapun yang scan bakal
          diarahin buka gambar itu di browser.
        </p>
      </div>

      <label className="block border-dashed border-2 border-accent-muted/40 hover:border-accent-muted rounded-xl p-6 text-center cursor-pointer transition-colors">
        <input
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
        ) : (
          <>
            <span className="material-symbols-outlined text-4xl text-accent-muted mb-2 block">image</span>
            <p className="font-body text-body text-on-surface">Klik buat pilih gambar (JPG/PNG)</p>
          </>
        )}
      </label>

      <Button
        variant="primary"
        icon="qr_code_2"
        className="w-full"
        disabled={!file || status === 'uploading'}
        onClick={handleGenerate}
      >
        {status === 'uploading' ? 'Mengupload & generate...' : 'Generate QR dari Gambar Ini'}
      </Button>

      {status === 'failed' && error && (
        <p className="font-body text-caption text-error">{error}</p>
      )}

      {status === 'done' && result && (
        <div className="bg-base-dark rounded-lg border border-accent-muted/20 p-4 space-y-2">
          <p className="font-body text-body text-success">File udah otomatis ke-download.</p>
          <p className="font-body text-caption text-accent-muted break-all">
            Link gambar: <a href={result.imageUrl} target="_blank" rel="noreferrer" className="text-highlight hover:underline">{result.imageUrl}</a>
          </p>
        </div>
      )}
    </div>
  );
}
