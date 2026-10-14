import "./LoadingSnippet.css";

type LoadingSnippetProps = {
  label?: string;
};

export function LoadingSnippet({ label = "Cargando..." }: LoadingSnippetProps) {
  return (
    <main className="loading-page">
      <section className="loading-card" role="status" aria-live="polite">
        <span className="loading-brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M7 24.5 13.4 8l4.2 10.1 2.3-5.6L25 24.5" />
            <circle cx="23.5" cy="8.5" r="2.5" />
          </svg>
        </span>
        <span className="loading-spinner" aria-hidden="true" />
        <span className="loading-label">{label}</span>
        <span className="loading-caption">Un momento, por favor</span>
      </section>
    </main>
  );
}
