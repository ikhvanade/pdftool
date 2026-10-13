const INPUT_CLS = 'w-full px-3 py-2 bg-page border border-line rounded-lg text-ink font-mono text-[13px] focus:outline-none focus:border-primary';

// px = cm / 2.54 * 300 (PRD §6.7)
export const PRINT_SIZES = [
  { id: '2x3', label: '2 × 3 cm (236 × 354 px)' },
  { id: '3x4', label: '3 × 4 cm (354 × 472 px)' },
  { id: '4x6', label: '4 × 6 cm (472 × 709 px)' },
];

export default function ResizeOptions({ size, onSizeChange, customWidth, customHeight, onCustomChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block font-mono text-[12px] text-muted mb-2" htmlFor="print-size">Ukuran</label>
        <select id="print-size" value={size} onChange={(e) => onSizeChange(e.target.value)} className={INPUT_CLS}>
          {PRINT_SIZES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          <option value="custom">Custom (px)</option>
        </select>
      </div>

      {size === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-[12px] text-muted mb-2" htmlFor="custom-w">Lebar (px)</label>
            <input id="custom-w" type="number" min="1" max="10000" value={customWidth} onChange={(e) => onCustomChange('width', e.target.value)} className={INPUT_CLS} placeholder="800" />
          </div>
          <div>
            <label className="block font-mono text-[12px] text-muted mb-2" htmlFor="custom-h">Tinggi (px)</label>
            <input id="custom-h" type="number" min="1" max="10000" value={customHeight} onChange={(e) => onCustomChange('height', e.target.value)} className={INPUT_CLS} placeholder="600" />
          </div>
        </div>
      )}

      <p className="font-mono text-[11px] text-muted">
        Output 300 DPI. Gambar di-crop ke tengah biar pas ukuran persis - foto landscape
        yang di-resize ke ukuran portrait bakal kepotong kiri-kanannya.
      </p>
    </div>
  );
}
