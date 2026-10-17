import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { MinecraftAvatarFallback } from "../../find/components/profile/MinecraftProfileCard";
import { ResultCard } from "../../find/components/results/ResultCard";
import { useIpCountries } from "../../find/hooks/useIpCountries";
import { isHashedPassword } from "../../../utils/password";
import { usePlayerInfo } from "../hooks/usePlayerInfo";
import type { PlayerInfo } from "../types";

type PlayerModalProps = {
  playerName: string;
  onClose: () => void;
};

type PasswordFilter = "all" | "plain" | "hashed";

const FILTERS: { value: PasswordFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "plain", label: "Sin hashear" },
  { value: "hashed", label: "Hasheadas" },
];

const NO_INFOS: PlayerInfo[] = [];

function FilterIcon({ value }: { value: PasswordFilter }) {
  if (value === "hashed") {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="3.2" y="7" width="9.6" height="6.4" rx="1.7" />
        <path d="M5.4 7V5.2a2.6 2.6 0 0 1 5.2 0V7" />
      </svg>
    );
  }

  if (value === "plain") {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.2" />
        <path d="m5.2 8.2 1.9 1.9 3.8-4.1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2.4" y="2.4" width="4.7" height="4.7" rx="1.3" />
      <rect x="8.9" y="2.4" width="4.7" height="4.7" rx="1.3" />
      <rect x="2.4" y="8.9" width="4.7" height="4.7" rx="1.3" />
      <rect x="8.9" y="8.9" width="4.7" height="4.7" rx="1.3" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 8V3.5H8" />
      <path d="M12 3.5h4.5V8" />
      <path d="M16.5 12v4.5H12" />
      <path d="M8 16.5H3.5V12" />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M8 3.5V8H3.5" />
      <path d="M16.5 8H12V3.5" />
      <path d="M12 16.5V12h4.5" />
      <path d="M3.5 12H8v4.5" />
    </svg>
  );
}

export function PlayerModal({ playerName, onClose }: PlayerModalProps) {
  const state = usePlayerInfo(playerName);
  const [filter, setFilter] = useState<PasswordFilter>("all");
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<number>>(
    () => new Set(),
  );
  const [hashNotice, setHashNotice] = useState<number | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const infos = state.status === "loaded" ? state.infos : NO_INFOS;
  const ipCountries = useIpCountries(infos);

  const counts = useMemo(() => {
    let hashed = 0;
    let plain = 0;

    for (const info of infos) {
      if (isHashedPassword(info.password)) hashed += 1;
      else if (info.password !== null) plain += 1;
    }

    return { all: infos.length, plain, hashed };
  }, [infos]);

  const filteredInfos = useMemo(() => {
    if (filter === "all") return infos;
    if (filter === "hashed") {
      return infos.filter((info) => isHashedPassword(info.password));
    }
    return infos.filter(
      (info) => info.password !== null && !isHashedPassword(info.password),
    );
  }, [infos, filter]);

  if (typeof document === "undefined") return null;

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

  function copyForCard(value: string, target: string) {
    void copyValue(value, target);
  }

  function togglePassword(index: number) {
    setRevealedPasswords((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toggleHashNotice(index: number) {
    setHashNotice((current) => (current === index ? null : index));
  }

  const hasInfos = infos.length > 0;
  const activeIndex = FILTERS.findIndex((item) => item.value === filter);
  const subtitle =
    state.status === "loading"
      ? "Buscando registros..."
      : state.status === "error"
        ? state.message
        : !hasInfos
          ? "Sin registros guardados"
          : `${infos.length} ${
              infos.length === 1 ? "registro encontrado" : "registros encontrados"
            }`;

  return createPortal(
    <div
      className="result-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`result-modal dashmod-modal dashmod-player-modal${
          isExpanded ? " dashmod-player-modal--expanded" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashmod-player-modal-title"
      >
        <header className="result-modal-header">
          <button
            className="result-modal-close dashmod-modal-expand"
            type="button"
            aria-label={
              isExpanded
                ? "Reducir el modal"
                : "Agrandar el modal a pantalla completa"
            }
            aria-pressed={isExpanded}
            onClick={() => setIsExpanded((value) => !value)}
          >
            {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
          </button>
          <button
            className="result-modal-close"
            type="button"
            aria-label="Cerrar información del jugador"
            onClick={onClose}
            autoFocus
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
          <div className="result-modal-player">
            <div className="result-modal-avatar" aria-hidden="true">
              {avatarFailed ? (
                <MinecraftAvatarFallback />
              ) : (
                <img
                  src={`https://mc-heads.net/avatar/${encodeURIComponent(playerName)}/96`}
                  alt=""
                  onError={() => setAvatarFailed(true)}
                />
              )}
            </div>
            <div className="result-modal-player-copy">
              <span className="result-modal-kicker">
                <span className="status-dot" />
                JUGADOR REPORTADO
              </span>
              <h2 id="dashmod-player-modal-title">{playerName}</h2>
              <span className="result-modal-subtitle">{subtitle}</span>
            </div>
          </div>
        </header>

        <div className="minecraft-profile-modal-details dashmod-player-modal-details">
          {state.status === "loading" && (
            <div className="dashmod-modal-feedback" role="status">
              <span className="dashmod-modal-spinner" aria-hidden="true" />
              Buscando información del jugador...
            </div>
          )}

          {state.status === "error" && (
            <div
              className="dashmod-modal-feedback dashmod-modal-feedback--error"
              role="alert"
            >
              {state.message}
            </div>
          )}

          {copyError && (
            <div
              className="dashmod-modal-feedback dashmod-modal-feedback--error"
              role="alert"
            >
              {copyError}
            </div>
          )}

          {state.status === "loaded" && !hasInfos && (
            <div className="dashmod-modal-feedback">
              No hay registros guardados para este jugador.
            </div>
          )}

          {state.status === "loaded" && hasInfos && (
            <>
              <div
                className="players-filters dashmod-modal-filters"
                role="group"
                aria-label="Filtrar registros por tipo de contraseña"
              >
                <span
                  className="players-filters-indicator"
                  style={{
                    transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
                  }}
                  aria-hidden="true"
                />

                {FILTERS.map((item) => {
                  const isActive = filter === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      className={`players-filter-button${
                        isActive ? " is-active" : ""
                      }`}
                      aria-pressed={isActive}
                      onClick={() => setFilter(item.value)}
                    >
                      <span className="players-filter-icon">
                        <FilterIcon value={item.value} />
                      </span>
                      <span className="players-filter-label">{item.label}</span>
                      <span
                        key={counts[item.value]}
                        className="players-filter-count"
                      >
                        {counts[item.value]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filteredInfos.length === 0 ? (
                <div className="dashmod-modal-feedback">
                  {filter === "hashed"
                    ? "No hay registros con contraseña hasheada."
                    : "No hay registros con contraseña sin hashear."}
                </div>
              ) : (
                filteredInfos.map((info, index) => (
                  <ResultCard
                    key={`${info.server ?? "sin-servidor"}-${index}`}
                    record={info}
                    index={index}
                    copiedTarget={copiedTarget}
                    ipCountry={info.ip ? ipCountries[info.ip] ?? null : null}
                    hashNotice={hashNotice}
                    isPasswordVisible={revealedPasswords.has(index)}
                    isModal
                    onCopy={copyForCard}
                    onTogglePassword={togglePassword}
                    onToggleHashNotice={toggleHashNotice}
                  />
                ))
              )}
            </>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
