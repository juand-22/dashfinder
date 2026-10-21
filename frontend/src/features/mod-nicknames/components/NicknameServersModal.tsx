import { useState } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { DehashAttemptCard } from "../../dehashes/components/DehashAttemptCard";
import { useDehashSender } from "../../dehashes/hooks/useDehashSender";
import type { DehashAttempt } from "../../dehashes/types";
import { PlayerRecords } from "../../dashmod/components/PlayerRecords";
import { usePlayerInfo } from "../../dashmod/hooks/usePlayerInfo";
import { MinecraftAvatarFallback } from "../../find/components/profile/MinecraftProfileCard";
import type { MinecraftProfile } from "../../find/types";
import { useNicknameDehashes } from "../hooks/useNicknameDehashes";
import { useNicknameServers } from "../hooks/useNicknameServers";
import type { ModNickname } from "../types";
import { formatSavedDate } from "../utils";

type NicknameServersModalProps = {
  nickname: ModNickname;
  /** Perfil oficial del nick, para la cabeza. `null` = sin perfil. */
  profile: MinecraftProfile | null;
  onClose: () => void;
};

/** De dónde salen los registros que se están mirando. */
type RecordsSource = "mcdbs" | "dehashes";

/**
 * Los servidores guardados en los que aparece el nick (con rank y cantidad de
 * registros) y sus registros: los de mcdbs y los dehashes.
 */
export function NicknameServersModal({
  nickname,
  profile,
  onClose,
}: NicknameServersModalProps) {
  const { state: serversState, reload } = useNicknameServers(nickname.nickname);
  const recordsState = usePlayerInfo(nickname.nickname);
  const { state: dehashesState, reload: reloadDehashes } =
    useNicknameDehashes(nickname.nickname);
  const [source, setSource] = useState<RecordsSource>("mcdbs");
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<number | null>(null);
  const { feedback: dehashFeedback, send: sendDehash } = useDehashSender();
  // MySQL puede comparar sin distinguir mayúsculas: nos quedamos solo con los
  // registros cuyo nombre coincide exactamente con el nick guardado.
  const records =
    recordsState.status === "loaded"
      ? recordsState.infos.filter((info) => info.name === nickname.nickname)
      : [];
  const dehashes =
    dehashesState.status === "loaded" ? dehashesState.attempts : [];
  const savedAt = formatSavedDate(nickname.createdAt);
  const serversSubtitle =
    serversState.status === "loading"
      ? "Buscando en tus servidores..."
      : serversState.status === "error"
        ? "No se pudo buscar en tus servidores"
        : serversState.servers.length === 0
          ? "No está guardado en ningún servidor"
          : `${serversState.servers.length} ${
              serversState.servers.length === 1 ? "servidor" : "servidores"
            }`;
  const sourceCountLabel =
    source === "mcdbs"
      ? recordsState.status === "loaded"
        ? `${records.length} ${
            records.length === 1 ? "registro" : "registros"
          }`
        : null
      : dehashesState.status === "loaded"
        ? `${dehashes.length} ${
            dehashes.length === 1 ? "dehash" : "dehashes"
          }`
        : null;
  const subtitle = sourceCountLabel
    ? `${serversSubtitle} · ${sourceCountLabel}`
    : serversSubtitle;

  async function copyValue(value: string, target: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyError(null);
      setCopiedTarget(target);
    } catch {
      setCopyError(
        "No se pudo copiar al portapapeles. Comprueba los permisos del navegador.",
      );
    }
  }

  function retryAttempt(attempt: DehashAttempt) {
    setRetryingId(attempt.id);
    // Reintentar es volver a mandar el mismo hash: no hay ruta aparte.
    sendDehash(
      { name: attempt.name, password: attempt.hash, salt: null },
      String(attempt.id),
    );
    window.setTimeout(() => {
      setRetryingId(null);
      reloadDehashes();
    }, 800);
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="result-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="result-modal modnick-servers-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modnick-servers-modal-title"
      >
        <header className="result-modal-header">
          <button
            className="result-modal-close"
            type="button"
            aria-label="Cerrar servidores del nick"
            onClick={onClose}
            autoFocus
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
          <div className="result-modal-player">
            <div className="result-modal-avatar" aria-hidden="true">
              {profile ? (
                <img
                  src={`https://mc-heads.net/avatar/${profile.id}/96`}
                  alt=""
                />
              ) : (
                <MinecraftAvatarFallback />
              )}
            </div>
            <div className="result-modal-player-copy">
              <span className="result-modal-kicker">
                <span className="status-dot" />
                NICK GUARDADO
              </span>
              <h2 id="modnick-servers-modal-title">{nickname.nickname}</h2>
              <span className="result-modal-subtitle">{subtitle}</span>
              {savedAt && (
                <span className="modnick-servers-saved">
                  Guardado el {savedAt}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="modnick-servers-content">
          <section className="modnick-modal-section">
            <h3 className="modnick-section-title">
              Servidores guardados
              {serversState.status === "ready" && (
                <span>{serversState.servers.length}</span>
              )}
            </h3>

            {serversState.status === "loading" && (
              <p className="modnick-servers-feedback" role="status">
                <span className="search-spinner" aria-hidden="true" />
                Buscando el nick en tus servidores guardados.
              </p>
            )}

            {serversState.status === "error" && (
              <div className="modnick-servers-feedback is-error" role="alert">
                <span>{serversState.message}</span>
                <button
                  className="modnick-action"
                  type="button"
                  onClick={reload}
                >
                  Reintentar
                </button>
              </div>
            )}

            {serversState.status === "ready" &&
              serversState.servers.length === 0 && (
                <div className="modnick-servers-empty">
                  <h4>Todavía no está en ningún servidor</h4>
                  <p>
                    Cuando el mod vea este nick en uno de tus servidores, va a
                    aparecer acá con su rango.
                  </p>
                </div>
              )}

            {serversState.status === "ready" &&
              serversState.servers.length > 0 && (
                <ul className="modnick-servers-list">
                  {serversState.servers.map((server) => (
                    <li className="modnick-server" key={server.serverId}>
                      <span
                        className="modnick-server-badge"
                        aria-hidden="true"
                      >
                        {server.servername.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="modnick-server-copy">
                        <strong>{server.servername}</strong>
                        <span>
                          {server.serverip}:{server.serverport}
                        </span>
                      </div>
                      <div className="modnick-server-facts">
                        <span className="modnick-server-fact">
                          <small>Rango</small>
                          {server.rank?.trim() || "Sin rango"}
                        </span>
                        <span className="modnick-server-fact">
                          <small>Registros</small>
                          {server.records_founds}
                        </span>
                      </div>
                      {server.found && (
                        <span className="modnick-server-found">Encontrado</span>
                      )}
                      <Link
                        className="modnick-server-link"
                        to={`/tus-servidores/${server.serverId}`}
                        state={{
                          serverName: server.servername,
                          serverIp: server.serverip,
                        }}
                      >
                        Ver servidor
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
          </section>

          <section className="modnick-modal-section">
            <h3 className="modnick-section-title">Registros</h3>

            <div
              className={`modnick-tabs${
                source === "dehashes" ? " is-dehashes" : ""
              }`}
              role="group"
              aria-label="Origen de los registros"
            >
              <span className="modnick-tabs-indicator" aria-hidden="true" />
              <button
                className={`modnick-tab${
                  source === "mcdbs" ? " is-active" : ""
                }`}
                type="button"
                aria-pressed={source === "mcdbs"}
                onClick={() => setSource("mcdbs")}
              >
                mcdbs
                {recordsState.status === "loaded" && (
                  <span>{records.length}</span>
                )}
              </button>
              <button
                className={`modnick-tab${
                  source === "dehashes" ? " is-active" : ""
                }`}
                type="button"
                aria-pressed={source === "dehashes"}
                onClick={() => setSource("dehashes")}
              >
                Dehasheados
                {dehashesState.status === "loaded" && (
                  <span>{dehashes.length}</span>
                )}
              </button>
            </div>

            <div className={`modnick-records-panel is-${source}`} key={source}>
              {source === "mcdbs" ? (
                <>
                  {recordsState.status === "loading" && (
                    <p className="modnick-servers-feedback" role="status">
                      <span className="search-spinner" aria-hidden="true" />
                      Buscando los registros de mcdbs.
                    </p>
                  )}

                  {recordsState.status === "error" && (
                    <div
                      className="modnick-servers-feedback is-error"
                      role="alert"
                    >
                      {recordsState.message}
                    </div>
                  )}

                  {recordsState.status === "loaded" &&
                    records.length === 0 && (
                      <div className="modnick-servers-empty">
                        <h4>Sin registros en mcdbs</h4>
                        <p>Este nick no aparece en la base de mcdbs.</p>
                      </div>
                    )}

                  {recordsState.status === "loaded" && records.length > 0 && (
                    <div className="modnick-records">
                      <PlayerRecords infos={records} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {dehashesState.status === "loading" && (
                    <p className="modnick-servers-feedback" role="status">
                      <span className="search-spinner" aria-hidden="true" />
                      Buscando los dehashes del nick.
                    </p>
                  )}

                  {dehashesState.status === "error" && (
                    <div
                      className="modnick-servers-feedback is-error"
                      role="alert"
                    >
                      <span>{dehashesState.message}</span>
                      <button
                        className="modnick-action"
                        type="button"
                        onClick={reloadDehashes}
                      >
                        Reintentar
                      </button>
                    </div>
                  )}

                  {dehashesState.status === "loaded" &&
                    dehashes.length === 0 && (
                      <div className="modnick-servers-empty">
                        <h4>Sin dehashes</h4>
                        <p>
                          Todavía no mandaste ningún hash de este nick a
                          dehashear.
                        </p>
                      </div>
                    )}

                  {dehashesState.status === "loaded" && dehashes.length > 0 && (
                    <div className="modnick-dehashes">
                      {dehashes.map((attempt, index) => (
                        <DehashAttemptCard
                          key={attempt.id}
                          attempt={attempt}
                          index={index}
                          copiedTarget={copiedTarget}
                          feedback={
                            dehashFeedback?.key === String(attempt.id)
                              ? dehashFeedback
                              : null
                          }
                          profile={profile}
                          isRetrying={retryingId === attempt.id}
                          onCopy={(value, target) => {
                            void copyValue(value, target);
                          }}
                          onRetry={retryAttempt}
                        />
                      ))}
                    </div>
                  )}

                  {copyError && (
                    <div
                      className="modnick-servers-feedback is-error"
                      role="alert"
                    >
                      {copyError}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>,
    document.body,
  );
}
