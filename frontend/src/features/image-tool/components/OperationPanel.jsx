import Card from '../../../components/Card';

export const OPERATIONS = [
  { id: 'compress', title: 'Compress', description: 'Kecilin ukuran file, pilih tingkat kompresinya.' },
  { id: 'resize', title: 'Resize', description: 'Ubah dimensi: ukuran pas foto atau custom px.' },
  { id: 'convert', title: 'Convert Format', description: 'Ganti format ke JPG, PNG, atau WEBP.' },
];

export default function OperationPanel({ value, onChange }) {
  return (
    <Card>
      <h3 className="font-heading font-semibold text-h3 text-ink mb-4">Operation</h3>
      <div className="space-y-3" role="radiogroup" aria-label="Pilih operasi">
        {OPERATIONS.map((op) => {
          const selected = value === op.id;
          return (
            <label
              key={op.id}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                selected ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/50'
              }`}
            >
              <input type="radio" name="image-operation" value={op.id} checked={selected} onChange={() => onChange(op.id)} className="sr-only" />
              <span className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected ? 'border-primary' : 'border-muted'}`}>
                {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
              </span>
              <span>
                <span className="block font-mono text-[13px] font-medium text-ink">{op.title}</span>
                <span className="block font-mono text-[12px] text-muted">{op.description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </Card>
  );
}
