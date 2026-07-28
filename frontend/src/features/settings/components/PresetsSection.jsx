import { useEffect, useState } from 'react';
import { presetsApi } from '../../../lib/api';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function PresetsSection() {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    presetsApi.list().then((res) => setPresets(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function saveDefaultCompressLevel(level) {
    await presetsApi.create({
      tool_type: 'pdf_compress',
      config_json: { level },
      is_default: true,
    });
    load();
  }

  const currentDefault = presets.find((p) => p.tool_type === 'pdf_compress' && p.is_default);

  return (
    <Card>
      <h3 className="font-heading text-h3 text-on-surface mb-6">Manajemen Preset</h3>

      {loading ? (
        <p className="font-body text-body text-accent-muted">Memuat...</p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="font-body text-body text-on-surface mb-2">Level compress default</p>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level}
                  onClick={() => saveDefaultCompressLevel(level)}
                  className={`px-4 py-2 rounded-lg font-body text-body border capitalize transition-colors ${
                    currentDefault?.config_json?.level === level
                      ? 'bg-highlight text-base-dark border-highlight'
                      : 'border-accent-muted/30 text-on-surface hover:border-accent-muted'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <p className="font-body text-caption text-accent-muted">
            Preset warna QR default belum ada UI-nya di sesi ini - struktur backend-nya
            (tool_type: 'qr_generate') udah siap, tinggal ditambah form-nya kalau dibutuhin.
          </p>
        </div>
      )}
    </Card>
  );
}
