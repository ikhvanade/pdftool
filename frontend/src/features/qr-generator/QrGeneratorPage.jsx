import { useState } from 'react';
import QrInputPanel from './components/QrInputPanel';
import QrPreviewPanel from './components/QrPreviewPanel';
import ImageToQrPanel from './components/ImageToQrPanel';
import Card from '../../components/Card';

export default function QrGeneratorPage() {
  const [mode, setMode] = useState('text'); // 'text' | 'image'
  const [text, setText] = useState('');
  const [darkColor, setDarkColor] = useState('#222831');
  const [lightColor, setLightColor] = useState('#DFD0B8');
  const [format, setFormat] = useState('png');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  function handleLogoSelect(file) {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleLogoRemove() {
    setLogoFile(null);
    setLogoPreview(null);
  }

  return (
    <>
      <section className="mb-6">
        <h2 className="font-heading text-h1 text-on-surface mb-2">QR Generator</h2>
        <p className="font-body text-body-lg text-accent-muted">
          Buat kode QR custom untuk link, teks, WhatsApp, WiFi, dan lainnya dalam hitungan detik.
        </p>
      </section>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('text')}
          className={`px-5 py-2.5 rounded-full font-body text-body transition-colors ${
            mode === 'text' ? 'bg-highlight text-base-dark' : 'bg-surface border border-accent-muted/20 text-on-surface hover:bg-surface/60'
          }`}
        >
          Text / Link
        </button>
        <button
          onClick={() => setMode('image')}
          className={`px-5 py-2.5 rounded-full font-body text-body transition-colors ${
            mode === 'image' ? 'bg-highlight text-base-dark' : 'bg-surface border border-accent-muted/20 text-on-surface hover:bg-surface/60'
          }`}
        >
          Dari Gambar
        </button>
      </div>

      {mode === 'text' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter-grid">
          <Card>
            <h3 className="font-heading text-h3 text-on-surface mb-4">Kustomisasi QR</h3>
            <QrInputPanel
              text={text}
              setText={setText}
              darkColor={darkColor}
              setDarkColor={setDarkColor}
              lightColor={lightColor}
              setLightColor={setLightColor}
              format={format}
              setFormat={setFormat}
              logoPreview={logoPreview}
              onLogoSelect={handleLogoSelect}
              onLogoRemove={handleLogoRemove}
            />
          </Card>

          <div>
            <h3 className="font-heading text-h3 text-on-surface mb-4">Preview</h3>
            <QrPreviewPanel
              text={text}
              darkColor={darkColor}
              lightColor={lightColor}
              format={format}
              logoFile={logoFile}
            />
          </div>
        </div>
      ) : (
        <Card className="max-w-xl">
          <h3 className="font-heading text-h3 text-on-surface mb-4">QR dari Gambar</h3>
          <ImageToQrPanel darkColor={darkColor} lightColor={lightColor} format={format} />
        </Card>
      )}
    </>
  );
}
