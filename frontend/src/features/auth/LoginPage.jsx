import { Link } from 'react-router-dom';
import LoginForm from './components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-margin-page bg-base-dark text-on-surface font-body antialiased selection:bg-highlight selection:text-base-dark">
      <div className="w-full max-w-md relative z-10">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-highlight/5 rounded-full blur-2xl -z-10 pointer-events-none" />
        <div className="absolute -bottom-16 -right-8 w-40 h-40 bg-accent-muted/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="bg-surface border border-accent-muted/20 rounded-xl p-8 sm:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-base-dark border border-accent-muted/30 mb-6">
              <span className="material-symbols-outlined text-4xl text-highlight">widgets</span>
            </div>
            <h1 className="font-heading text-h1 text-highlight mb-2 tracking-tight">VannTools</h1>
            <p className="font-body text-body text-accent-muted max-w-xs mx-auto">
              Ruang kerja personal Anda untuk PDF &amp; QR.
            </p>
          </div>

          <LoginForm />

          <div className="mt-10 pt-6 border-t border-accent-muted/10 text-center">
            <p className="font-body text-body text-accent-muted">
              Cuma mau coba-coba?{' '}
              <Link
                to="/"
                className="text-highlight hover:text-white font-medium underline underline-offset-4"
              >
                Pakai tanpa login <span className="text-xs text-accent-muted no-underline">(5x gratis)</span>
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6 text-accent-muted/50 font-body text-caption flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">security</span> Secured by VannTools
        </div>
      </div>
    </div>
  );
}
