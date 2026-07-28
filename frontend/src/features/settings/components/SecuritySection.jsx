import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function SecuritySection() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Logout di backend cuma formalitas (JWT stateless) - tetep lanjut
      // clear token di client walau request-nya gagal.
    }
    logout();
    navigate('/login');
  }

  return (
    <Card>
      <h3 className="font-heading text-h3 text-on-surface mb-6">Keamanan & Sesi</h3>
      <p className="font-body text-body text-accent-muted mb-4">
        Sesi kamu aktif di perangkat ini. Logout kalau lagi di perangkat orang lain.
      </p>
      <Button variant="secondary" icon="logout" onClick={handleLogout}>
        Logout
      </Button>
    </Card>
  );
}
