import { useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../auth/context/auth.context";
import { PlayerModal } from "../../dashmod/components/PlayerModal";
import { PlayersToolbar } from "../../dashmod/components/PlayersToolbar";
import type { PlayerFilter } from "../../dashmod/types";
import { DashboardLayout } from "../../find/components/layout/DashboardLayout";
import { useModalAccessibility } from "../../find/hooks/useModalAccessibility";
import { useServerStatus } from "../../find/hooks/useServerStatus";
import { stripServerPort } from "../../../utils/server-address";
import { ServerModal } from "../components/ServerModal";
import { ServerPlayerCard } from "../components/ServerPlayerCard";
import { ServerStatusSummary } from "../components/ServerStatusSummary";
import { useServerPlayers } from "../hooks/useServerPlayers";
import type { ServerPlayer } from "../types";
// El toolbar de jugadores y el PlayerModal viven en dashmod: importamos sus
// estilos para poder reusarlos acá.
import "../../dashmod/styles/DashmodPage.css";
import "../styles/TusServidoresPage.css";
import "../styles/ServerPlayersPage.css";

type NavigationState = { serverName?: string; serverIp?: string };

export function ServerPlayersPage() {
  const { user } = useAuth();
  const location = useLocation();
  const { serverId: serverIdParam } = useParams();
  const serverId = Number(serverIdParam);
  const { state, reload, isRefreshing } = useServerPlayers(serverId);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PlayerFilter>("all");
  const [selectedPlayer, setSelectedPlayer] = useState<ServerPlayer | null>(
    null,
  );
  const playerModalOpener = useRef<HTMLElement | null>(null);
  const [serverModalOpen, setServerModalOpen] = useState(false);
  const serverModalOpener = useRef<HTMLElement | null>(null);

  const navigationState = (location.state ?? null) as NavigationState | null;
  const players = state.status === "ready" ? state.players : [];
  const serverName =
    navigationState?.serverName ?? players[0]?.servername ?? "Servidor";
  const serverIp = navigationState?.serverIp ?? players[0]?.serverip ?? null;
  const status = useServerStatus(serverIp ? stripServerPort(serverIp) : "");

  const counts: Record<PlayerFilter, number> = {
    all: players.length,
    found: players.filter((player) => player.found).length,
    "not-hashed": players.filter((player) => player.hashedPassword).length,
  };

  const term = query.trim().toLowerCase();
  const visiblePlayers = players.filter((player) => {
    if (filter === "found" && !player.found) return false;
    if (filter === "not-hashed" && !player.hashedPassword) return false;
    if (term && !player.name.toLowerCase().includes(term)) return false;
    return true;
  });

  const hasPlayers = players.length > 0;
  const hasMatches = visiblePlayers.length > 0;
  const countLabel =
    visiblePlayers.length === players.length
      ? `${players.length} ${players.length === 1 ? "jugador" : "jugadores"}`
      : `${visiblePlayers.length} de ${players.length}`;

  useModalAccessibility(
    selectedPlayer !== null,
    () => setSelectedPlayer(null),
    playerModalOpener,
  );

  function openPlayerModal(player: ServerPlayer, opener: HTMLElement) {
    playerModalOpener.current = opener;
    setSelectedPlayer(player);
  }

  useModalAccessibility(
    serverModalOpen,
    () => setServerModalOpen(false),
    serverModalOpener,
  );

  function openServerModal(opener: HTMLElement) {
    serverModalOpener.current = opener;
    setServerModalOpen(true);
  }

  return (
    <DashboardLayout username={user?.username} section="TUS SERVIDORES">
      <div className="servers-players">
        <Link className="servers-back" to="/tus-servidores">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M9.6 3.4 5 8l4.6 4.6" />
          </svg>
          Volver a tus servidores
        </Link>

        <section
          className="servers-status-panel servers-status-panel--interactive"
          role="button"
          tabIndex={0}
          aria-live="polite"
          aria-haspopup="dialog"
          aria-label={`Ver más información de ${serverName}`}
          onClick={(event) => openServerModal(event.currentTarget)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openServerModal(event.currentTarget);
            }
          }}
        >
          <ServerStatusSummary
            name={serverName}
            ip={serverIp}
            status={status}
          />
          <span className="servers-status-more">
            Ver más información
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6.4 3.4 11 8l-4.6 4.6" />
            </svg>
          </span>
        </section>

        {state.status === "loading" && (
          <section
            className="feature-placeholder servers-feedback"
            aria-live="polite"
          >
            <span className="section-eyebrow">JUGADORES</span>
            <div className="server-status-message" role="status">
              <span className="search-spinner" aria-hidden="true" />
              Cargando los jugadores...
            </div>
          </section>
        )}

        {state.status === "error" && (
          <section className="feature-placeholder servers-feedback" role="alert">
            <span className="section-eyebrow">JUGADORES</span>
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

        {state.status === "not-found" && (
          <div className="empty-results">
            <span className="empty-search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 6.5h16v4H4zm0 7h16v4H4z" />
                <path d="M7 8.5h.01M7 15.5h.01m3-7h5m-5 6h5" />
              </svg>
            </span>
            <h3>No se encontró el servidor</h3>
            <p>El servidor no existe o ya no te pertenece.</p>
          </div>
        )}

        {state.status === "empty" && (
          <div className="empty-results">
            <span className="empty-search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M4.5 19a7.5 7.5 0 0 1 15 0" />
              </svg>
            </span>
            <h3>Sin jugadores guardados</h3>
            <p>
              Cuando el mod reporte jugadores de este servidor aparecerán acá.
            </p>
          </div>
        )}

        {state.status === "ready" && (
          <section className="servers-players-list">
            <div className="results-heading">
              <div>
                <span className="section-eyebrow">JUGADORES DEL SERVIDOR</span>
                <h2>Jugadores guardados</h2>
              </div>
              <div className="servers-heading-actions">
                <span className="result-count">{countLabel}</span>
                {hasPlayers && (
                  <button
                    className={`servers-refresh${
                      isRefreshing ? " is-refreshing" : ""
                    }`}
                    type="button"
                    onClick={reload}
                    disabled={isRefreshing}
                    aria-busy={isRefreshing}
                    aria-label="Actualizar los jugadores del servidor"
                  >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M13 8a5 5 0 1 1-1.5-3.5M13 2v3h-3" />
                    </svg>
                    {isRefreshing ? "Actualizando" : "Actualizar"}
                  </button>
                )}
              </div>
            </div>

            {hasPlayers && (
              <PlayersToolbar
                query={query}
                filter={filter}
                counts={counts}
                onQueryChange={setQuery}
                onFilterChange={setFilter}
              />
            )}

            {hasMatches ? (
              <div key={filter} className="results-grid servers-players-grid">
                {visiblePlayers.map((player, index) => (
                  <ServerPlayerCard
                    key={`${player.name}-${index}`}
                    player={player}
                    index={index}
                    onOpen={openPlayerModal}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-results">
                <span className="empty-search-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M4.5 19a7.5 7.5 0 0 1 15 0" />
                  </svg>
                </span>
                <h3>Sin coincidencias</h3>
                <p>Ajusta la búsqueda o el filtro para ver otros jugadores.</p>
              </div>
            )}
          </section>
        )}
      </div>

      {serverModalOpen && (
        <ServerModal
          name={serverName}
          ip={serverIp}
          status={status}
          players={players}
          onClose={() => setServerModalOpen(false)}
        />
      )}

      {selectedPlayer && (
        <PlayerModal
          key={selectedPlayer.name}
          playerName={selectedPlayer.name}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </DashboardLayout>
  );
}
