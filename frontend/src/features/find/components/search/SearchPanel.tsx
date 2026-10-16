import type { FormEvent } from "react";

type SearchPanelProps = {
  username: string;
  isSearching: boolean;
  onUsernameChange: (username: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
};

export function SearchPanel({
  username,
  isSearching,
  onUsernameChange,
  onSearch,
}: SearchPanelProps) {
  return (
    <section className="search-panel" aria-labelledby="search-title">
      <div className="search-panel-heading">
        <div className="search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 5 5" />
          </svg>
        </div>
        <div>
          <h2 id="search-title">Buscar cuentas</h2>
          <p>Busca un nombre de usuario de Minecraft.</p>
        </div>
      </div>

      <form className="search-form" onSubmit={onSearch}>
        <label className="visually-hidden" htmlFor="username-search">
          Nombre de usuario
        </label>
        <div className="search-input-wrap">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="8.8" cy="8.8" r="5.8" />
            <path d="m13.2 13.2 4.3 4.3" />
          </svg>
          <input
            id="username-search"
            name="username"
            type="search"
            autoComplete="off"
            placeholder="Nombre de usuario de Minecraft"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            required
          />
        </div>
        <button
          className="search-button"
          type="submit"
          disabled={isSearching || !username.trim()}
        >
          {isSearching ? (
            <>
              <span className="search-spinner" aria-hidden="true" />
              Buscando...
            </>
          ) : (
            <>
              Buscar
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h12m-5-5 5 5-5 5" />
              </svg>
            </>
          )}
        </button>
      </form>
      <p className="search-hint">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.1" />
          <path d="M8 7.2v3.5m0-5.8v.2" />
        </svg>
        La búsqueda distingue coincidencias exactas.
      </p>
    </section>
  );
}
