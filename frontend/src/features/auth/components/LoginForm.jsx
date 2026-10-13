import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import Button from '../../../components/Button';

const INPUT_CLS = 'block w-full pl-10 pr-3 py-3 bg-page border border-line rounded-lg text-ink placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono text-[13px]';

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const setTheme = useThemeStore((s) => s.setTheme);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login(identifier, password);
      login(res.data.token, res.data.user);
      // Pakai preferensi tema yang tersimpan di akun (lintas device)
      if (res.data.user.theme) setTheme(res.data.user.theme);
      navigate('/');
    } catch (err) {
      const code = err.response?.data?.error;
      if (code === 'INVALID_CREDENTIALS') setError('Username/email atau password salah.');
      else if (code === 'TOO_MANY_LOGIN_ATTEMPTS') setError('Terlalu banyak percobaan. Coba lagi beberapa menit lagi.');
      else setError('Gagal login. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block font-mono text-[12px] font-medium text-muted" htmlFor="identity">Username / Email</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg pointer-events-none">mail</span>
          <input id="identity" type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="nama@email.com" className={INPUT_CLS} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block font-mono text-[12px] font-medium text-muted" htmlFor="password">Password</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg pointer-events-none">lock</span>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={INPUT_CLS} />
        </div>
      </div>

      {error && <p className="font-mono text-[12px] text-error" role="alert">{error}</p>}

      <Button type="submit" className="w-full" icon="arrow_forward" disabled={loading}>
        {loading ? 'Memproses...' : 'Masuk'}
      </Button>
    </form>
  );
}
