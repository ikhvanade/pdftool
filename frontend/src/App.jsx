import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';

const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const PdfToolkitPage = lazy(() => import('./features/pdf-toolkit/PdfToolkitPage'));
const QrGeneratorPage = lazy(() => import('./features/qr-generator/QrGeneratorPage'));
const ImageToolPage = lazy(() => import('./features/image-tool/ImageToolPage'));
const HistoryPage = lazy(() => import('./features/history/HistoryPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* PDFTool landing, PDF Toolkit, QR, Image bisa diakses guest (kena quota check di backend) */}
          <Route path="/" element={<AppShell><DashboardPage /></AppShell>} />
          <Route path="/pdf-toolkit" element={<AppShell><PdfToolkitPage /></AppShell>} />
          <Route path="/qr-generator" element={<AppShell><QrGeneratorPage /></AppShell>} />
          <Route path="/image" element={<AppShell><ImageToolPage /></AppShell>} />

          {/* History & Settings WAJIB login */}
          <Route path="/history" element={<ProtectedRoute><AppShell><HistoryPage /></AppShell></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppShell><SettingsPage /></AppShell></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
