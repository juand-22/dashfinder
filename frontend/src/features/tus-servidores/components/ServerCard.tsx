import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useServerStatus } from "../../find/hooks/useServerStatus";
import { stripServerPort } from "../../../utils/server-address";
import { ServerStatusSummary } from "./ServerStatusSummary";
import type { ModServer } from "../types";

const numberFormat = new Intl.NumberFormat("es-AR");

type ServerCardProps = {
  server: ModServer;
  index: number;
};

export function ServerCard({ server, index }: ServerCardProps) {
  const status = useServerStatus(stripServerPort(server.ip));
  const style = {
    animationDelay: `${Math.min(index, 12) * 45}ms`,
  } as CSSProperties;

  return (
    <Link
      className="result-card servers-card result-card--interactive"
      style={style}
      to={`/tus-servidores/${server.id}`}
      state={{ serverName: server.name, serverIp: server.ip }}
      aria-label={`Ver los jugadores de ${server.name}`}
    >
      <ServerStatusSummary
        name={server.name}
        ip={server.ip}
        status={status}
      />

      <div className="servers-card-stats">
        <div className="servers-stat">
          <strong>{numberFormat.format(server.players_total)}</strong>
          <span>{server.players_total === 1 ? "Jugador" : "Jugadores"}</span>
        </div>
        <div className="servers-stat is-found">
          <strong>{numberFormat.format(server.player_founds)}</strong>
          <span>Encontrados</span>
        </div>
        <div className="servers-stat is-not-hashed">
          <strong>{numberFormat.format(server.players_not_hashed)}</strong>
          <span>Sin hashear</span>
        </div>
      </div>
    </Link>
  );
}
