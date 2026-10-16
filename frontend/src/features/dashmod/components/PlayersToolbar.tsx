import type { PlayerFilter } from "../types";

const FILTERS: { value: PlayerFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "found", label: "Encontrados" },
  { value: "not-found", label: "No encontrados" },
];

function FilterIcon({ value }: { value: PlayerFilter }) {
  if (value === "found") {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.2" />
        <path d="m5.2 8.2 1.9 1.9 3.8-4.1" />
      </svg>
    );
  }

  if (value === "not-found") {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.2" />
        <path d="m5.7 5.7 4.6 4.6m0-4.6-4.6 4.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2.4" y="2.4" width="4.7" height="4.7" rx="1.3" />
      <rect x="8.9" y="2.4" width="4.7" height="4.7" rx="1.3" />
      <rect x="2.4" y="8.9" width="4.7" height="4.7" rx="1.3" />
      <rect x="8.9" y="8.9" width="4.7" height="4.7" rx="1.3" />
    </svg>
  );
}

type PlayersToolbarProps = {
  query: string;
  filter: PlayerFilter;
  counts: Record<PlayerFilter, number>;
  onQueryChange: (value: string) => void;
  onFilterChange: (filter: PlayerFilter) => void;
};

export function PlayersToolbar({
  query,
  filter,
  counts,
  onQueryChange,
  onFilterChange,
}: PlayersToolbarProps) {
  const activeIndex = FILTERS.findIndex((item) => item.value === filter);

  return (
    <div className="players-toolbar">
      <div className="players-search">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="8.8" cy="8.8" r="5.8" />
          <path d="m13.2 13.2 4.3 4.3" />
        </svg>
        <input
          type="search"
          value={query}
          placeholder="Buscar jugador..."
          aria-label="Buscar jugador reportado"
          autoComplete="off"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div
        className="players-filters"
        role="group"
        aria-label="Filtrar jugadores por estado"
      >
        <span
          className="players-filters-indicator"
          style={{ transform: `translateX(${Math.max(activeIndex, 0) * 100}%)` }}
          aria-hidden="true"
        />

        {FILTERS.map((item) => {
          const isActive = filter === item.value;

          return (
            <button
              key={item.value}
              type="button"
              className={`players-filter-button${isActive ? " is-active" : ""}`}
              aria-pressed={isActive}
              onClick={() => onFilterChange(item.value)}
            >
              <span className="players-filter-icon">
                <FilterIcon value={item.value} />
              </span>
              <span className="players-filter-label">{item.label}</span>
              <span key={counts[item.value]} className="players-filter-count">
                {counts[item.value]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
