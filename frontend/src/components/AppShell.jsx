import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileBottomNav from './MobileBottomNav';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-base-dark text-on-surface">
      <Sidebar />
      <main className="flex-1 md:ml-sidebar-width">
        <TopBar />
        <div className="p-4 md:p-margin-page max-w-7xl mx-auto space-y-8 pb-20 md:pb-8">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
