// Widget ini SENGAJA gantiin "Upgrade ke Pro" dari desain Stitch asli -
// PRD.md eksplisit bilang produk ini gratis selamanya, gak ada monetisasi.
// Isinya diganti tips yang beneran relevan sama value proposition produk
// (self-hosted, privasi) daripada widget promosi yang gak sesuai scope.

export default function TipsWidget() {
  return (
    <div className="bg-base-dark rounded-xl border border-highlight/20 p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, #DFD0B8 0%, transparent 50%)' }}
      />
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-highlight">shield</span>
        <h4 className="font-heading text-h3 text-highlight">100% Privat</h4>
      </div>
      <p className="font-body text-body text-accent-muted">
        Privasi aman, file diproses langsung di perangkatmu tanpa upload ke server 
        pihak ketiga. 100% gratis selamanya, tanpa paket premium atau batasan fitur.
      </p>
    </div>
  );
}
