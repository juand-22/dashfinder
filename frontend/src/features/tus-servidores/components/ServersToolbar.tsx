type ServersToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

export function ServersToolbar({ query, onQueryChange }: ServersToolbarProps) {
  return (
    <div className="servers-toolbar">
      <div className="servers-search">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="8.8" cy="8.8" r="5.8" />
          <path d="m13.2 13.2 4.3 4.3" />
        </svg>
        <input
          type="search"
          value={query}
          placeholder="Buscar servidor..."
          aria-label="Buscar servidor por nombre"
          autoComplete="off"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
    </div>
  );
}
