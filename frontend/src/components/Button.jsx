const VARIANTS = {
  primary:
    'bg-highlight text-base-dark hover:brightness-105 shadow-[0_4px_20px_rgba(223,208,184,0.15)]',
  secondary:
    'bg-transparent border-[1.5px] border-accent-muted text-on-surface hover:border-highlight hover:text-highlight',
  ghost: 'text-on-surface hover:bg-surface',
};

export default function Button({
  variant = 'primary',
  icon,
  children,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={`font-body text-body py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
      {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
    </button>
  );
}
