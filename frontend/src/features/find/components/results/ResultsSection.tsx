import type { DehashFeedback } from "../../../dehashes/types";
import type { FindRecord, IpCountry } from "../../types";
import { ResultCard } from "./ResultCard";

type ResultsSectionProps = {
  username: string;
  results: FindRecord[];
  ipCountries: Record<string, IpCountry | null>;
  copiedTarget: string | null;
  dehashFeedback: DehashFeedback | null;
  revealedPasswords: Set<number>;
  onCopy: (value: string, target: string) => void;
  onTogglePassword: (index: number) => void;
  onDehash: (record: FindRecord, index: number) => void;
  onOpenResult: (record: FindRecord, index: number, opener: HTMLElement) => void;
};

export function ResultsSection({
  username,
  results,
  ipCountries,
  copiedTarget,
  dehashFeedback,
  revealedPasswords,
  onCopy,
  onTogglePassword,
  onDehash,
  onOpenResult,
}: ResultsSectionProps) {
  return (
    <section className="results-section" aria-live="polite">
      <div className="results-heading">
        <div>
          <span className="section-eyebrow">RESULTADOS</span>
          <h2>
            {results.length
              ? `Coincidencias para “${username.trim()}”`
              : "Sin coincidencias"}
          </h2>
        </div>
        <span className="result-count">
          {results.length} {results.length === 1 ? "registro" : "registros"}
        </span>
      </div>

      {results.length > 0 ? (
        <div className="results-grid home-results-grid">
          {results.map((record, index) => (
            <ResultCard
              key={`${record.name ?? "sin-usuario"}-${record.server ?? "Servidor desconocido"}-${record.ip ?? "sin-ip"}-${index}`}
              record={record}
              index={index}
              copiedTarget={copiedTarget}
              ipCountry={record.ip ? ipCountries[record.ip] ?? null : null}
              dehashFeedback={
                dehashFeedback?.key === String(index) ? dehashFeedback : null
              }
              isPasswordVisible={revealedPasswords.has(index)}
              onCopy={onCopy}
              onTogglePassword={onTogglePassword}
              onDehash={onDehash}
              onOpen={onOpenResult}
            />
          ))}
        </div>
      ) : (
        <div className="empty-results">
          <span className="empty-search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5M8.3 10.8h5" />
            </svg>
          </span>
          <h3>No encontramos ese usuario</h3>
          <p>Comprueba el nombre e inténtalo de nuevo.</p>
        </div>
      )}
    </section>
  );
}
