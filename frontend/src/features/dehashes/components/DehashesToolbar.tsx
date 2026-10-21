type DehashesToolbarProps = {
  query: string;
  /** Ej: `3 de 10`. Con `null` no se muestra el contador. */
  countLabel: string | null;
  onQueryChange: (value: string) => void;
};

export function DehashesToolbar({
  query,
  countLabel,
  onQueryChange,
}: DehashesToolbarProps) {
  return (
    <div className="dehashes-toolbar">
      <div className="dehashes-search">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="8.8" cy="8.8" r="5.8" />
          <path d="m13.2 13.2 4.3 4.3" />
        </svg>
        <input
          type="search"
          value={query}
          placeholder="Buscar por nombre..."
          aria-label="Buscar dehashes por nombre de jugador"
          autoComplete="off"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      {countLabel !== null && (
        <span className="result-count">{countLabel}</span>
      )}
    </div>
  );
}
