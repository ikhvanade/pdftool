import { authApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const user = useAuthStore((s) => s.user);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    // User login -> simpan juga ke DB (design.md §3: tema disimpan per-user).
    // Best-effort: kalau gagal, tema tetap ke-ganti di browser ini.
    if (user) authApi.updateTheme(next).catch(() => {});
  }

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      className="text-muted hover:text-primary dark:hover:text-accent-heading transition-colors"
    >
      <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
    </button>
  );
}
