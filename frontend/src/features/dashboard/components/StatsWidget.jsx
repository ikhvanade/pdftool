import Card from '../../../components/Card';

export default function StatsWidget({ pdfCount, qrCount }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-h3 text-on-surface">Statistik Kamu</h3>
        <span className="material-symbols-outlined text-accent-muted">bar_chart</span>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-base-dark/50 p-3 rounded-lg border border-accent-muted/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-base-dark flex items-center justify-center text-highlight">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            </div>
            <span className="font-body text-body text-on-surface">PDF Diproses</span>
          </div>
          <span className="font-heading text-h2 text-highlight">{pdfCount}</span>
        </div>
        <div className="flex items-center justify-between bg-base-dark/50 p-3 rounded-lg border border-accent-muted/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-base-dark flex items-center justify-center text-highlight">
              <span className="material-symbols-outlined text-sm">qr_code</span>
            </div>
            <span className="font-body text-body text-on-surface">QR Dibuat</span>
          </div>
          <span className="font-heading text-h2 text-highlight">{qrCount}</span>
        </div>
      </div>
    </Card>
  );
}
