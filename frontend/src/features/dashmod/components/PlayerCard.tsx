import {
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import type { ModPlayer } from "../types";
import { SaveNicknameRow } from "../../mod-nicknames/components/SaveNicknameButton";

type PlayerCardProps = {
  player: ModPlayer;
  index: number;
  onOpen: (player: ModPlayer, opener: HTMLElement) => void;
};

export function PlayerCard({ player, index, onOpen }: PlayerCardProps) {
  const [headFailed, setHeadFailed] = useState(false);
  const initial = player.name.slice(0, 1).toUpperCase() || "?";
  const rank = player.rank?.trim() ? player.rank.trim() : "Sin rango";
  const headUrl = `https://mc-heads.net/avatar/${encodeURIComponent(player.name)}/64`;
  const style = {
    animationDelay: `${Math.min(index, 12) * 45}ms`,
  } as CSSProperties;

  function handleClick(event: MouseEvent<HTMLElement>) {
    if (event.target instanceof Element && event.target.closest("button")) return;
    onOpen(player, event.currentTarget);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(player, event.currentTarget);
    }
  }

  return (
    <article
      className="result-card dashmod-player-card result-card--interactive"
      style={style}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-label={`Ver información de ${player.name}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="result-card-header">
        <div className="server-avatar" aria-hidden="true">
          {headFailed ? (
            <span>{initial}</span>
          ) : (
            <img
              src={headUrl}
              alt=""
              loading="lazy"
              onError={() => setHeadFailed(true)}
            />
          )}
        </div>
        <div className="server-details">
          <div className="server-name-row">
            <h3>{player.name}</h3>
          </div>
          <span>{rank}</span>
          <span className="dashmod-player-records">
            <strong>{player.records_founds}</strong>{" "}
            {player.records_founds === 1 ? "registro" : "registros"}
          </span>
        </div>
        <span
          className={`result-tag ${player.found ? "is-plain" : "is-unknown"}`}
        >
          {player.found ? "Encontrado" : "No encontrado"}
        </span>
      </div>
      <SaveNicknameRow nickname={player.name} />
    </article>
  );
}
