import { useAuthStore } from '../../store/authStore';
import ProfileSection from './components/ProfileSection';
import PresetsSection from './components/PresetsSection';
import SecuritySection from './components/SecuritySection';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <>
      <section className="mb-6">
        <h2 className="font-heading text-h1 text-on-surface mb-2">Pengaturan</h2>
        <p className="font-body text-body-lg text-accent-muted">Kelola akun & preferensi kamu.</p>
      </section>

      <div className="space-y-gutter-grid max-w-2xl">
        <ProfileSection user={user} />
        <PresetsSection />
        <SecuritySection />
      </div>
    </>
  );
}
