import type { KeyboardEvent, MouseEvent } from "react";
import { Link } from "react-router-dom";
import type { DehashFeedback } from "../../../dehashes/types";
import type { FindRecord, IpCountry } from "../../types";
import { isHashedPassword } from "../../../../utils/password";
import { SaveNicknameButton } from "../../../mod-nicknames/components/SaveNicknameButton";
import { CopyButton } from "../common/CopyButton";

type ResultCardProps = {
  record: FindRecord;
  index: number;
  copiedTarget: string | null;
  ipCountry: IpCountry | null;
  /** Aviso del envío a dehashear, solo si es de este registro. */
  dehashFeedback: DehashFeedback | null;
  isPasswordVisible: boolean;
  isModal?: boolean;
  onCopy: (value: string, target: string) => void;
  onTogglePassword: (index: number) => void;
  onDehash: (record: FindRecord, index: number) => void;
  onOpen?: (record: FindRecord, index: number, opener: HTMLElement) => void;
};

export function ResultCard({
  record,
  index,
  copiedTarget,
  ipCountry,
  dehashFeedback,
  isPasswordVisible,
  isModal = false,
  onCopy,
  onTogglePassword,
  onDehash,
  onOpen,
}: ResultCardProps) {
  const isHashed = isHashedPassword(record.password);
  const hasPassword = record.password !== null;
  const serverName = record.server ?? "Servidor desconocido";

  function handleClick(event: MouseEvent<HTMLElement>) {
    if (isModal || !onOpen) return;
    if (event.target instanceof Element && event.target.closest("button, a")) {
      return;
    }
    onOpen(record, index, event.currentTarget);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (isModal || !onOpen || event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(record, index, event.currentTarget);
    }
  }

  function copyIfPresent(value: string | null, target: string) {
    if (value !== null) onCopy(value, target);
  }

  return (
    <article
      className={`result-card${isModal ? " result-card--modal" : " result-card--interactive"}`}
      tabIndex={isModal ? undefined : 0}
      aria-label={isModal ? undefined : `Ver detalles del resultado de ${record.name ?? serverName}`}
      aria-haspopup={isModal ? undefined : "dialog"}
      role={isModal ? undefined : "group"}
      onClick={isModal ? undefined : handleClick}
      onKeyDown={isModal ? undefined : handleKeyDown}
    >
      <div className="result-card-header">
        <div className="server-avatar" aria-hidden="true">
          {serverName.slice(0, 1).toUpperCase()}
        </div>
        <div className="server-details">
          <div className="server-name-row">
            <h3>{serverName}</h3>
            {record.server !== null && (
              <CopyButton
                label="servidor"
                copied={copiedTarget === `${index}-server`}
                onClick={() => copyIfPresent(record.server, `${index}-server`)}
              />
            )}
          </div>
          <span>Servidor</span>
        </div>
        <span
          className={`result-tag ${
            isHashed ? "is-hashed" : hasPassword ? "is-plain" : "is-unknown"
          }`}
        >
          {isHashed ? "Hasheada" : hasPassword ? "Sin hashear" : "Sin dato"}
        </span>
      </div>

      <dl className="result-fields">
        <div className="result-field">
          <dt>Usuario</dt>
          <dd>
            <span>{record.name ?? "—"}</span>
            {record.name !== null && (
              <CopyButton
                label="usuario"
                copied={copiedTarget === `${index}-name`}
                onClick={() => copyIfPresent(record.name, `${index}-name`)}
              />
            )}
          </dd>
        </div>
        <div className="result-field">
          <dt>IP</dt>
          <dd>
            <span className="ip-address">
              {ipCountry && (
                <img
                  className="ip-country-flag"
                  aria-label={ipCountry.country}
                  title={ipCountry.country}
                  src={`https://flagcdn.com/w40/${ipCountry.countryCode.toLowerCase()}.png`}
                  alt={`Bandera de ${ipCountry.country}`}
                  loading="lazy"
                />
              )}
              {record.ip ?? "—"}
            </span>
            {record.ip !== null && (
              <CopyButton
                label="IP"
                copied={copiedTarget === `${index}-ip`}
                onClick={() => copyIfPresent(record.ip, `${index}-ip`)}
              />
            )}
          </dd>
        </div>
        <div className="result-field">
          <dt>IP del servidor</dt>
          <dd>
            <span>{record.serverip ?? "—"}</span>
            {record.serverip !== null && (
              <CopyButton
                label="IP del servidor"
                copied={copiedTarget === `${index}-serverip`}
                onClick={() => copyIfPresent(record.serverip, `${index}-serverip`)}
              />
            )}
          </dd>
        </div>
        <div className="result-field">
          <dt>Salt</dt>
          <dd className="result-monospace">
            <span>{record.salt ?? "—"}</span>
            {record.salt !== null && (
              <CopyButton
                label="salt"
                copied={copiedTarget === `${index}-salt`}
                onClick={() => copyIfPresent(record.salt, `${index}-salt`)}
              />
            )}
          </dd>
        </div>
        <div className="result-field password-field">
          <dt>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="3" y="7" width="10" height="7" rx="2" />
              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
            </svg>
            Contraseña
          </dt>
          <dd className="password-cell">
            <div className="password-value">
              <code>
                {isHashed && !isPasswordVisible
                  ? "••••••••••••"
                  : record.password ?? "—"}
              </code>
              {record.password !== null && (
                <CopyButton
                  label="contraseña"
                  copied={copiedTarget === `${index}-password`}
                  onClick={() => copyIfPresent(record.password, `${index}-password`)}
                />
              )}
            </div>
            <div className="password-actions">
              <button
                className="password-action password-action--hash"
                type="button"
                disabled={!isHashed || !hasPassword}
                onClick={() => {
                  onDehash(record, index);
                  if (!isPasswordVisible) onTogglePassword(index);
                }}
              >
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 2v8m0 0 3-3m-3 3L5 7" />
                  <path d="M3 10v3a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3" />
                </svg>
                Deshashear
              </button>
              {record.password !== null && (
                <button
                  className="password-action password-action--copy"
                  type="button"
                  onClick={() => copyIfPresent(record.password, `${index}-password`)}
                >
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="5.5" y="5.5" width="8" height="9" rx="1.5" />
                    <path d="M10.5 3.5V3A1.5 1.5 0 0 0 9 1.5H3A1.5 1.5 0 0 0 1.5 3v7A1.5 1.5 0 0 0 3 11.5h.5" />
                  </svg>
                  Copiar contraseña
                </button>
              )}
              <SaveNicknameButton nickname={record.name} />
            </div>
          </dd>
        </div>
      </dl>
      {/* Este card no es la página de dehashes, así que el aviso lleva el link. */}
      {isHashed && dehashFeedback !== null && (
        <p
          className={`hash-notice${dehashFeedback.tone === "error" ? " hash-notice--error" : ""}`}
          role="status"
        >
          {dehashFeedback.tone === "info" ? (
            <>
              {dehashFeedback.message}{" "}
              <Link to="/dehashes">Revisá tu página Dehashes</Link> para ver el
              estado de tu hash.
            </>
          ) : (
            dehashFeedback.message
          )}
        </p>
      )}
    </article>
  );
}
