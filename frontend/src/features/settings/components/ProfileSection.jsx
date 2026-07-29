import { useState } from 'react';
import { authApi } from '../../../lib/api';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function ProfileSection({ user }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | saving | success | error
  const [error, setError] = useState(null);

  async function handleChangePassword(e) {
    e.preventDefault();
    setStatus('saving');
    setError(null);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setStatus('success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setStatus('error');
      const code = err.response?.data?.error;
      if (code === 'CURRENT_PASSWORD_INCORRECT') {
        setError('Password lama salah.');
      } else if (code === 'VALIDATION_ERROR') {
        setError('Password baru minimal 8 karakter.');
      } else {
        setError('Gagal ganti password. Coba lagi.');
      }
    }
  }

  return (
    <Card>
      <h3 className="font-heading text-h3 text-on-surface mb-6">Profil & Akun</h3>
      <div className="space-y-4">
        <div>
          <p className="font-body text-caption text-accent-muted">Username</p>
          <p className="font-body text-body text-on-surface">{user?.username}</p>
        </div>
        <div>
          <p className="font-body text-caption text-accent-muted">Email</p>
          <p className="font-body text-body text-on-surface">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="mt-6 pt-6 border-t border-accent-muted/10 space-y-3">
        <p className="font-body text-body text-on-surface mb-1">Ganti Password</p>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Password lama"
          className="w-full px-4 py-3 bg-base-dark border border-accent-muted/30 rounded-lg text-on-surface placeholder-accent-muted/50 focus:ring-2 focus:ring-highlight outline-none font-body text-body"
        />
        <input
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Password baru (min. 8 karakter)"
          className="w-full px-4 py-3 bg-base-dark border border-accent-muted/30 rounded-lg text-on-surface placeholder-accent-muted/50 focus:ring-2 focus:ring-highlight outline-none font-body text-body"
        />
        <Button type="submit" variant="primary" disabled={status === 'saving'}>
          {status === 'saving' ? 'Menyimpan...' : 'Simpan Password Baru'}
        </Button>
        {status === 'success' && (
          <p className="font-body text-caption text-success">Password berhasil diganti.</p>
        )}
        {status === 'error' && error && (
          <p className="font-body text-caption text-error">{error}</p>
        )}
      </form>
    </Card>
  );
}
