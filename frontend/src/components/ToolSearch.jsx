import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TOOL_INDEX = [
  { label: 'Merge PDF', to: '/pdf-toolkit?tool=merge', keywords: 'gabung combine' },
  { label: 'Split PDF', to: '/pdf-toolkit?tool=split', keywords: 'pisah extract halaman' },
  { label: 'Compress PDF', to: '/pdf-toolkit?tool=compress', keywords: 'kompres kecilin ukuran' },
  { label: 'PDF ke Gambar', to: '/pdf-toolkit?tool=convert', keywords: 'convert jpg png' },
  { label: 'Gambar ke PDF', to: '/pdf-toolkit?tool=image-to-pdf', keywords: 'image convert foto' },
  { label: 'PDF ke Word', to: '/pdf-toolkit?tool=to-word', keywords: 'docx word convert' },
  { label: 'Watermark PDF', to: '/pdf-toolkit?tool=watermark', keywords: 'logo teks' },
  { label: 'Protect PDF (password)', to: '/pdf-toolkit?tool=protect', keywords: 'kunci encrypt password' },
  { label: 'QR Code Generator', to: '/qr-generator', keywords: 'qr barcode link' },
  { label: 'Compress Image', to: '/image?op=compress', keywords: 'gambar foto kompres jpg png webp' },
  { label: 'Resize Image (pas foto 2x3, 3x4, 4x6)', to: '/image?op=resize', keywords: 'ukuran cetak foto' },
  { label: 'Convert Format Image', to: '/image?op=convert', keywords: 'jpg png webp tiff' },
];

export default function ToolSearch() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return TOOL_INDEX.filter((t) => `${t.label} ${t.keywords}`.toLowerCase().includes(s)).slice(0, 6);
  }, [q]);

  function go(to) {
    navigate(to);
    setQ('');
    setOpen(false);
  }

  return (
    <div className="relative w-full max-w-xs">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg pointer-events-none">
        search
      </span>
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) go(results[0].to);
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder="Search tools..."
        className="w-full pl-10 pr-3 py-2 font-mono text-[13px] bg-page border border-line rounded-lg text-ink placeholder-muted focus:outline-none focus:border-primary"
      />
      {open && q.trim() && (
        <ul className="absolute z-50 mt-1 w-full bg-surface border border-line rounded-lg shadow-lg overflow-hidden">
          {results.length > 0 ? (
            results.map((r) => (
              <li key={r.to}>
                <button
                  onMouseDown={() => go(r.to)}
                  className="w-full text-left px-3 py-2 font-mono text-[13px] text-ink hover:bg-primary/10"
                >
                  {r.label}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 font-mono text-[13px] text-muted">Gak ketemu tool itu</li>
          )}
        </ul>
      )}
    </div>
  );
}
