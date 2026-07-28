import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';

export default function ToolCard({ icon, title, description, ctaLabel, to, variant = 'primary' }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-surface rounded-xl border border-accent-muted/20 p-6 flex flex-col hover:border-highlight transition-colors group cursor-pointer relative overflow-hidden"
      onClick={() => navigate(to)}
    >
      <div className="absolute -right-4 -top-4 w-32 h-32 bg-highlight/5 rounded-full blur-2xl group-hover:bg-highlight/10 transition-all" />
      <div className="w-12 h-12 rounded-lg bg-base-dark flex items-center justify-center mb-6 border border-accent-muted/10 group-hover:bg-highlight group-hover:text-base-dark transition-colors">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <h3 className="font-heading text-h2 text-on-surface mb-2">{title}</h3>
      <p className="font-body text-body text-accent-muted mb-6 flex-grow">{description}</p>
      <Button variant={variant} icon="arrow_forward" className="w-fit">
        {ctaLabel}
      </Button>
    </div>
  );
}
