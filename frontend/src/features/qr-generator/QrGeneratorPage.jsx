import { useState } from 'react';
import QrInputPanel from './components/QrInputPanel';
import QrPreviewPanel from './components/QrPreviewPanel';
import Card from '../../components/Card';

export default function QrGeneratorPage() {
  const [text, setText] = useState('');
  const [darkColor, setDarkColor] = useState('#222831');
  const [lightColor, setLightColor] = useState('#DFD0B8');
  const [format, setFormat] = useState('png');

  return (
    <>
      <section className="mb-6">
        <h2 className="font-heading text-h1 text-on-surface mb-2">QR Generator</h2>
        <p className="font-body text-body-lg text-accent-muted">
          Buat kode QR kustom untuk tautan, teks, dan lainnya.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter-grid">
        <Card>
          <h3 className="font-heading text-h3 text-on-surface mb-4">Penyesuaian Gaya</h3>
          <QrInputPanel
            text={text}
            setText={setText}
            darkColor={darkColor}
            setDarkColor={setDarkColor}
            lightColor={lightColor}
            setLightColor={setLightColor}
            format={format}
            setFormat={setFormat}
          />
        </Card>

        <div>
          <h3 className="font-heading text-h3 text-on-surface mb-4">Pratinjau Langsung</h3>
          <QrPreviewPanel text={text} darkColor={darkColor} lightColor={lightColor} format={format} />
        </div>
      </div>
    </>
  );
}
