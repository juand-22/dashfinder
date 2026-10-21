import { useState, type CSSProperties } from "react";
import { CopyButton } from "../../find/components/common/CopyButton";
import { MinecraftAvatarFallback } from "../../find/components/profile/MinecraftProfileCard";
import type { MinecraftProfile } from "../../find/types";
import { SaveNicknameButton } from "../../mod-nicknames/components/SaveNicknameButton";
import type { DehashAttempt, DehashFeedback } from "../types";
import {
  DEHASH_STATUS_LABELS,
  DEHASH_STATUS_SLUGS,
  canRetryDehash,
  shortenHash,
} from "../utils";

type DehashAttemptCardProps = {
  attempt: DehashAttempt;
  index: number;
  copiedTarget: string | null;
  feedback: DehashFeedback | null;
  /** Perfil oficial del nick, para sacarle la cabeza. `null` = sin perfil. */
  profile: MinecraftProfile | null;
  isRetrying: boolean;
  onCopy: (value: string, target: string) => void;
  onRetry: (attempt: DehashAttempt) => void;
};

function RetryIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13.2 8a5.2 5.2 0 1 1-1.6-3.7" />
      <path d="M13.4 2.6v3.2h-3.2" />
    </svg>
  );
}

export function DehashAttemptCard({
  attempt,
  index,
  copiedTarget,
  feedback,
  profile,
  isRetrying,
  onCopy,
  onRetry,
}: DehashAttemptCardProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const slug = DEHASH_STATUS_SLUGS[attempt.status];
  const result = attempt.result;
  const displayName = profile?.name ?? attempt.name ?? "Sin nombre";
  const hashTarget = `dehash-${attempt.id}-hash`;
  const resultTarget = `dehash-${attempt.id}-result`;
  const style = {
    animationDelay: `${Math.min(index, 12) * 45}ms`,
  } as CSSProperties;

  return (
    <article className={`dehash-card is-${slug}`} style={style}>
      <header className="dehash-card-header">
        <div className="dehash-card-player">
          <span className="dehash-avatar" aria-hidden="true">
            {profile !== null && !avatarFailed ? (
              <img
                src={`https://mc-heads.net/avatar/${profile.id}/64`}
                alt=""
                loading="lazy"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <MinecraftAvatarFallback />
            )}
          </span>
          <div className="dehash-card-heading">
            <h3 className="dehash-card-name">{displayName}</h3>
            <span className="dehash-card-hash">
              <code title={attempt.hash}>{shortenHash(attempt.hash)}</code>
              <CopyButton
                label="hash"
                copied={copiedTarget === hashTarget}
                onClick={() => onCopy(attempt.hash, hashTarget)}
              />
            </span>
          </div>
        </div>
        <span className={`dehash-status is-${slug}`}>
          {DEHASH_STATUS_LABELS[attempt.status]}
        </span>
      </header>

      {attempt.status === "FOUND" && result !== null && (
        <div className="dehash-result">
          <div className="dehash-result-copy">
            <span className="dehash-result-label">Contraseña encontrada</span>
            <code>{result}</code>
          </div>
          <CopyButton
            label="contraseña"
            copied={copiedTarget === resultTarget}
            onClick={() => onCopy(result, resultTarget)}
          />
        </div>
      )}

      {attempt.status === "DEHASHING" && (
        <p className="dehash-card-note dehash-card-note--loading" role="status">
          <span className="dehash-spinner" aria-hidden="true" />
          Dehasheando...
        </p>
      )}

      {attempt.status === "NOT_FOUND" && (
        <p className="dehash-card-note">No se encontró esta contraseña.</p>
      )}

      {attempt.status === "SERVER_ERROR" && (
        <p className="dehash-card-note dehash-card-note--error">
          Ocurrió un error al buscar.
        </p>
      )}

      {attempt.status === "INVALID" && (
        <p className="dehash-card-note dehash-card-note--error">
          El hash no es válido.
        </p>
      )}

      {(attempt.name !== null || canRetryDehash(attempt.status)) && (
        <div className="dehash-card-actions">
          <SaveNicknameButton nickname={attempt.name} />
          {canRetryDehash(attempt.status) && (
            <button
              className="dehash-action"
              type="button"
              disabled={isRetrying}
              onClick={() => onRetry(attempt)}
            >
              <RetryIcon />
              {isRetrying ? "Enviando..." : "Reintentar"}
            </button>
          )}
        </div>
      )}

      {feedback && (
        <p className={`dehash-feedback is-${feedback.tone}`} role="status">
          {feedback.message}
        </p>
      )}
    </article>
  );
}
