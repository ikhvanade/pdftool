export default function Card({ children, className = '', hoverable = false }) {
  return (
    <div
      className={`bg-surface rounded-xl border border-accent-muted/20 p-6 ${
        hoverable ? 'hover:border-highlight/50 transition-colors cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
