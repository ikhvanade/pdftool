const TOOL_LABEL = {
  pdf_compress: 'PDF Compress',
  pdf_convert: 'PDF Convert',
  pdf_protect: 'PDF Protect',
  pdf_merge: 'PDF Merge',
  pdf_split: 'PDF Split',
  pdf_watermark: 'PDF Watermark',
  image_to_pdf: 'Gambar ke PDF',
  pdf_to_word: 'PDF ke Word',
  qr_generate: 'QR Generate',
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryTable({ items, onDelete }) {
  if (items.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-accent-muted/20 border-dashed p-10 text-center">
        <span className="material-symbols-outlined text-4xl text-accent-muted mb-2 block">history</span>
        <p className="font-body text-body text-accent-muted">Belum ada aktivitas</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-accent-muted/20 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-accent-muted/20 text-left">
            <th className="p-4 font-body text-caption text-accent-muted font-normal">Tool</th>
            <th className="p-4 font-body text-caption text-accent-muted font-normal">File</th>
            <th className="p-4 font-body text-caption text-accent-muted font-normal">Waktu</th>
            <th className="p-4 font-body text-caption text-accent-muted font-normal text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-accent-muted/10">
              <td className="p-4 font-body text-body text-on-surface">
                {TOOL_LABEL[item.tool_type] || item.tool_type}
              </td>
              <td className="p-4 font-body text-body text-on-surface truncate max-w-[200px]">
                {item.file_name || '-'}
              </td>
              <td className="p-4 font-body text-caption text-accent-muted">{formatDate(item.created_at)}</td>
              <td className="p-4 text-right">
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-accent-muted hover:text-error transition-colors"
                  title="Hapus dari riwayat"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
