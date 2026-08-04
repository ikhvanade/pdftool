import { useState } from 'react';
import ToolTabs, { TOOLS } from './components/ToolTabs';
import MergePanel from './components/MergePanel';
import SplitPanel from './components/SplitPanel';
import WatermarkPanel from './components/WatermarkPanel';
import CompressPanel from './components/CompressPanel';
import ConvertPanel from './components/ConvertPanel';
import ProtectPanel from './components/ProtectPanel';
import ImageToPdfPanel from './components/ImageToPdfPanel';
import WordConvertPanel from './components/WordConvertPanel';
import Card from '../../components/Card';

const PANEL_BY_TOOL = {
  merge: MergePanel,
  split: SplitPanel,
  watermark: WatermarkPanel,
  compress: CompressPanel,
  convert: ConvertPanel,
  protect: ProtectPanel,
  'image-to-pdf': ImageToPdfPanel,
  'to-word': WordConvertPanel,
};

export default function PdfToolkitPage() {
  const [activeTool, setActiveTool] = useState('compress');
  const tool = TOOLS.find((t) => t.id === activeTool);
  const ActivePanel = PANEL_BY_TOOL[activeTool];

  return (
    <>
      <section className="mb-6">
        <h2 className="font-heading text-h1 text-on-surface mb-2">PDF Toolkit</h2>
        <p className="font-body text-body-lg text-accent-muted">
          Gabungkan, pisahkan, kompres, dan kelola dokumen PDF kamu.
        </p>
      </section>

      <ToolTabs active={activeTool} onChange={setActiveTool} />

      <Card className="mt-6">
        <ActivePanel />
        {tool.clientSide && (
          <p className="font-body text-caption text-accent-muted mt-6 pt-4 border-t border-accent-muted/10">
            Diproses langsung di browser kamu - file gak diupload ke server sama sekali.
          </p>
        )}
      </Card>
    </>
  );
}
