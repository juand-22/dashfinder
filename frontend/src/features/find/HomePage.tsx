import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/context/auth.context";
import { FindRequestError, searchUsers, type FindRecord } from "./find.api";
import "./HomePage.css";

function CopyButton({
  label,
  copied,
  onClick,
}: {
  label: string;
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="copy-field-button"
      type="button"
      aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
      title={copied ? "Copiado" : `Copiar ${label}`}
      onClick={onClick}
    >
      {copied ? (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m3 8.2 3.1 3.1L13 4.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="5.5" y="5.5" width="8" height="9" rx="1.5" />
          <path d="M10.5 3.5V3A1.5 1.5 0 0 0 9 1.5H3A1.5 1.5 0 0 0 1.5 3v7A1.5 1.5 0 0 0 3 11.5h.5" />
        </svg>
      )}
    </button>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<FindRecord[]>([]);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<number>>(
    () => new Set(),
  );
  const [hashNotice, setHashNotice] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

  async function copyValue(value: string, target: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyError(null);
      setCopiedTarget(target);
    } catch {
      setCopyError("No se pudo copiar al portapapeles. Comprueba los permisos del navegador.");
    }
  }

  function copyIfPresent(value: string | null, target: string) {
    if (value !== null) void copyValue(value, target);
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchTerm = username.trim();
    if (!searchTerm || isSearching) return;

    setError(null);
    setIsSearching(true);
    setHasSearched(false);
    setResults([]);
    setRevealedPasswords(new Set());
    setHashNotice(null);

    try {
      const records = await searchUsers(searchTerm);
      setResults(records);
      setHasSearched(true);
    } catch (searchError) {
      setError(
        searchError instanceof FindRequestError
          ? searchError.message
          : "Ocurrió un error inesperado durante la búsqueda.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  function togglePassword(index: number) {
    setRevealedPasswords((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="home-page">
      <header className="topbar">
        <Link className="home-brand" to="/" aria-label="Dashfinder, inicio">
          <span className="home-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M7 24.5 13.4 8l4.2 10.1 2.3-5.6L25 24.5" />
              <circle cx="23.5" cy="8.5" r="2.5" />
            </svg>
          </span>
          <span>dashfinder</span>
        </Link>

        <nav className="main-nav" aria-label="Navegación principal">
          <Link className="main-nav-link active" to="/" aria-current="page">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m2.8 8.8 7.2-6 7.2 6v8.4a.8.8 0 0 1-.8.8h-4.1v-5.2H7.7V18H3.6a.8.8 0 0 1-.8-.8V8.8Z" />
            </svg>
            Home
          </Link>
        </nav>

        <div className="topbar-user" title={user?.username ?? "Cuenta activa"}>
          <span className="user-avatar" aria-hidden="true">
            {(user?.username.charAt(0) || "U").toUpperCase()}
          </span>
          <span className="topbar-username">{user?.username}</span>
        </div>
      </header>

      <main className="home-content">
        <section className="search-intro">
          <span className="section-eyebrow">
            <span className="status-dot" />
            BÚSQUEDA DE CUENTAS
          </span>
        </section>

        <section className="search-panel" aria-labelledby="search-title">
          <div className="search-panel-heading">
            <div className="search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 5 5" />
              </svg>
            </div>
            <div>
              <h2 id="search-title">Buscar usuario</h2>
              <p>Introduce el nombre exacto que quieres encontrar.</p>
            </div>
          </div>

          <form className="search-form" onSubmit={handleSearch}>
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
                placeholder="Por ejemplo, no_ad"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
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

        {error && (
          <div className="search-message error-message" role="alert">
            <span className="message-icon" aria-hidden="true">!</span>
            <span>{error}</span>
          </div>
        )}
        {copyError && (
          <div className="search-message error-message" role="alert">
            <span className="message-icon" aria-hidden="true">!</span>
            <span>{copyError}</span>
          </div>
        )}

        {hasSearched && (
          <section className="results-section" aria-live="polite">
            <div className="results-heading">
              <div>
                <span className="section-eyebrow">RESULTADOS</span>
                <h2>
                  {results.length
                    ? `Coincidencias para “${username.trim()}”`
                    : "Sin coincidencias"}
                </h2>
              </div>
              <span className="result-count">
                {results.length} {results.length === 1 ? "registro" : "registros"}
              </span>
            </div>

            {results.length > 0 ? (
              <div className="results-grid">
                {results.map((record, index) => {
                  const isHashed =
                    record.password !== null &&
                    (/^\$[A-Z0-9]+\$/i.test(record.password) ||
                      /^[a-f0-9]{64}(?:[a-f0-9]{64})?$/i.test(record.password));
                  const hasPassword = record.password !== null;
                  const isPasswordVisible = revealedPasswords.has(index);
                  const serverName = record.server ?? "Servidor desconocido";
                  return (
                    <article
                      className="result-card"
                      key={`${record.name ?? "sin-usuario"}-${serverName}-${record.ip ?? "sin-ip"}-${index}`}
                    >
                      <div className="result-card-header">
                        <div className="server-avatar" aria-hidden="true">
                          {serverName.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="server-details">
                          <div className="server-name-row">
                            <h3>{serverName}</h3>
                            {record.server !== null && (
                              <CopyButton
                                label="servidor"
                                copied={copiedTarget === `${index}-server`}
                                onClick={() => copyIfPresent(record.server, `${index}-server`)}
                              />
                            )}
                          </div>
                          <span>Servidor</span>
                        </div>
                        <span
                          className={`result-tag ${
                            isHashed ? "is-hashed" : hasPassword ? "is-plain" : "is-unknown"
                          }`}
                        >
                          {isHashed ? "Hasheada" : hasPassword ? "Sin hashear" : "Sin dato"}
                        </span>
                      </div>

                      <dl className="result-fields">
                        <div className="result-field">
                          <dt>Usuario</dt>
                          <dd>
                            <span>{record.name ?? "—"}</span>
                            {record.name !== null && (
                              <CopyButton
                                label="usuario"
                                copied={copiedTarget === `${index}-name`}
                                onClick={() => copyIfPresent(record.name, `${index}-name`)}
                              />
                            )}
                          </dd>
                        </div>
                        <div className="result-field">
                          <dt>IP</dt>
                          <dd>
                            <span>{record.ip ?? "—"}</span>
                            {record.ip !== null && (
                              <CopyButton
                                label="IP"
                                copied={copiedTarget === `${index}-ip`}
                                onClick={() => copyIfPresent(record.ip, `${index}-ip`)}
                              />
                            )}
                          </dd>
                        </div>
                        <div className="result-field">
                          <dt>IP del servidor</dt>
                          <dd>
                            <span>{record.serverip ?? "—"}</span>
                            {record.serverip !== null && (
                              <CopyButton
                                label="IP del servidor"
                                copied={copiedTarget === `${index}-serverip`}
                                onClick={() => copyIfPresent(record.serverip, `${index}-serverip`)}
                              />
                            )}
                          </dd>
                        </div>
                        <div className="result-field">
                          <dt>Salt</dt>
                          <dd className="result-monospace">
                            <span>{record.salt ?? "—"}</span>
                            {record.salt !== null && (
                              <CopyButton
                                label="salt"
                                copied={copiedTarget === `${index}-salt`}
                                onClick={() => copyIfPresent(record.salt, `${index}-salt`)}
                              />
                            )}
                          </dd>
                        </div>
                        <div className="result-field password-field">
                          <dt>
                            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <rect x="3" y="7" width="10" height="7" rx="2" />
                              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
                            </svg>
                            Contraseña
                          </dt>
                          <dd className="password-cell">
                            <div className="password-value">
                              <code>
                                {isHashed && !isPasswordVisible
                                  ? "••••••••••••"
                                  : record.password ?? "—"}
                              </code>
                              {record.password !== null && (
                                <CopyButton
                                  label="contraseña"
                                  copied={copiedTarget === `${index}-password`}
                                  onClick={() =>
                                    copyIfPresent(record.password, `${index}-password`)
                                  }
                                />
                              )}
                            </div>
                            <div className="password-actions">
                              <button
                                className="password-action password-action--hash"
                                type="button"
                                disabled={!isHashed || !hasPassword}
                                onClick={() => {
                                  setHashNotice(hashNotice === index ? null : index);
                                  if (!isPasswordVisible) togglePassword(index);
                                }}
                              >
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                  <path d="M8 2v8m0 0 3-3m-3 3L5 7" />
                                  <path d="M3 10v3a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3" />
                                </svg>
                                Deshashear
                              </button>
                              {record.password !== null && (
                                <button
                                  className="password-action password-action--copy"
                                  type="button"
                                  onClick={() =>
                                    copyIfPresent(record.password, `${index}-password`)
                                  }
                                >
                                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <rect x="5.5" y="5.5" width="8" height="9" rx="1.5" />
                                    <path d="M10.5 3.5V3A1.5 1.5 0 0 0 9 1.5H3A1.5 1.5 0 0 0 1.5 3v7A1.5 1.5 0 0 0 3 11.5h.5" />
                                  </svg>
                                  Copiar contraseña
                                </button>
                              )}
                            </div>
                          </dd>
                        </div>
                      </dl>
                      {isHashed && hashNotice === index && (
                        <p className="hash-notice" role="status">
                          Un hash no se puede revertir para recuperar la
                          contraseña original. Puedes consultar el hash
                          mostrado, pero no deshashearlo.
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-results">
                <span className="empty-search-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 5 5M8.3 10.8h5" />
                  </svg>
                </span>
                <h3>No encontramos ese usuario</h3>
                <p>Comprueba el nombre e inténtalo de nuevo.</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
