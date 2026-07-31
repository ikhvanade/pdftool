import { useState } from 'react';
import { authApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function ProfileSection({ user }) {
  const login = useAuthStore((s) => s.login); // dipake buat refresh token+user di store

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileStatus, setProfileStatus] = useState('idle'); // idle | saving | success | error
  const [profileError, setProfileError] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwStatus, setPwStatus] = useState('idle');
  const [pwError, setPwError] = useState(null);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileStatus('saving');
    setProfileError(null);
    try {
      const res = await authApi.updateProfile(username, email);
      // Backend nerbitin token BARU karena username ikut ke-sign di JWT -
      // update store biar konsisten tanpa perlu logout-login manual.
      login(res.data.token, res.data.user);
      setProfileStatus('success');
    } catch (err) {
      setProfileStatus('error');
      const code = err.response?.data?.error;
      if (code === 'USERNAME_OR_EMAIL_TAKEN') {
        setProfileError('Username atau email udah dipake orang lain.');
      } else if (code === 'VALIDATION_ERROR') {
        setProfileError('Username minimal 3 karakter, email harus format valid.');
      } else {
        setProfileError('Gagal update profil. Coba lagi.');
      }
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwStatus('saving');
    setPwError(null);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setPwStatus('success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwStatus('error');
      const code = err.response?.data?.error;
      if (code === 'CURRENT_PASSWORD_INCORRECT') {
        setPwError('Password lama salah.');
      } else if (code === 'VALIDATION_ERROR') {
        setPwError('Password baru minimal 8 karakter.');
      } else {
        setPwError('Gagal ganti password. Coba lagi.');
      }
    }
  }

  return (
    <Card>
      <h3 className="font-heading text-h3 text-on-surface mb-6">Profil & Akun</h3>

      <form onSubmit={handleSaveProfile} className="space-y-3">
        <div>
          <label className="block font-body text-caption text-accent-muted mb-1" htmlFor="profile-username">
            Username
          </label>
          <input
            id="profile-username"
            type="text"
            required
            minLength={3}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-base-dark border border-accent-muted/30 rounded-lg text-on-surface focus:ring-2 focus:ring-highlight outline-none font-body text-body"
          />
        </div>
        <div>
          <label className="block font-body text-caption text-accent-muted mb-1" htmlFor="profile-email">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-base-dark border border-accent-muted/30 rounded-lg text-on-surface focus:ring-2 focus:ring-highlight outline-none font-body text-body"
          />
        </div>
        <Button type="submit" variant="primary" disabled={profileStatus === 'saving'}>
          {profileStatus === 'saving' ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
        {profileStatus === 'success' && (
          <p className="font-body text-caption text-success">Profil berhasil diupdate.</p>
        )}
        {profileStatus === 'error' && profileError && (
          <p className="font-body text-caption text-error">{profileError}</p>
        )}
      </form>

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
        <Button type="submit" variant="primary" disabled={pwStatus === 'saving'}>
          {pwStatus === 'saving' ? 'Menyimpan...' : 'Simpan Password Baru'}
        </Button>
        {pwStatus === 'success' && (
          <p className="font-body text-caption text-success">Password berhasil diganti.</p>
        )}
        {pwStatus === 'error' && pwError && (
          <p className="font-body text-caption text-error">{pwError}</p>
        )}
      </form>
    </Card>
  );
}
