// Parameter teknis sesuai PRD §6.7 (dieksekusi di backend lewat sharp)
export const COMPRESS_PRESETS = [
  { id: 'normal', title: 'Normal', description: 'Kualitas ~85, dimensi tetap. Buat arsip - bedanya nyaris gak keliatan.' },
  { id: 'sedang', title: 'Sedang', description: 'Kualitas ~65, sisi terpanjang max 1920px. Pas buat sharing sehari-hari.' },
  { id: 'ekstrim', title: 'Ekstrim', description: 'Kualitas ~35, sisi terpanjang max 1080px. Sekecil mungkin, kualitas turun keliatan.' },
];

export default function CompressOptions({ value, onChange }) {
  return (
    <div className="space-y-3">
      {COMPRESS_PRESETS.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`w-full text-left p-3 rounded-lg border transition-colors ${
            value === p.id ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/50'
          }`}
        >
          <span className="block font-mono text-[13px] font-medium text-ink">{p.title}</span>
          <span className="block font-mono text-[12px] text-muted">{p.description}</span>
        </button>
      ))}
      <p className="font-mono text-[11px] text-muted">
        PNG itu lossless, jadi pengurangan ukurannya cuma dari pengecilan dimensi (Sedang/Ekstrim).
        Preset Normal di PNG hampir gak ngubah ukuran file.
      </p>
    </div>
  );
}
