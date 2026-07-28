import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-load per halaman - pdf-lib & jszip (dipake PdfToolkitPage) itu berat
// (~800KB), gak perlu ke-load di bundle awal kalau user cuma buka Dashboard/QR.
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const PdfToolkitPage = lazy(() => import('./features/pdf-toolkit/PdfToolkitPage'));
const QrGeneratorPage = lazy(() => import('./features/qr-generator/QrGeneratorPage'));
const HistoryPage = lazy(() => import('./features/history/HistoryPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <span className="material-symbols-outlined animate-spin text-highlight text-3xl">progress_activity</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard, PDF Toolkit, QR Generator bisa diakses guest (kena quota
              check di backend), makanya gak dibungkus ProtectedRoute. */}
          <Route path="/" element={<AppShell><DashboardPage /></AppShell>} />
          <Route path="/pdf-toolkit" element={<AppShell><PdfToolkitPage /></AppShell>} />
          <Route path="/qr-generator" element={<AppShell><QrGeneratorPage /></AppShell>} />

          {/* History & Settings WAJIB login (sesuai PRD §6.1 & §6.5) */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <AppShell><HistoryPage /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppShell><SettingsPage /></AppShell>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
