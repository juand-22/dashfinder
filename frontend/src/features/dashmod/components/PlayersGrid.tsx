import { useMemo, useState } from "react";
import type { ModPlayer, PlayerFilter } from "../types";
import { PlayerCard } from "./PlayerCard";
import { PlayersToolbar } from "./PlayersToolbar";

type PlayersGridProps = {
  players: ModPlayer[];
  onOpenPlayer: (player: ModPlayer, opener: HTMLElement) => void;
};

export function PlayersGrid({ players, onOpenPlayer }: PlayersGridProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PlayerFilter>("all");

  const counts = useMemo<Record<PlayerFilter, number>>(() => {
    const found = players.filter((player) => player.found).length;
    return { all: players.length, found, "not-found": players.length - found };
  }, [players]);

  const filteredPlayers = useMemo(() => {
    const term = query.trim().toLowerCase();

    return players.filter((player) => {
      if (filter === "found" && !player.found) return false;
      if (filter === "not-found" && player.found) return false;
      if (term && !player.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [players, query, filter]);

  const hasPlayers = players.length > 0;
  const hasMatches = filteredPlayers.length > 0;
  const countLabel =
    filteredPlayers.length === players.length
      ? `${players.length} ${players.length === 1 ? "jugador" : "jugadores"}`
      : `${filteredPlayers.length} de ${players.length}`;

  return (
    <section className="results-section dashmod-players" aria-live="polite">
      <div className="results-heading">
        <div>
          <span className="section-eyebrow">ÚLTIMOS JUGADORES</span>
          <h2>Jugadores reportados</h2>
        </div>
        <span className="result-count">{countLabel}</span>
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
        <div key={filter} className="results-grid dashmod-players-grid">
          {filteredPlayers.map((player, index) => (
            <PlayerCard
              key={`${player.name}-${index}`}
              player={player}
              index={index}
              onOpen={onOpenPlayer}
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
          <h3>{hasPlayers ? "Sin coincidencias" : "Sin jugadores reportados"}</h3>
          <p>
            {hasPlayers
              ? "Ajusta la búsqueda o el filtro para ver otros jugadores."
              : "Cuando el mod detecte jugadores en tu servidor aparecerán aquí."}
          </p>
        </div>
      )}
    </section>
  );
}
