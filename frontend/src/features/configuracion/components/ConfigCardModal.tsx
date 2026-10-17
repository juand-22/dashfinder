import { useState } from "react";
import { createPortal } from "react-dom";
import { CopyButton } from "../../find/components/common/CopyButton";
import { useClipboardCopy } from "../hooks/useClipboardCopy";
import type { ConfigCardKind } from "../types";
import { maskApiKey } from "../utils/api-key";
import { ModCommandsList } from "./ModCommandsList";
import { ModSetupSteps } from "./ModSetupSteps";

type ConfigCardModalProps = {
  card: ConfigCardKind;
  username: string | undefined;
  apiKey: string | null;
  modConfigurated: boolean;
  onClose: () => void;
};

const CARD_TITLES: Record<ConfigCardKind, { title: string; subtitle: string }> = {
  account: { title: "Tu cuenta", subtitle: "Credenciales del mod" },
  commands: {
    title: "Comandos del mod",
    subtitle: "Se ejecutan dentro del juego",
  },
  setup: { title: "Configurá el mod", subtitle: "Tres pasos para empezar a reportar" },
};

function ConfigCardIcon({ card }: { card: ConfigCardKind }) {
  if (card === "account") {
    return (
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="6" r="3.2" />
        <path d="M3.8 17c0-3.2 2.8-5.2 6.2-5.2s6.2 2 6.2 5.2" />
      </svg>
    );
  }

  if (card === "commands") {
    return (
      <svg viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="4" width="15" height="12" rx="2.2" />
        <path d="m6.2 8.6 2 1.9-2 1.9M10.6 12.4h3.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M6.2 3.5h7.6l-1 5.1a2.8 2.8 0 0 1-5.6 0l-1-5.1Z" />
      <path d="M10 11.6v4.2M7.2 16.5h5.6" />
    </svg>
  );
}

/**
 * Detalle ampliado de las cards de configuración: credenciales, comandos del
 * mod y guía de instalación, con la API key completa y el copiado a mano.
 */
export function ConfigCardModal({
  card,
  username,
  apiKey,
  modConfigurated,
  onClose,
}: ConfigCardModalProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const { copiedValue, copyError, copy } = useClipboardCopy();

  if (typeof document === "undefined") return null;

  const { title, subtitle } = CARD_TITLES[card];
  const statusLabel = modConfigurated ? "Vinculado" : "Sin vincular";
  const statusClass = modConfigurated ? "is-plain" : "is-unknown";

  return createPortal(
    <div
      className="result-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="result-modal result-modal--minecraft config-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="config-modal-title"
      >
        <header className="result-modal-header">
          <button
            className="result-modal-close"
            type="button"
            aria-label="Cerrar detalle"
            onClick={onClose}
            autoFocus
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
          <div className="result-modal-player">
            <div className="result-modal-avatar" aria-hidden="true">
              <ConfigCardIcon card={card} />
            </div>
            <div className="result-modal-player-copy">
              <span className="result-modal-kicker">
                <span className="status-dot" />
                CONFIGURACIÓN
              </span>
              <h2 id="config-modal-title">{title}</h2>
              <span className="result-modal-subtitle">{subtitle}</span>
            </div>
          </div>
        </header>

        <div className="minecraft-profile-modal-details">
          {card === "account" && (
            <>
              <dl className="result-fields">
                <div className="result-field">
                  <dt>Usuario</dt>
                  <dd>
                    <strong>{username ?? "—"}</strong>
                  </dd>
                </div>
                <div className="result-field">
                  <dt>Estado del mod</dt>
                  <dd>
                    <span className={`result-tag ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </dd>
                </div>
                <div className="result-field">
                  <dt>API key</dt>
                  <dd className="config-key-value">
                    {apiKey ? (
                      <>
                        <code className="config-key">
                          {isRevealed ? apiKey : maskApiKey(apiKey)}
                        </code>
                        <button
                          className="config-reveal"
                          type="button"
                          onClick={() => setIsRevealed((current) => !current)}
                          aria-pressed={isRevealed}
                        >
                          {isRevealed ? "Ocultar" : "Mostrar"}
                        </button>
                        <CopyButton
                          label="API key"
                          copied={copiedValue === apiKey}
                          onClick={() => {
                            if (apiKey) void copy(apiKey);
                          }}
                        />
                      </>
                    ) : (
                      <strong className="config-key-missing">
                        Todavía no hay una API key
                      </strong>
                    )}
                  </dd>
                </div>
              </dl>

              <p className="preview-disclaimer">
                Tu API key identifica al mod en el panel: con ella se envían los
                jugadores de tus servidores. No la compartas. Para desvincular el
                mod, ejecutá <code>/dash clear</code> en el juego.
              </p>

              {copyError && (
                <p className="config-error" role="alert">
                  {copyError}
                </p>
              )}
            </>
          )}

          {card === "commands" && (
            <>
              <ModCommandsList apiKey={apiKey} />
              <p className="preview-disclaimer">
                El comando de vinculación se copia con tu API key ya incluida.
                Ejecutá los comandos dentro del juego, conectado a un servidor.
              </p>
            </>
          )}

          {card === "setup" && (
            <>
              <dl className="result-fields">
                <div className="result-field">
                  <dt>Requisitos</dt>
                  <dd>
                    <strong>Fabric loader + Fabric API</strong>
                  </dd>
                </div>
                <div className="result-field">
                  <dt>Carpeta del mod</dt>
                  <dd>
                    <strong>.minecraft/mods</strong>
                  </dd>
                </div>
                <div className="result-field">
                  <dt>Estado</dt>
                  <dd>
                    <span className={`result-tag ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </dd>
                </div>
              </dl>

              <ModSetupSteps />

              <p className="preview-disclaimer">
                Después de copiar el archivo del mod a la carpeta{" "}
                <code>mods</code>, reiniciá Minecraft antes de usar los comandos.
              </p>
            </>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
