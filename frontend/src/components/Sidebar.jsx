import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const NAV_ITEMS = [
  { to: '/', icon: 'dashboard', label: 'Dashboard' },
  { to: '/pdf-toolkit', icon: 'picture_as_pdf', label: 'PDF Toolkit' },
  { to: '/qr-generator', icon: 'qr_code_2', label: 'QR Generator' },
  { to: '/history', icon: 'history', label: 'History', requiresAuth: true },
  { to: '/settings', icon: 'settings', label: 'Settings', requiresAuth: true },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = Boolean(user);

  return (
    <nav className="hidden md:flex bg-base-dark border-r border-accent-muted/20 fixed left-0 top-0 h-full w-sidebar-width flex-col p-stack-md z-40">
      <div className="mb-8 px-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-highlight">
          <span className="material-symbols-outlined">widgets</span>
        </div>
        <div>
          <h1 className="font-heading text-h3 text-highlight">Ruang Kerja</h1>
          <p className="font-body text-caption text-accent-muted">
            {isLoggedIn ? `Halo, ${user.username}` : 'Mode Tamu'}
          </p>
        </div>
      </div>

      <ul className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const disabled = item.requiresAuth && !isLoggedIn;
          return (
            <li key={item.to}>
              {disabled ? (
                <span
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-accent-muted/40 cursor-not-allowed"
                  title="Login dulu buat akses ini"
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-body text-body">{item.label}</span>
                </span>
              ) : (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors active:scale-95 duration-150 ${
                      isActive
                        ? 'bg-surface text-highlight font-bold'
                        : 'text-on-surface hover:bg-surface/60'
                    }`
                  }
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-body text-body">{item.label}</span>
                </NavLink>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
