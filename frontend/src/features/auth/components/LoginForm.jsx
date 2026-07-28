import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import Button from '../../../components/Button';

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login(identifier, password);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      // Sesuai response backend: { success:false, error: 'INVALID_CREDENTIALS' | 'VALIDATION_ERROR' | ... }
      const code = err.response?.data?.error;
      if (code === 'INVALID_CREDENTIALS') {
        setError('Username/email atau password salah.');
      } else if (code === 'TOO_MANY_LOGIN_ATTEMPTS') {
        setError('Terlalu banyak percobaan. Coba lagi beberapa menit lagi.');
      } else {
        setError('Gagal login. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block font-body text-body text-accent-muted ml-1" htmlFor="identity">
          Username / Email
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-accent-muted group-focus-within:text-highlight transition-colors">
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <input
            id="identity"
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="nama@email.com"
            className="block w-full pl-10 pr-3 py-3 bg-base-dark border border-accent-muted/30 rounded-lg text-on-surface placeholder-accent-muted/50 focus:ring-2 focus:ring-highlight focus:border-transparent transition-all duration-200 outline-none font-body text-body"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block font-body text-body text-accent-muted ml-1" htmlFor="password">
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-accent-muted group-focus-within:text-highlight transition-colors">
            <span className="material-symbols-outlined text-lg">lock</span>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="block w-full pl-10 pr-3 py-3 bg-base-dark border border-accent-muted/30 rounded-lg text-on-surface placeholder-accent-muted/50 focus:ring-2 focus:ring-highlight focus:border-transparent transition-all duration-200 outline-none font-body text-body"
          />
        </div>
      </div>

      {error && (
        <p className="font-body text-caption text-error" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" icon="arrow_forward" className="w-full mt-8" disabled={loading}>
        {loading ? 'Memproses...' : 'Masuk'}
      </Button>
    </form>
  );
}
