import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { guestApi } from '../lib/api';

function timeAwareGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export default function TopBar() {
  const user = useAuthStore((s) => s.user);
  const [quota, setQuota] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) return; // unlimited buat user login, gak perlu fetch quota
    guestApi
      .getQuota()
      .then(setQuota)
      .catch(() => setQuota(null));
  }, [user]);

  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden md:flex items-center justify-between px-margin-page py-4 border-b border-accent-muted/10">
        {user ? (
          <h2 className="font-heading text-h3 text-on-surface">
            {timeAwareGreeting()}, {user.username}
          </h2>
        ) : (
          <div className="flex items-center gap-3">
            {quota?.data && !quota.data.unlimited && (
              <span
                className={`font-body text-caption px-3 py-1.5 rounded-full border ${
                  quota.data.remaining <= 1
                    ? 'border-error text-error'
                    : 'border-highlight/40 text-highlight'
                }`}
              >
                Sisa {quota.data.remaining}/{quota.data.limit} pemakaian gratis
              </span>
            )}
            <Link
              to="/login"
              className="font-body text-body text-highlight hover:underline"
            >
              Login untuk unlimited
            </Link>
          </div>
        )}
        <button
          onClick={() => navigate(user ? '/settings' : '/login')}
          className="text-on-surface hover:text-highlight transition-colors"
          title={user ? 'Pengaturan akun' : 'Login'}
        >
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </header>

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-base-dark sticky top-0 z-30 border-b border-accent-muted/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-heading text-h3 text-highlight">VannTools</span>
        </div>
        {!user && quota?.data && !quota.data.unlimited && (
          <span
            className={`font-body text-caption px-2 py-1 rounded-full border ${
              quota.data.remaining <= 1 ? 'border-error text-error' : 'border-highlight/40 text-highlight'
            }`}
          >
            {quota.data.remaining}/{quota.data.limit}
          </span>
        )}
      </header>
    </>
  );
}
