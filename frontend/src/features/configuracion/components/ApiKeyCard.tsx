import { useState } from "react";
import { CopyButton } from "../../find/components/common/CopyButton";
import { useClipboardCopy } from "../hooks/useClipboardCopy";
import { maskApiKey } from "../utils/api-key";
import { ConfigCard } from "./ConfigCard";

type ApiKeyCardProps = {
  username: string | undefined;
  apiKey: string | null;
  modConfigurated: boolean;
  onOpen: (opener: HTMLElement) => void;
};

export function ApiKeyCard({
  username,
  apiKey,
  modConfigurated,
  onOpen,
}: ApiKeyCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const { copiedValue, copyError, copy } = useClipboardCopy();

  return (
    <ConfigCard labelledBy="config-account-title" onOpen={onOpen}>
      <header className="result-card-header">
        <span className="server-avatar config-avatar" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="6" r="3.2" />
            <path d="M3.8 17c0-3.2 2.8-5.2 6.2-5.2s6.2 2 6.2 5.2" />
          </svg>
        </span>
        <div className="server-details">
          <h3 id="config-account-title">Tu cuenta</h3>
          <span>Credenciales del mod</span>
        </div>
        <span
          className={`result-tag ${modConfigurated ? "is-plain" : "is-unknown"}`}
        >
          {modConfigurated ? "Vinculado" : "Pendiente"}
        </span>
      </header>

      <dl className="result-fields config-fields">
        <div className="result-field">
          <dt>Usuario</dt>
          <dd>
            <strong>{username ?? "—"}</strong>
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

      <p className="config-note">
        Tu API key identifica al mod en el panel. No la compartas: con ella se
        pueden enviar datos a tu cuenta.
      </p>

      {copyError && (
        <p className="config-error" role="alert">
          {copyError}
        </p>
      )}
    </ConfigCard>
  );
}
