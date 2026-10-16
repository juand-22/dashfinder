import type { ModActivity } from "../types";
import { formatRelativeTime, isServerConnected } from "../utils";

type ServerSummaryProps = {
  activity: ModActivity | null;
  now: number;
  serverIcon: string | null;
  onOpen: (opener: HTMLElement) => void;
};

export function ServerSummary({
  activity,
  now,
  serverIcon,
  onOpen,
}: ServerSummaryProps) {
  const connected = isServerConnected(activity?.lastDateRequest, now);
  const serverip = activity?.serverip.trim() ? activity.serverip.trim() : null;
  const playerCount = activity?.lastPlayers.length ?? 0;

  return (
    <section
      className="minecraft-server-status dashmod-server-summary dashmod-server-summary--interactive"
      aria-labelledby="dashmod-server-title"
      aria-live="polite"
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label="Ver detalles del estado actual del servidor"
      onClick={(event) => onOpen(event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(event.currentTarget);
        }
      }}
    >
      <div className="server-status-heading">
        <div>
          <span className="section-eyebrow">ESTADO ACTUAL</span>
          <h3 id="dashmod-server-title">Servidor del mod</h3>
        </div>
        <span
          className={`server-status-badge server-status-badge--${
            connected ? "online" : "offline"
          }`}
        >
          {connected ? "CONECTADO" : "DESCONECTADO"}
        </span>
      </div>

      <div className="server-status-summary">
        {serverIcon && (
          <div className="server-status-icon" aria-hidden="true">
            <img src={serverIcon} alt="" />
          </div>
        )}
        <div className="server-status-identity">
          <strong>{serverip ?? "Sin servidor reportado"}</strong>
          <span>
            {connected
              ? "El mod está enviando datos"
              : "Sin actividad en los últimos 3 minutos"}
          </span>
        </div>
        <div className="server-player-count">
          <strong>{playerCount}</strong>
          <span>{playerCount === 1 ? "jugador" : "jugadores"}</span>
        </div>
      </div>

      <div className="server-status-details">
        <div className="preview-detail">
          <span>IP del servidor</span>
          <strong>{serverip ?? "—"}</strong>
        </div>
        <div className="preview-detail">
          <span>Última conexión</span>
          <strong>
            {activity ? formatRelativeTime(activity.lastDateRequest, now) : "Sin registro"}
          </strong>
        </div>
      </div>

      {!connected && (
        <p className="server-offline-note">
          {activity
            ? "Han pasado más de 3 minutos desde la última petición del mod."
            : "El mod todavía no ha reportado actividad para tu cuenta."}
        </p>
      )}
    </section>
  );
}
