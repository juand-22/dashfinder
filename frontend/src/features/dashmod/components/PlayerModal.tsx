import { useState } from "react";
import { createPortal } from "react-dom";
import { MinecraftAvatarFallback } from "../../find/components/profile/MinecraftProfileCard";
import { SaveNicknameRow } from "../../mod-nicknames/components/SaveNicknameButton";
import { usePlayerInfo } from "../hooks/usePlayerInfo";
import type { PlayerInfo } from "../types";
import { PlayerRecords } from "./PlayerRecords";

type PlayerModalProps = {
  playerName: string;
  onClose: () => void;
};

const NO_INFOS: PlayerInfo[] = [];

function ExpandIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 8V3.5H8" />
      <path d="M12 3.5h4.5V8" />
      <path d="M16.5 12v4.5H12" />
      <path d="M8 16.5H3.5V12" />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M8 3.5V8H3.5" />
      <path d="M16.5 8H12V3.5" />
      <path d="M12 16.5V12h4.5" />
      <path d="M3.5 12H8v4.5" />
    </svg>
  );
}

export function PlayerModal({ playerName, onClose }: PlayerModalProps) {
  const state = usePlayerInfo(playerName);
  const [isExpanded, setIsExpanded] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const infos = state.status === "loaded" ? state.infos : NO_INFOS;
  const hasInfos = infos.length > 0;
  const subtitle =
    state.status === "loading"
      ? "Buscando registros..."
      : state.status === "error"
        ? state.message
        : !hasInfos
          ? "Sin registros guardados"
          : `${infos.length} ${
              infos.length === 1 ? "registro encontrado" : "registros encontrados"
            }`;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="result-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`result-modal dashmod-modal dashmod-player-modal${
          isExpanded ? " dashmod-player-modal--expanded" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashmod-player-modal-title"
      >
        <header className="result-modal-header">
          <button
            className="result-modal-close dashmod-modal-expand"
            type="button"
            aria-label={
              isExpanded
                ? "Reducir el modal"
                : "Agrandar el modal a pantalla completa"
            }
            aria-pressed={isExpanded}
            onClick={() => setIsExpanded((value) => !value)}
          >
            {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
          </button>
          <button
            className="result-modal-close"
            type="button"
            aria-label="Cerrar información del jugador"
            onClick={onClose}
            autoFocus
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
          <div className="result-modal-player">
            <div className="result-modal-avatar" aria-hidden="true">
              {avatarFailed ? (
                <MinecraftAvatarFallback />
              ) : (
                <img
                  src={`https://mc-heads.net/avatar/${encodeURIComponent(playerName)}/96`}
                  alt=""
                  onError={() => setAvatarFailed(true)}
                />
              )}
            </div>
            <div className="result-modal-player-copy">
              <span className="result-modal-kicker">
                <span className="status-dot" />
                JUGADOR REPORTADO
              </span>
              <h2 id="dashmod-player-modal-title">{playerName}</h2>
              <span className="result-modal-subtitle">{subtitle}</span>
              <SaveNicknameRow nickname={playerName} align="start" />
            </div>
          </div>
        </header>

        <div className="minecraft-profile-modal-details dashmod-player-modal-details">
          {state.status === "loading" && (
            <div className="dashmod-modal-feedback" role="status">
              <span className="dashmod-modal-spinner" aria-hidden="true" />
              Buscando información del jugador...
            </div>
          )}

          {state.status === "error" && (
            <div
              className="dashmod-modal-feedback dashmod-modal-feedback--error"
              role="alert"
            >
              {state.message}
            </div>
          )}

          {state.status === "loaded" && !hasInfos && (
            <div className="dashmod-modal-feedback">
              No hay registros guardados para este jugador.
            </div>
          )}

          {state.status === "loaded" && hasInfos && (
            <PlayerRecords infos={infos} />
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
