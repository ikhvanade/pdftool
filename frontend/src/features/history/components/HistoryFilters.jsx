const FILTERS = [
  { id: '', label: 'Semua' },
  { id: 'pdf_merge', label: 'Merge' },
  { id: 'pdf_split', label: 'Split' },
  { id: 'pdf_compress', label: 'Compress' },
  { id: 'pdf_convert', label: 'PDF → Gambar' },
  { id: 'image_to_pdf', label: 'Gambar → PDF' },
  { id: 'pdf_to_word', label: 'PDF → Word' },
  { id: 'pdf_watermark', label: 'Watermark' },
  { id: 'pdf_protect', label: 'Protect' },
  { id: 'qr_generate', label: 'QR Code' },
];

export default function HistoryFilters({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`px-5 py-2 rounded-full font-body text-body whitespace-nowrap transition-all active:scale-95 ${
            active === f.id
              ? 'bg-highlight text-base-dark'
              : 'bg-surface border border-accent-muted/20 text-accent-muted hover:text-highlight hover:border-highlight/50'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
