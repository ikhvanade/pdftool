// Warna preset dibatasi ke 2 dari 4 token approved (base-dark buat dark module,
// highlight buat light module) - sesuai rule #5 CLAUDE.md. Custom hex tetep
// dibuka (PRD §6.3 "custom warna atau custom hex").
const PRESET_COLORS = [
  { dark: '#222831', light: '#DFD0B8', label: 'Cozy (default)' },
  { dark: '#000000', light: '#FFFFFF', label: 'Klasik' },
  { dark: '#393E46', light: '#948979', label: 'Muted' },
];

export default function QrInputPanel({ text, setText, darkColor, setDarkColor, lightColor, setLightColor, format, setFormat }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block font-body text-body text-accent-muted mb-2" htmlFor="qr-text">
          Text atau URL
        </label>
        <textarea
          id="qr-text"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://contoh.com atau teks apapun"
          className="w-full px-4 py-3 bg-base-dark border border-accent-muted/30 rounded-lg text-on-surface placeholder-accent-muted/50 focus:ring-2 focus:ring-highlight focus:border-transparent outline-none font-body text-body resize-none"
        />
      </div>

      <div>
        <p className="font-body text-body text-accent-muted mb-2">Warna</p>
        <div className="flex gap-3 flex-wrap">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.label}
              title={preset.label}
              onClick={() => {
                setDarkColor(preset.dark);
                setLightColor(preset.light);
              }}
              className={`w-9 h-9 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-all ${
                darkColor === preset.dark && lightColor === preset.light ? 'ring-highlight' : 'ring-transparent'
              }`}
              style={{ background: `linear-gradient(135deg, ${preset.dark} 50%, ${preset.light} 50%)` }}
            />
          ))}
          <div className="flex items-center gap-2 ml-2">
            <label className="font-body text-caption text-accent-muted" htmlFor="dark-color">Dark</label>
            <input
              id="dark-color"
              type="color"
              value={darkColor}
              onChange={(e) => setDarkColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent"
            />
            <label className="font-body text-caption text-accent-muted" htmlFor="light-color">Light</label>
            <input
              id="light-color"
              type="color"
              value={lightColor}
              onChange={(e) => setLightColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <p className="font-body text-body text-accent-muted mb-2">Format export</p>
        <div className="flex gap-2">
          {['png', 'svg'].map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-4 py-2 rounded-lg font-body text-body border uppercase transition-colors ${
                format === f
                  ? 'bg-highlight text-base-dark border-highlight'
                  : 'border-accent-muted/30 text-on-surface hover:border-accent-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
