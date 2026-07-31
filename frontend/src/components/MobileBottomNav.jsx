import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Sesuai design.md §8: "sidebar collapses to bottom nav on mobile (<768px)".
// Sebelumnya ini BELUM diimplementasi sama sekali - mobile header cuma nampilin
// logo + quota badge, gak ada satupun link navigasi (termasuk ke Login/Settings).
// Itu bug kritis yang dilaporkan user.

const NAV_ITEMS = [
  { to: '/', icon: 'dashboard', label: 'Home' },
  { to: '/pdf-toolkit', icon: 'picture_as_pdf', label: 'PDF' },
  { to: '/qr-generator', icon: 'qr_code_2', label: 'QR' },
  { to: '/history', icon: 'history', label: 'History', requiresAuth: true },
];

export default function MobileBottomNav() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const isLoggedIn = Boolean(user);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-base-dark border-t border-accent-muted/20 flex items-center justify-around py-2 z-40">
      {NAV_ITEMS.map((item) => {
        const disabled = item.requiresAuth && !isLoggedIn;
        return disabled ? (
          <span key={item.to} className="flex flex-col items-center gap-0.5 px-2 py-1 text-accent-muted/30">
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="font-body text-[10px]">{item.label}</span>
          </span>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 ${
                isActive ? 'text-highlight' : 'text-accent-muted'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="font-body text-[10px]">{item.label}</span>
          </NavLink>
        );
      })}

      {/* Login/Settings - beda tujuan tergantung status login, ini yang tadinya
          gak ada sama sekali di mobile (user gak bisa login/buka settings). */}
      <button
        onClick={() => navigate(isLoggedIn ? '/settings' : '/login')}
        className={`flex flex-col items-center gap-0.5 px-2 py-1 text-accent-muted`}
      >
        <span className="material-symbols-outlined text-xl">
          {isLoggedIn ? 'settings' : 'login'}
        </span>
        <span className="font-body text-[10px]">{isLoggedIn ? 'Settings' : 'Login'}</span>
      </button>
    </nav>
  );
}
