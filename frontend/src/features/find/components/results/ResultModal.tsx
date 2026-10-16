import { createPortal } from "react-dom";
import type {
  FindRecord,
  IpCountry,
  MinecraftProfile,
  MinecraftServerStatusLookup,
} from "../../types";
import { MinecraftAvatarFallback } from "../profile/MinecraftProfileCard";
import { ResultCard } from "./ResultCard";
import { MinecraftServerStatusPanel } from "./MinecraftServerStatusPanel";

type ResultModalProps = {
  record: FindRecord;
  index: number;
  minecraftProfile: MinecraftProfile | null;
  avatarFailed: boolean;
  serverAddress: string;
  serverStatus: MinecraftServerStatusLookup | null;
  copiedTarget: string | null;
  ipCountry: IpCountry | null;
  hashNotice: number | null;
  isPasswordVisible: boolean;
  onAvatarError: () => void;
  onClose: () => void;
  onCopy: (value: string, target: string) => void;
  onTogglePassword: (index: number) => void;
  onToggleHashNotice: (index: number) => void;
};

export function ResultModal({
  record,
  index,
  minecraftProfile,
  avatarFailed,
  serverAddress,
  serverStatus,
  copiedTarget,
  ipCountry,
  hashNotice,
  isPasswordVisible,
  onAvatarError,
  onClose,
  onCopy,
  onTogglePassword,
  onToggleHashNotice,
}: ResultModalProps) {
  if (typeof document === "undefined") return null;
  const title = record.name ?? record.server ?? "Resultado";
  const avatarId =
    minecraftProfile &&
    record.name &&
    minecraftProfile.name.toLowerCase() === record.name.toLowerCase()
      ? minecraftProfile.id
      : record.name;

  return createPortal(
    <div
      className="result-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="result-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-modal-title"
      >
        <header className="result-modal-header">
          <button
            className="result-modal-close"
            type="button"
            aria-label="Cerrar detalles"
            onClick={onClose}
            autoFocus
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
          <div className="result-modal-player">
            <div className="result-modal-avatar" aria-hidden="true">
              {record.name && !avatarFailed && avatarId ? (
                <img
                  src={`https://mc-heads.net/avatar/${encodeURIComponent(avatarId)}/96`}
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
              <h2 id="result-modal-title">{title}</h2>
              <span className="result-modal-subtitle">Detalles del registro</span>
            </div>
          </div>
        </header>
        <div
          className={`result-modal-content${
            serverAddress ? " result-modal-content--with-server" : ""
          }`}
        >
          <ResultCard
            record={record}
            index={index}
            copiedTarget={copiedTarget}
            ipCountry={ipCountry}
            hashNotice={hashNotice}
            isPasswordVisible={isPasswordVisible}
            isModal
            onCopy={onCopy}
            onTogglePassword={onTogglePassword}
            onToggleHashNotice={onToggleHashNotice}
          />
          {serverAddress && serverStatus && (
            <MinecraftServerStatusPanel record={record} status={serverStatus} />
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
