import { createPortal } from "react-dom";
import { MinecraftServerStatusPanel } from "../../find/components/results/MinecraftServerStatusPanel";
import type {
  FindRecord,
  MinecraftServerStatusLookup,
} from "../../find/types";
import type { ModActivity } from "../types";
import { formatRelativeTime, isServerConnected } from "../utils";

type ServerModalProps = {
  activity: ModActivity | null;
  serverStatus: MinecraftServerStatusLookup | null;
  now: number;
  onClose: () => void;
};

export function ServerModal({
  activity,
  serverStatus,
  now,
  onClose,
}: ServerModalProps) {
  const connected = isServerConnected(activity?.lastDateRequest, now);
  const serverip = activity?.serverip.trim() ? activity.serverip.trim() : null;
  const playerCount = activity?.lastPlayers.length ?? 0;
  const serverIcon =
    serverStatus?.status === "loaded" ? serverStatus.server.icon : null;
  const serverRecord: FindRecord = {
    name: null,
    ip: null,
    password: null,
    salt: null,
    serverip,
    server: serverip,
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="result-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="result-modal result-modal--minecraft dashmod-modal dashmod-server-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashmod-server-modal-title"
      >
        <header className="result-modal-header">
          <button
            className="result-modal-close"
            type="button"
            aria-label="Cerrar detalles del servidor"
            onClick={onClose}
            autoFocus
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
          <div className="result-modal-player">
            <div className="result-modal-avatar" aria-hidden="true">
              {serverIcon ? (
                <img src={serverIcon} alt="" />
              ) : (
                <span className="dashmod-server-modal-avatar">
                  {serverip ? serverip.slice(0, 1).toUpperCase() : "?"}
                </span>
              )}
            </div>
            <div className="result-modal-player-copy">
              <span className="result-modal-kicker">
                <span className="status-dot" />
                ESTADO ACTUAL
              </span>
              <h2 id="dashmod-server-modal-title">
                {serverip ?? "Sin servidor reportado"}
              </h2>
              <span className="result-modal-subtitle">
                {connected
                  ? "El mod está enviando datos"
                  : "Sin actividad en los últimos 3 minutos"}
              </span>
              <span
                className={`server-status-badge server-status-badge--${
                  connected ? "online" : "offline"
                }`}
              >
                {connected ? "CONECTADO" : "DESCONECTADO"}
              </span>
            </div>
          </div>
        </header>

        <div className="minecraft-profile-modal-details">
          <div className="preview-detail">
            <span>Estado del mod</span>
            <strong>{connected ? "Conectado" : "Desconectado"}</strong>
          </div>
          <div className="preview-detail">
            <span>IP del servidor</span>
            <strong>{serverip ?? "—"}</strong>
          </div>
          <div className="preview-detail">
            <span>Última conexión</span>
            <strong>
              {activity
                ? formatRelativeTime(activity.lastDateRequest, now)
                : "Sin registro"}
            </strong>
          </div>
          <div className="preview-detail">
            <span>Jugadores reportados</span>
            <strong>
              {playerCount} {playerCount === 1 ? "jugador" : "jugadores"}
            </strong>
          </div>
          {!connected && (
            <p className="preview-disclaimer">
              {activity
                ? "Han pasado más de 3 minutos desde la última petición del mod."
                : "El mod todavía no ha reportado actividad para tu cuenta."}
            </p>
          )}

          {serverip && serverStatus && (
            <MinecraftServerStatusPanel
              record={serverRecord}
              status={serverStatus}
            />
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
