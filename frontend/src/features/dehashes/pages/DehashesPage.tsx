import { useRef, useState } from "react";
import { useAuth } from "../../auth/context/auth.context";
import { DashboardLayout } from "../../find/components/layout/DashboardLayout";
import { DehashAttemptCard } from "../components/DehashAttemptCard";
import { DehashesPagination } from "../components/DehashesPagination";
import { DehashesToolbar } from "../components/DehashesToolbar";
import { useDehashSender } from "../hooks/useDehashSender";
import { useDehashes } from "../hooks/useDehashes";
import { useMinecraftProfiles } from "../../find/hooks/useMinecraftProfiles";
import type { DehashAttempt } from "../types";
import { countDehashes, EMPTY_DEHASH_COUNTS } from "../utils";
import "../styles/DehashesPage.css";

/** Cuántos intentos por página. */
const PAGE_SIZE = 12;

export function DehashesPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const { state, page, totalPages, reload, isRefreshing, goToPage } =
    useDehashes({ pageSize: PAGE_SIZE, search: query });
  const { feedback, send } = useDehashSender();
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<number | null>(null);
  const listRef = useRef<HTMLElement | null>(null);
  const attempts = state.status === "loaded" ? state.attempts : [];
  // El resumen y el total son de todo el historial: no cambian al paginar.
  const counts = state.status === "loaded" ? state.counts : EMPTY_DEHASH_COUNTS;
  const totalHistory = countDehashes(counts);
  const total = state.status === "loaded" ? state.total : 0;
  const isSearching = query.trim() !== "";
  const profiles = useMinecraftProfiles(
    attempts.map((attempt) => attempt.name ?? ""),
  );
  const found = counts.FOUND;
  const notFound = counts.NOT_FOUND;
  const dehashing = counts.DEHASHING;
  const failed = counts.SERVER_ERROR + counts.INVALID;

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

  /** Al cambiar de página se vuelve arriba de la lista, donde están las tarjetas. */
  function changePage(next: number) {
    goToPage(next);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function retry(attempt: DehashAttempt) {
    // Reintentar es volver a mandar el mismo hash: no hay ruta aparte.
    setRetryingId(attempt.id);
    send(
      { name: attempt.name, password: attempt.hash, salt: null },
      String(attempt.id),
    );
    window.setTimeout(() => {
      setRetryingId(null);
      reload();
    }, 800);
  }

  return (
    <DashboardLayout username={user?.username} section="DEHASHES">
      <div className="dehashes-page">
        <section className="dehashes-hero">
          <span className="section-eyebrow">DEHASHES</span>
          <h1>Tus hashes</h1>
          <p>
            Acá queda cada hash que mandaste a dehashear, con su estado. Mientras
            uno se está dehasheando se actualiza solo, y la contraseña
            encontrada queda guardada.
          </p>
          <div className="dehashes-hero-actions">
            <span className="result-count">
              {totalHistory} {totalHistory === 1 ? "intento" : "intentos"}
            </span>
            <button
              className={`dehashes-refresh${isRefreshing ? " is-refreshing" : ""}`}
              type="button"
              onClick={reload}
              disabled={isRefreshing}
              aria-busy={isRefreshing}
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13.2 8a5.2 5.2 0 1 1-1.6-3.7" />
                <path d="M13.4 2.6v3.2h-3.2" />
              </svg>
              {isRefreshing ? "Actualizando" : "Actualizar"}
            </button>
          </div>
        </section>

        {copyError && (
          <div className="search-message error-message" role="alert">
            <span className="message-icon" aria-hidden="true">!</span>
            <span>{copyError}</span>
          </div>
        )}

        {state.status === "loading" && (
          <section className="dehashes-state" aria-live="polite">
            <div className="dehashes-state-icon" aria-hidden="true">
              <span className="dehash-spinner" />
            </div>
            <h3>Cargando tus dehashes</h3>
            <p>Trayendo el historial guardado.</p>
          </section>
        )}

        {state.status === "error" && (
          <section className="dehashes-state" role="alert">
            <h3>No se pudieron cargar los dehashes</h3>
            <p>{state.message}</p>
            <button
              className="dehashes-refresh"
              type="button"
              onClick={reload}
            >
              Reintentar
            </button>
          </section>
        )}

        {state.status === "loaded" && totalHistory === 0 && (
          <section className="dehashes-state">
            <h3>Todavía no mandaste ningún hash</h3>
            <p>
              Desde una contraseña hasheada, apretá «Deshashear» y el intento
              aparece acá.
            </p>
          </section>
        )}

        {state.status === "loaded" && totalHistory > 0 && (
          <>
            <section className="dehashes-stats" aria-label="Resumen">
              <article className="dehashes-stat is-found">
                <strong>{found}</strong>
                <span>Encontradas</span>
              </article>
              <article className="dehashes-stat is-not-found">
                <strong>{notFound}</strong>
                <span>Sin resultado</span>
              </article>
              <article className="dehashes-stat is-dehashing">
                <strong>{dehashing}</strong>
                <span>En curso</span>
              </article>
              <article className="dehashes-stat is-error">
                <strong>{failed}</strong>
                <span>Con error</span>
              </article>
            </section>

            <section
              className="dehashes-list"
              ref={listRef}
              aria-label="Historial de dehashes"
            >
              <div className="results-heading">
                <div>
                  <span className="section-eyebrow">HISTORIAL</span>
                  <h2>Tus dehashes encontrados</h2>
                </div>
              </div>

              <DehashesToolbar
                query={query}
                countLabel={
                  isSearching ? `${total} de ${totalHistory}` : null
                }
                onQueryChange={setQuery}
              />

              {total === 0 ? (
                <div className="empty-results">
                  <span className="empty-search-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="10.5" cy="10.5" r="6" />
                      <path d="m15.2 15.2 4.3 4.3" />
                    </svg>
                  </span>
                  <h3>Sin coincidencias</h3>
                  <p>Ajustá la búsqueda para ver otros dehashes.</p>
                </div>
              ) : (
                <>
                  <div className="dehashes-grid">
                    {attempts.map((attempt, index) => (
                      <DehashAttemptCard
                        key={attempt.id}
                        attempt={attempt}
                        index={index}
                        copiedTarget={copiedTarget}
                        feedback={
                          feedback?.key === String(attempt.id) ? feedback : null
                        }
                        profile={
                          attempt.name
                            ? profiles[attempt.name.trim().toLowerCase()] ?? null
                            : null
                        }
                        isRetrying={retryingId === attempt.id}
                        onCopy={copyForCard}
                        onRetry={retry}
                      />
                    ))}
                  </div>

                  <DehashesPagination
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    isRefreshing={isRefreshing}
                    onPageChange={changePage}
                  />
                </>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
