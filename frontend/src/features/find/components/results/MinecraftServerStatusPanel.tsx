import type { MinecraftServerStatusLookup, FindRecord } from "../../types";

type MinecraftServerStatusPanelProps = {
  record: FindRecord;
  status: MinecraftServerStatusLookup;
};

export function MinecraftServerStatusPanel({
  record,
  status,
}: MinecraftServerStatusPanelProps) {
  return (
    <section
      className="minecraft-server-status"
      aria-labelledby="minecraft-server-status-title"
      aria-live="polite"
    >
      <div className="server-status-heading">
        <div>
          <span className="section-eyebrow">ESTADO ACTUAL</span>
          <h3 id="minecraft-server-status-title">Servidor de Minecraft</h3>
        </div>
        <span
          className={`server-status-badge server-status-badge--${
            status.status === "loaded"
              ? status.server.online
                ? "online"
                : "offline"
              : status.status
          }`}
        >
          {status.status === "loaded"
            ? status.server.online
              ? "EN LÍNEA"
              : "DESCONECTADO"
            : status.status === "error"
              ? "NO DISPONIBLE"
              : "CONSULTANDO"}
        </span>
      </div>

      {status.status === "loading" && (
        <div className="server-status-message" role="status">
          <span className="search-spinner" aria-hidden="true" />
          Consultando el servidor...
        </div>
      )}

      {status.status === "error" && (
        <p className="server-status-message server-status-message--error" role="alert">
          {status.message}
        </p>
      )}

      {status.status === "loaded" && (
        <>
          <div className="server-status-summary">
            <div className="server-status-icon">
              {status.server.icon ? (
                <img src={status.server.icon} alt="" />
              ) : (
                <span aria-hidden="true">
                  {(record.server ?? "M").slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div className="server-status-identity">
              <strong>{status.server.host}</strong>
              <span>
                {status.server.host}:{status.server.port}
              </span>
            </div>
            {status.server.online && status.server.players && (
              <div className="server-player-count">
                <strong>{status.server.players.online}</strong>
                <span>/ {status.server.players.max} jugadores</span>
              </div>
            )}
          </div>

          {status.server.online && (
            <>
              {status.server.version && (
                <p className="server-version">Versión: {status.server.version}</p>
              )}
              <div className="server-motd">
                <span>MOTD</span>
                <p>{status.server.motd || "El servidor no publicó un MOTD."}</p>
              </div>
            </>
          )}
          {!status.server.online && (
            <p className="server-offline-note">
              El servidor no está disponible en este momento.
            </p>
          )}
        </>
      )}
    </section>
  );
}
