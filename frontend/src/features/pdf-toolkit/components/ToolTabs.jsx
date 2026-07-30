export const TOOLS = [
  { id: 'merge', label: 'Merge', clientSide: true },
  { id: 'split', label: 'Split', clientSide: true },
  { id: 'compress', label: 'Compress', clientSide: false },
  { id: 'convert', label: 'PDF → Gambar', clientSide: false },
  { id: 'image-to-pdf', label: 'Gambar → PDF', clientSide: true },
  { id: 'watermark', label: 'Watermark', clientSide: true },
  { id: 'protect', label: 'Protect', clientSide: false },
];

export default function ToolTabs({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onChange(tool.id)}
          className={`whitespace-nowrap px-6 py-3 rounded-full font-body text-body transition-all active:scale-95 flex items-center gap-2 ${
            active === tool.id
              ? 'bg-highlight text-base-dark'
              : 'bg-surface border border-accent-muted/20 text-on-surface hover:bg-surface/60'
          }`}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}
