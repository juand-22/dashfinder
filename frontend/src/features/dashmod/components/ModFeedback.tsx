type ModFeedbackProps = {
  variant: "loading" | "error";
  message?: string;
  onRetry?: () => void;
};

export function ModFeedback({ variant, message, onRetry }: ModFeedbackProps) {
  if (variant === "loading") {
    return (
      <section className="feature-placeholder mod-feedback" aria-live="polite">
        <span className="section-eyebrow">DASHMOD</span>
        <div className="server-status-message" role="status">
          <span className="search-spinner" aria-hidden="true" />
          Cargando el estado de tu mod...
        </div>
      </section>
    );
  }

  return (
    <section className="feature-placeholder mod-feedback" role="alert">
      <span className="section-eyebrow">DASHMOD</span>
      <h1>No se pudo cargar el mod</h1>
      <p>{message ?? "Ocurrió un error inesperado. Inténtalo de nuevo."}</p>
      {onRetry && (
        <div className="mod-not-configured-actions">
          <button className="dashmod-refresh" type="button" onClick={onRetry}>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13 8a5 5 0 1 1-1.5-3.5M13 2v3h-3" />
            </svg>
            Reintentar
          </button>
        </div>
      )}
    </section>
  );
}
