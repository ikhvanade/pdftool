import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { qrApi } from '../../../lib/api';
import Button from '../../../components/Button';

export default function QrPreviewPanel({ text, darkColor, lightColor, format, logoFile }) {
  const canvasRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [exportResult, setExportResult] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  // Live preview - 100% client-side, GAK manggil backend, GAK kena guest quota.
  // Kalau ada logo, komposit langsung di <canvas> biar preview-nya akurat
  // (mirror behavior compositing di backend pake sharp).
  useEffect(() => {
    if (!text) {
      setPreviewUrl(null);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const qrSize = 320;
        if (!logoFile || format === 'svg') {
          const url = await QRCode.toDataURL(text, {
            color: { dark: darkColor, light: lightColor },
            width: qrSize,
            margin: 2,
          });
          setPreviewUrl(url);
          return;
        }

        // Ada logo -> gambar QR ke canvas, timpa logo di tengah
        const canvas = canvasRef.current;
        canvas.width = qrSize;
        canvas.height = qrSize;
        const ctx = canvas.getContext('2d');

        await QRCode.toCanvas(canvas, text, {
          color: { dark: darkColor, light: lightColor },
          width: qrSize,
          margin: 2,
          errorCorrectionLevel: 'H',
        });

        const logoImg = new Image();
        const logoObjectUrl = URL.createObjectURL(logoFile);
        logoImg.onload = () => {
          const logoSize = Math.round(qrSize * 0.22);
          const offset = Math.round((qrSize - logoSize) / 2);
          // Background putih di belakang logo biar kontras & scan-friendly
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(offset, offset, logoSize, logoSize);
          ctx.drawImage(logoImg, offset, offset, logoSize, logoSize);
          setPreviewUrl(canvas.toDataURL('image/png'));
          URL.revokeObjectURL(logoObjectUrl);
        };
        logoImg.src = logoObjectUrl;
      } catch {
        setPreviewUrl(null);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [text, darkColor, lightColor, format, logoFile]);

  async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    setExportResult(null);
    try {
      const payload = { text, darkColor, lightColor, format };
      if (logoFile && format === 'png') {
        payload.logoBase64 = await fileToBase64(logoFile);
      }
      const res = await qrApi.generate(payload);
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
      } else if (code === 'LOGO_FORMAT_INVALID') {
        setExportError('Format logo gak didukung - pake PNG atau JPEG.');
      } else {
        setExportError('Gagal generate QR. Coba lagi.');
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center bg-base-dark rounded-xl border border-accent-muted/20 p-8 min-h-[380px]">
      <canvas ref={canvasRef} className="hidden" />
      {previewUrl ? (
        <img src={previewUrl} alt="Pratinjau QR" className="w-64 h-64 rounded-lg" />
      ) : (
        <div className="w-64 h-64 rounded-lg border-2 border-dashed border-accent-muted/30 flex items-center justify-center">
          <p className="font-body text-caption text-accent-muted text-center px-4">
            Masukkan teks atau URL untuk melihat preview QR code
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
