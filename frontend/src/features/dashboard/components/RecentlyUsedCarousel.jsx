const TOOL_ICON = {
  pdf_compress: 'picture_as_pdf',
  pdf_convert: 'picture_as_pdf',
  pdf_protect: 'picture_as_pdf',
  pdf_merge: 'picture_as_pdf',
  pdf_split: 'picture_as_pdf',
  pdf_watermark: 'picture_as_pdf',
  qr_generate: 'qr_code',
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export default function RecentlyUsedCarousel({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-accent-muted/20 border-dashed p-6 text-center">
        <p className="font-body text-body text-accent-muted">
          Belum ada aktivitas hari ini — mulai dari mana?
        </p>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
      {items.map((item) => (
        <div
          key={item.id}
          className="min-w-[200px] flex-shrink-0 bg-surface rounded-xl p-4 border border-accent-muted/20 hover:border-highlight/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-3 text-accent-muted group-hover:text-highlight transition-colors">
            <span className="material-symbols-outlined">{TOOL_ICON[item.tool_type] || 'description'}</span>
          </div>
          <h4 className="font-body text-body text-on-surface truncate">
            {item.file_name || item.tool_type}
          </h4>
          <p className="font-body text-caption text-accent-muted mt-1">{timeAgo(item.created_at)}</p>
        </div>
      ))}
    </div>
  );
}
