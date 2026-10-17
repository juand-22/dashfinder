import { createPortal } from "react-dom";
import { MinecraftServerStatusPanel } from "../../find/components/results/MinecraftServerStatusPanel";
import type {
  FindRecord,
  MinecraftServerStatusLookup,
} from "../../find/types";
import { getServerStatusBadge } from "../utils/server-status";
import type { ServerPlayer } from "../types";

const numberFormat = new Intl.NumberFormat("es-AR");

type ServerModalProps = {
  name: string;
  ip: string | null;
  status: MinecraftServerStatusLookup | null;
  players: ServerPlayer[];
  onClose: () => void;
};

/**
 * Detalle ampliado del servidor abierto desde la card de estado de la
 * subpágina: estado en vivo (host, versión, MOTD y jugadores conectados vía
 * `/api/find/minecraft-server-status`) más los jugadores guardados del mod.
 */
export function ServerModal({
  name,
  ip,
  status,
  players,
  onClose,
}: ServerModalProps) {
  const loaded = status?.status === "loaded" ? status.server : null;
  const badge = getServerStatusBadge(status);
  const onlinePlayers = loaded?.online ? loaded.players : null;
  const icon = loaded?.icon ?? null;

  const found = players.filter((player) => player.found).length;
  const notFound = players.length - found;

  const stateLabel =
    status?.status === "loading"
      ? "Consultando..."
      : status?.status === "error"
        ? "No disponible"
        : loaded
          ? loaded.online
            ? "En línea"
            : "Desconectado"
          : "Sin datos";

  const serverRecord: FindRecord = {
    name: null,
    ip: null,
    password: null,
    salt: null,
    serverip: ip,
    server: ip,
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
        className="result-modal result-modal--minecraft servers-modal servers-server-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="servers-server-modal-title"
      >
        <header className="result-modal-header">
          <button
            className="result-modal-close"
            type="button"
            aria-label="Cerrar información del servidor"
            onClick={onClose}
            autoFocus
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
          <div className="result-modal-player">
            <div className="result-modal-avatar" aria-hidden="true">
              {icon ? (
                <img src={icon} alt="" />
              ) : (
                <span className="servers-modal-avatar-letter">
                  {name.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div className="result-modal-player-copy">
              <span className="result-modal-kicker">
                <span className="status-dot" />
                INFORMACIÓN DEL SERVIDOR
              </span>
              <h2 id="servers-server-modal-title">{name}</h2>
              <span className="result-modal-subtitle">
                {ip ?? "Dirección desconocida"}
              </span>
              <span
                className={`server-status-badge server-status-badge--${badge.variant}`}
              >
                {badge.label}
              </span>
            </div>
          </div>
        </header>

        <div className="minecraft-profile-modal-details servers-modal-details">
          <div className="preview-detail">
            <span>Estado</span>
            <strong>{stateLabel}</strong>
          </div>
          <div className="preview-detail">
            <span>IP del servidor</span>
            <strong>{ip ?? "—"}</strong>
          </div>
          {onlinePlayers && (
            <div className="preview-detail">
              <span>Jugadores conectados</span>
              <strong>
                {numberFormat.format(onlinePlayers.online)} /{" "}
                {numberFormat.format(onlinePlayers.max)}
              </strong>
            </div>
          )}
          <div className="preview-detail">
            <span>Jugadores guardados</span>
            <strong>{numberFormat.format(players.length)}</strong>
          </div>
          <div className="preview-detail">
            <span>Encontrados</span>
            <strong>{numberFormat.format(found)}</strong>
          </div>
          <div className="preview-detail">
            <span>Sin encontrar</span>
            <strong>{numberFormat.format(notFound)}</strong>
          </div>

          {status && ip && (
            <MinecraftServerStatusPanel
              record={serverRecord}
              status={status}
            />
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
