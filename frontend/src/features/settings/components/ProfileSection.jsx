import Card from '../../../components/Card';
import Button from '../../../components/Button';

// Endpoint "ganti password" itu priority "Should" di PRD §6.1, TAPI belum
// diimplementasi di backend sesi-sesi sebelumnya. Form ini SENGAJA di-disable
// dengan pesan jujur, daripada bikin form yang keliatan jalan tapi gak
// ngapa-ngapain pas di-submit.
export default function ProfileSection({ user }) {
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

      <div className="mt-6 pt-6 border-t border-accent-muted/10">
        <p className="font-body text-body text-on-surface mb-3">Ganti Password</p>
        <div className="space-y-3 opacity-50 pointer-events-none">
          <input
            disabled
            placeholder="Password baru"
            className="w-full px-4 py-3 bg-base-dark border border-accent-muted/30 rounded-lg text-on-surface font-body text-body"
          />
          <Button variant="primary" disabled>
            Simpan Password Baru
          </Button>
        </div>
        <p className="font-body text-caption text-error mt-2">
          Belum tersedia - endpoint ganti password belum diimplementasi di backend.
        </p>
      </div>
    </Card>
  );
}
