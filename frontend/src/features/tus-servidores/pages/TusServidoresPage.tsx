import { useState } from "react";
import { useAuth } from "../../auth/context/auth.context";
import { DashboardLayout } from "../../find/components/layout/DashboardLayout";
import { ServerCard } from "../components/ServerCard";
import { ServersToolbar } from "../components/ServersToolbar";
import { useServers } from "../hooks/useServers";
import "../styles/TusServidoresPage.css";

export function TusServidoresPage() {
  const { user } = useAuth();
  const { state, reload, isRefreshing } = useServers();
  const [query, setQuery] = useState("");

  const servers = state.status === "ready" ? state.servers : [];
  const term = query.trim().toLowerCase();
  const visibleServers = term
    ? servers.filter((server) => server.name.toLowerCase().includes(term))
    : servers;

  const hasServers = servers.length > 0;
  const hasMatches = visibleServers.length > 0;
  const countLabel =
    visibleServers.length === servers.length
      ? `${servers.length} ${servers.length === 1 ? "servidor" : "servidores"}`
      : `${visibleServers.length} de ${servers.length}`;

  return (
    <DashboardLayout username={user?.username} section="TUS SERVIDORES">
      <div className="servers">
        <header className="results-heading servers-heading">
          <div>
            <span className="section-eyebrow">TUS SERVIDORES</span>
            <h2>Servidores guardados</h2>
          </div>
          <div className="servers-heading-actions">
            {state.status === "ready" && (
              <span className="result-count">{countLabel}</span>
            )}
            {state.status === "ready" && hasServers && (
              <button
                className={`servers-refresh${
                  isRefreshing ? " is-refreshing" : ""
                }`}
                type="button"
                onClick={reload}
                disabled={isRefreshing}
                aria-busy={isRefreshing}
                aria-label="Actualizar tus servidores"
              >
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M13 8a5 5 0 1 1-1.5-3.5M13 2v3h-3" />
                </svg>
                {isRefreshing ? "Actualizando" : "Actualizar"}
              </button>
            )}
          </div>
        </header>

        {state.status === "loading" && (
          <section
            className="feature-placeholder servers-feedback"
            aria-live="polite"
          >
            <span className="section-eyebrow">TUS SERVIDORES</span>
            <div className="server-status-message" role="status">
              <span className="search-spinner" aria-hidden="true" />
              Cargando tus servidores...
            </div>
          </section>
        )}

        {state.status === "error" && (
          <section className="feature-placeholder servers-feedback" role="alert">
            <span className="section-eyebrow">TUS SERVIDORES</span>
            <h1>No se pudieron cargar</h1>
            <p>{state.message}</p>
            <div className="servers-feedback-actions">
              <button className="servers-refresh" type="button" onClick={reload}>
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M13 8a5 5 0 1 1-1.5-3.5M13 2v3h-3" />
                </svg>
                Reintentar
              </button>
            </div>
          </section>
        )}

        {state.status === "ready" && hasServers && (
          <ServersToolbar query={query} onQueryChange={setQuery} />
        )}

        {state.status === "ready" && hasMatches && (
          <div className="results-grid servers-grid">
            {visibleServers.map((server, index) => (
              <ServerCard
                key={`${server.ip}-${server.port}-${index}`}
                server={server}
                index={index}
              />
            ))}
          </div>
        )}

        {state.status === "ready" && !hasMatches && (
          <div className="empty-results">
            <span className="empty-search-icon" aria-hidden="true">
              {hasServers ? (
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="10.5" cy="10.5" r="6" />
                  <path d="m15.2 15.2 4.3 4.3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 6.5h16v4H4zm0 7h16v4H4z" />
                  <path d="M7 8.5h.01M7 15.5h.01m3-7h5m-5 6h5" />
                </svg>
              )}
            </span>
            <h3>
              {hasServers ? "Sin coincidencias" : "Todavía no tenés servidores"}
            </h3>
            <p>
              {hasServers
                ? "Ajusta la búsqueda para ver otros servidores."
                : "Cuando el mod reporte jugadores de tus servidores aparecerán aquí."}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
