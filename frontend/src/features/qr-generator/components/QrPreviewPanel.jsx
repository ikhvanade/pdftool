import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { qrApi } from '../../../lib/api';
import Button from '../../../components/Button';

export default function QrPreviewPanel({ text, darkColor, lightColor, format }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [exportResult, setExportResult] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  // Live preview - 100% client-side, GAK manggil backend, GAK kena guest quota.
  // Di-debounce dikit biar gak re-render QR tiap 1 huruf ngetik.
  useEffect(() => {
    if (!text) {
      setPreviewUrl(null);
      return;
    }
    const timeout = setTimeout(() => {
      QRCode.toDataURL(text, {
        color: { dark: darkColor, light: lightColor },
        width: 320,
        margin: 2,
      })
        .then(setPreviewUrl)
        .catch(() => setPreviewUrl(null));
    }, 300);
    return () => clearTimeout(timeout);
  }, [text, darkColor, lightColor]);

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    setExportResult(null);
    try {
      const res = await qrApi.generate({ text, darkColor, lightColor, format });
      const output = res.data.output;
      setExportResult(output);

      // Auto-download langsung - gak perlu klik link tambahan lagi.
      const href = format === 'svg' ? `data:image/svg+xml;utf8,${encodeURIComponent(output)}` : output;
      const a = document.createElement('a');
      a.href = href;
      a.download = `qrcode.${format}`;
      a.click();
    } catch (err) {
      const code = err.response?.data?.error;
      if (code === 'GUEST_QUOTA_EXCEEDED') {
        setExportError('Kuota gratis kamu udah habis. Login buat pemakaian unlimited.');
      } else {
        setExportError('Gagal generate QR. Coba lagi.');
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center bg-base-dark rounded-xl border border-accent-muted/20 p-8 min-h-[380px]">
      {previewUrl ? (
        <img src={previewUrl} alt="Pratinjau QR" className="w-64 h-64 rounded-lg" />
      ) : (
        <div className="w-64 h-64 rounded-lg border-2 border-dashed border-accent-muted/30 flex items-center justify-center">
          <p className="font-body text-caption text-accent-muted text-center px-4">
            Ketik text/URL buat liat pratinjau
          </p>
        </div>
      )}

      <Button
        variant="primary"
        icon="download"
        className="mt-6 w-full"
        disabled={!text || exporting}
        onClick={handleExport}
      >
        {exporting ? 'Memproses...' : `Export ${format.toUpperCase()}`}
      </Button>

      {exportError && <p className="font-body text-caption text-error mt-2">{exportError}</p>}

      {exportResult && (
        <p className="font-body text-body text-success mt-3">
          File udah otomatis ke-download.
        </p>
      )}
    </div>
  );
}
