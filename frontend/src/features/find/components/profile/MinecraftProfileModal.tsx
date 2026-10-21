import { createPortal } from "react-dom";
import { SaveNicknameRow } from "../../../mod-nicknames/components/SaveNicknameButton";
import type { MinecraftProfileLookup } from "../../types";
import { formatMinecraftUuid } from "../../utils";
import { MinecraftAvatarFallback } from "./MinecraftProfileCard";

type MinecraftProfileModalProps = {
  lookup: MinecraftProfileLookup;
  username: string;
  avatarFailed: boolean;
  onAvatarError: () => void;
  onClose: () => void;
};

export function MinecraftProfileModal({
  lookup,
  username,
  avatarFailed,
  onAvatarError,
  onClose,
}: MinecraftProfileModalProps) {
  if (typeof document === "undefined") return null;
  const profile = lookup.status === "found" ? lookup.profile : null;
  const subtitle = lookup.status === "found"
    ? "Perfil oficial de Minecraft encontrado"
    : lookup.status === "not-found"
      ? "No se encontró un perfil Java"
      : lookup.status === "loading"
        ? "Consultando perfil oficial..."
        : lookup.status === "error"
          ? lookup.message
          : "Vista previa del perfil Java";

  return createPortal(
    <div
      className="result-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="result-modal result-modal--minecraft"
        role="dialog"
        aria-modal="true"
        aria-labelledby="minecraft-profile-modal-title"
      >
        <header className="result-modal-header">
          <button
            className="result-modal-close"
            type="button"
            aria-label="Cerrar perfil de Minecraft"
            onClick={onClose}
            autoFocus
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
          <div className="result-modal-player">
            <div className="result-modal-avatar" aria-hidden="true">
              {profile && !avatarFailed ? (
                <img
                  src={`https://mc-heads.net/avatar/${profile.id}/96`}
                  alt=""
                  onError={onAvatarError}
                />
              ) : (
                <MinecraftAvatarFallback />
              )}
            </div>
            <div className="result-modal-player-copy">
              <span className="result-modal-kicker">
                <span className="status-dot" />
                PERFIL DE MINECRAFT
              </span>
              <h2 id="minecraft-profile-modal-title">
                {profile?.name ?? (username || "Perfil de Minecraft")}
              </h2>
              <span className="result-modal-subtitle">{subtitle}</span>
              <SaveNicknameRow
                nickname={profile?.name ?? username}
                align="start"
              />
            </div>
          </div>
        </header>
        <div className="minecraft-profile-modal-details">
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
          {lookup.status === "not-found" && (
            <p className="preview-disclaimer">
              Puede ser una cuenta Bedrock o un nombre que no existe.
            </p>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
