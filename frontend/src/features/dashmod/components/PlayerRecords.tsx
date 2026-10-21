import { useMemo, useState } from "react";
import { useDehashSender } from "../../dehashes/hooks/useDehashSender";
import { ResultCard } from "../../find/components/results/ResultCard";
import { useIpCountries } from "../../find/hooks/useIpCountries";
import { isHashedPassword } from "../../../utils/password";
import type { PlayerInfo } from "../types";

type PlayerRecordsProps = {
  /** Los registros que devolvió la base externa (mcdbs). */
  infos: PlayerInfo[];
};

type PasswordFilter = "all" | "plain" | "hashed";

const FILTERS: { value: PasswordFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "plain", label: "Sin hashear" },
  { value: "hashed", label: "Hasheadas" },
];

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

/**
 * Los registros de mcdbs de un jugador: filtros por tipo de contraseña, sus
 * tarjetas, copiar y deshashear. Lo usan el modal de jugador de Dashmod y el
 * de Dash nicknames.
 */
export function PlayerRecords({ infos }: PlayerRecordsProps) {
  const [filter, setFilter] = useState<PasswordFilter>("all");
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<number>>(
    () => new Set(),
  );
  const { feedback: dehashFeedback, send: dehash } = useDehashSender();
  const [copyError, setCopyError] = useState<string | null>(null);
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

  const activeIndex = FILTERS.findIndex((item) => item.value === filter);

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

  function dehashForCard(record: PlayerInfo, index: number) {
    dehash(record, String(index));
  }

  return (
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
              className={`players-filter-button${isActive ? " is-active" : ""}`}
              aria-pressed={isActive}
              onClick={() => setFilter(item.value)}
            >
              <span className="players-filter-icon">
                <FilterIcon value={item.value} />
              </span>
              <span className="players-filter-label">{item.label}</span>
              <span key={counts[item.value]} className="players-filter-count">
                {counts[item.value]}
              </span>
            </button>
          );
        })}
      </div>

      {copyError && (
        <div
          className="dashmod-modal-feedback dashmod-modal-feedback--error"
          role="alert"
        >
          {copyError}
        </div>
      )}

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
            ipCountry={info.ip ? (ipCountries[info.ip] ?? null) : null}
            dehashFeedback={
              dehashFeedback?.key === String(index) ? dehashFeedback : null
            }
            isPasswordVisible={revealedPasswords.has(index)}
            isModal
            onCopy={copyForCard}
            onTogglePassword={togglePassword}
            onDehash={dehashForCard}
          />
        ))
      )}
    </>
  );
}
