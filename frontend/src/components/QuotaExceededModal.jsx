import { useNavigate } from 'react-router-dom';
import { useQuotaModalStore } from '../store/quotaModalStore';
import Button from './Button';

// design.md §5.2.1 - satu CTA aja ("Login Sekarang"), TIDAK ada CTA sign-up.
export default function QuotaExceededModal() {
  const open = useQuotaModalStore((s) => s.open);
  const hide = useQuotaModalStore((s) => s.hide);
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" role="dialog" aria-modal="true" onClick={hide}>
      <div className="bg-surface border border-line rounded-xl p-8 max-w-md w-full text-center" onClick={(e) => e.stopPropagation()}>
        <span className="material-symbols-outlined text-5xl text-primary dark:text-accent-heading mb-3 block">lock</span>
        <h2 className="font-heading font-bold text-h2 text-ink dark:text-accent-heading mb-2">Kuota gratis kamu habis!</h2>
        <p className="font-body text-body text-muted mb-6">
          Pemakaian gratis buat mode tamu udah kepake semua. Login buat pemakaian unlimited.
        </p>
        <Button className="w-full" onClick={() => { hide(); navigate('/login'); }}>
          Login Sekarang
        </Button>
      </div>
    </div>
  );
}
