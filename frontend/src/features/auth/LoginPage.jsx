import { Link } from 'react-router-dom';
import LoginForm from './components/LoginForm';

// design.md §5.0: TIDAK ada "Forgot Password?" (diputusin skip - ganti password
// dari Settings), TIDAK ada tombol OAuth/divider "or", TIDAK ada link daftar.
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-page text-ink">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 rounded-xl overflow-hidden border border-line bg-surface mb-4">
            <img src="/logo.png" alt="Logo PDFTool" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-heading font-bold text-h1 text-primary dark:text-accent-heading">PDFTool by Vann</h1>
          <p className="font-mono text-[13px] text-muted mt-1">Technical Suite</p>
        </div>

        <div className="bg-surface border border-line rounded-xl p-8">
          <LoginForm />
          <div className="mt-6 pt-5 border-t border-line text-center">
            <p className="font-body text-[13px] text-muted">
              Cuma mau coba-coba?{' '}
              <Link to="/" className="text-primary dark:text-accent-heading font-medium underline underline-offset-4">
                Pakai tanpa login
              </Link>{' '}
              <span className="font-mono text-[11px]">(5x gratis)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
