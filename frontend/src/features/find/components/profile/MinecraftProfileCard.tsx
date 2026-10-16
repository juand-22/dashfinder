import type { KeyboardEvent, MouseEvent, RefObject } from "react";
import type { MinecraftProfileLookup } from "../../types";
import { formatMinecraftUuid } from "../../utils";

type MinecraftProfileCardProps = {
  lookup: MinecraftProfileLookup;
  username: string;
  failedAvatarId: string | null;
  openerRef: RefObject<HTMLElement | null>;
  onAvatarError: (id: string) => void;
  onOpen: () => void;
};

function getProfileStatusLabel(status: MinecraftProfileLookup["status"]) {
  switch (status) {
    case "found": return "PREMIUM";
    case "not-found": return "NO PREMIUM";
    case "loading": return "BUSCANDO";
    case "invalid": return "NOMBRE INVÁLIDO";
    case "error": return "NO DISPONIBLE";
    default: return "LISTO";
  }
}

export function MinecraftProfileCard({
  lookup,
  username,
  failedAvatarId,
  openerRef,
  onAvatarError,
  onOpen,
}: MinecraftProfileCardProps) {
  const profile = lookup.status === "found" ? lookup.profile : null;
  const title = profile?.name ?? (username || "Tu jugador");
  const description = lookup.status === "found"
    ? "Perfil oficial de Minecraft encontrado"
    : lookup.status === "not-found"
      ? "No se encontró un perfil Java con este nombre"
      : lookup.status === "loading"
        ? "Consultando perfil oficial..."
        : lookup.status === "invalid"
          ? "Usa entre 3 y 16 letras, números o _"
          : lookup.status === "error"
            ? lookup.message
            : "Escribe un nombre para ver su perfil";

  function openFromClick(event: MouseEvent<HTMLElement>) {
    openerRef.current = event.currentTarget;
    onOpen();
  }

  function openFromKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openerRef.current = event.currentTarget;
    onOpen();
  }

  return (
    <article
      className={`minecraft-preview minecraft-preview--${lookup.status}`}
      aria-label={`Abrir vista detallada del perfil de Minecraft${profile ? ` de ${profile.name}` : ""}`}
      aria-haspopup="dialog"
      aria-live="polite"
      role="button"
      tabIndex={0}
      onClick={openFromClick}
      onKeyDown={openFromKeyboard}
    >
      <div className="preview-topline">
        <span className="preview-kicker">PERFIL DE MINECRAFT</span>
        <span className={`profile-badge profile-badge--${lookup.status}`}>
          {getProfileStatusLabel(lookup.status)}
        </span>
      </div>

      <div className="preview-player">
        <div className="minecraft-avatar">
          {(!profile || failedAvatarId === profile.id) && <MinecraftAvatarFallback />}
          {profile && failedAvatarId !== profile.id && (
            <img
              src={`https://mc-heads.net/avatar/${profile.id}/96`}
              alt={`Cabeza de Minecraft de ${profile.name}`}
              onError={() => onAvatarError(profile.id)}
            />
          )}
        </div>
        <div className="preview-player-details">
          <span>JUGADOR JAVA</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="preview-details">
        <div className="preview-detail">
          <span>Cuenta</span>
          <strong className={profile ? "premium-value" : ""}>
            {profile
              ? "Premium Java"
              : lookup.status === "not-found"
                ? "Sin perfil Java"
                : lookup.status === "loading"
                  ? "Verificando..."
                  : "Sin verificar"}
          </strong>
        </div>
        <div className="preview-detail">
          <span>UUID</span>
          <strong className="preview-uuid">
            {profile ? formatMinecraftUuid(profile.id) : "—"}
          </strong>
        </div>
      </div>

      {lookup.status === "not-found" && (
        <p className="preview-disclaimer">
          Puede ser una cuenta Bedrock o un nombre que no existe.
        </p>
      )}
    </article>
  );
}

export function MinecraftAvatarFallback() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M15 11h34v34H15z" fill="#7b5132" />
      <path d="M15 11h34v8H15zM19 19h8v8h-8zm18 0h8v8h-8z" fill="#b7814d" />
      <path d="M23 30h7v5h-7zm11 0h7v5h-7z" fill="#33231d" />
      <path d="M27 39h11v4H27z" fill="#e4c18b" />
      <path d="M15 45h34v8H15z" fill="#463024" />
    </svg>
  );
}
