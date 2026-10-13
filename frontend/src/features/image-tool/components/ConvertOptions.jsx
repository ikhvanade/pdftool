const FORMATS = [
  { id: 'jpeg', label: 'JPG' },
  { id: 'png', label: 'PNG' },
  { id: 'webp', label: 'WEBP' },
];

export default function ConvertOptions({ value, onChange }) {
  return (
    <div className="space-y-3">
      <p className="font-mono text-[12px] text-muted">Convert semua file ke format:</p>
      <div className="flex gap-2">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className={`flex-1 py-2 rounded-lg border font-mono text-[13px] transition-colors ${
              value === f.id ? 'border-primary bg-primary text-white' : 'border-line text-ink hover:border-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="font-mono text-[11px] text-muted">
        Convert ke JPG ngilangin transparansi PNG (jadi hitam/putih tergantung gambar).
      </p>
    </div>
  );
}
