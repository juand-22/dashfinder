import { useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import { CopyButton } from "../../find/components/common/CopyButton";
import { MinecraftAvatarFallback } from "../../find/components/profile/MinecraftProfileCard";
import type { MinecraftProfile } from "../../find/types";
import type { ModNickname } from "../types";
import { formatSavedDate } from "../utils";

type ModNicknameCardProps = {
  nickname: ModNickname;
  index: number;
  /** Perfil oficial del nick, para sacarle la cabeza. `null` = sin perfil. */
  profile: MinecraftProfile | null;
  copied: boolean;
  isRemoving: boolean;
  removeError: string | null;
  onCopy: (nickname: ModNickname) => void;
  onRemove: (nickname: ModNickname) => void;
  /** Abre el modal con los servidores donde está guardado el nick. */
  onOpen: (nickname: ModNickname, opener: HTMLElement) => void;
};

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.8 4.3h10.4M6.3 4.3V2.7h3.4v1.6" />
      <path d="M4.3 4.3l.7 8.1a1 1 0 0 0 1 .9h4a1 1 0 0 0 1-.9l.7-8.1" />
      <path d="M6.8 7.1v3.5M9.2 7.1v3.5" />
    </svg>
  );
}

export function ModNicknameCard({
  nickname,
  index,
  profile,
  copied,
  isRemoving,
  removeError,
  onCopy,
  onRemove,
  onOpen,
}: ModNicknameCardProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const savedAt = formatSavedDate(nickname.createdAt);
  const style = {
    animationDelay: `${Math.min(index, 12) * 45}ms`,
  } as CSSProperties;
  // El nombre oficial viene con las mayúsculas del perfil: si cambia respecto
  // del guardado se muestra, porque el nick es lo que se escribe en el juego.
  const officialName =
    profile && profile.name.toLowerCase() !== nickname.nickname.toLowerCase()
      ? profile.name
      : null;

  function handleClick(event: MouseEvent<HTMLElement>) {
    // Los botones de la tarjeta (copiar, eliminar) y la confirmación de borrado
    // hacen lo suyo: el modal se abre solo si se hizo clic en el resto.
    if (
      event.target instanceof Element &&
      event.target.closest("button, a, .modnick-card-actions")
    ) {
      return;
    }

    onOpen(nickname, event.currentTarget);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(nickname, event.currentTarget);
    }
  }

  return (
    <article
      className="result-card modnick-card result-card--interactive"
      style={style}
      role="group"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`Ver en qué servidores está guardado ${nickname.nickname}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="result-card-header">
        <span className="server-avatar" aria-hidden="true">
          {profile !== null && !avatarFailed ? (
            <img
              src={`https://mc-heads.net/avatar/${profile.id}/64`}
              alt=""
              loading="lazy"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <MinecraftAvatarFallback />
          )}
        </span>
        <div className="server-details">
          <div className="server-name-row">
            <h3>{nickname.nickname}</h3>
            <CopyButton
              label="nick"
              copied={copied}
              onClick={() => onCopy(nickname)}
            />
          </div>
          <span>
            {officialName
              ? `Perfil premium: ${officialName}`
              : profile
                ? "Perfil premium"
                : "Sin perfil premium"}
          </span>
        </div>
      </div>

      <div className="modnick-card-footer">
        {savedAt && (
          <span className="modnick-card-date">Guardado el {savedAt}</span>
        )}

        {isConfirming ? (
          <div className="modnick-card-actions">
            <span className="modnick-confirm-text">¿Eliminar?</span>
            <button
              className="modnick-action is-danger"
              type="button"
              disabled={isRemoving}
              onClick={() => onRemove(nickname)}
            >
              {isRemoving ? "Eliminando..." : "Sí, eliminar"}
            </button>
            <button
              className="modnick-action"
              type="button"
              disabled={isRemoving}
              onClick={() => setIsConfirming(false)}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            className="modnick-action is-danger"
            type="button"
            onClick={() => setIsConfirming(true)}
          >
            <TrashIcon />
            Eliminar
          </button>
        )}
      </div>

      {removeError && (
        <p className="modnick-card-error" role="alert">
          {removeError}
        </p>
      )}
    </article>
  );
}
