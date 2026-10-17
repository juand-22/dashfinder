import { useState } from "react";
import type { MinecraftServerStatusLookup } from "../../find/types";
import { getServerStatusBadge } from "../utils/server-status";

const numberFormat = new Intl.NumberFormat("es-AR");

type ServerStatusSummaryProps = {
  name: string;
  ip: string | null;
  status: MinecraftServerStatusLookup | null;
};

/**
 * Bloque de estado del servidor: imagen, nombre/dirección, badge de estado y
 * jugadores conectados. Se usa tanto en la card del listado como en la
 * subpágina de jugadores.
 */
export function ServerStatusSummary({
  name,
  ip,
  status,
}: ServerStatusSummaryProps) {
  const [iconFailed, setIconFailed] = useState(false);

  const loaded = status?.status === "loaded" ? status.server : null;
  const players = loaded?.online ? loaded.players : null;
  const icon = loaded?.icon ?? null;
  const showIcon = Boolean(icon) && !iconFailed;
  const badge = getServerStatusBadge(status);

  return (
    <>
      <div className="result-card-header">
        <div className="server-avatar servers-avatar" aria-hidden="true">
          {showIcon ? (
            <img
              src={icon ?? undefined}
              alt=""
              loading="lazy"
              onError={() => setIconFailed(true)}
            />
          ) : (
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M3 3.5h14v5H3zm0 8h14v5H3z" />
              <path d="M6 6h.01M6 14h.01m3-8h5m-5 8h5" />
            </svg>
          )}
        </div>
        <div className="server-details">
          <div className="server-name-row">
            <h3>{name}</h3>
          </div>
          {ip && <span>{ip}</span>}
        </div>
        <span
          className={`server-status-badge server-status-badge--${badge.variant} servers-status-badge`}
        >
          {badge.label}
        </span>
      </div>

      {players && (
        <div className="servers-live">
          <span>Jugadores conectados</span>
          <strong>
            {numberFormat.format(players.online)}
            <em> / {numberFormat.format(players.max)}</em>
          </strong>
        </div>
      )}
    </>
  );
}
