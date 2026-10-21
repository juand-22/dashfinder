import { useCallback, useEffect, useState } from "react";
import { DehashRequestError, getDehashes } from "../api/dehash.api";
import type { DehashAttempt, DehashCounts } from "../types";

export type DehashesState =
  | { status: "loading" }
  | {
      status: "loaded";
      attempts: DehashAttempt[];
      /** Cuántos hay con el filtro puesto (para paginar). */
      total: number;
      /** El resumen de todo el historial, sin el filtro. */
      counts: DehashCounts;
    }
  | { status: "error"; message: string };

type DehashesHook = {
  state: DehashesState;
  /** La página que se está viendo (1 = la de los más nuevos). */
  page: number;
  totalPages: number;
  isRefreshing: boolean;
  goToPage: (page: number) => void;
  reload: () => void;
};

/** Cada cuánto se vuelve a preguntar mientras hay algún hash dehasheándose. */
const POLL_MS = 3000;

/** Cuánto se espera antes de buscar, para no pedir una vez por tecla. */
const SEARCH_DEBOUNCE_MS = 300;

type DehashesOptions = {
  /** Cuántos intentos por página. */
  pageSize?: number;
  /** Lo que escribió el usuario en el buscador. */
  search?: string;
};

export function useDehashes({
  pageSize = 12,
  search = "",
}: DehashesOptions = {}): DehashesHook {
  const [state, setState] = useState<DehashesState>({ status: "loading" });
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [page, setPage] = useState(1);
  const [term, setTerm] = useState(search.trim());
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setIsRefreshing(true);
    setReloadToken((value) => value + 1);
  }, []);

  // Al cambiar la búsqueda se vuelve a la primera página. Va en el mismo
  // timeout para que React junte los dos cambios en un solo pedido.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setTerm(search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [search]);

  const total = state.status === "loaded" ? state.total : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Si el historial se achicó, la página guardada puede quedar más allá del
  // final: se muestra (y se pide) la última que existe.
  const currentPage = Math.min(page, totalPages);

  const goToPage = useCallback(
    (next: number) => {
      setPage(Math.min(Math.max(1, Math.trunc(next)), totalPages));
    },
    [totalPages],
  );

  useEffect(() => {
    const controller = new AbortController();
    let timer: number | null = null;

    function stopPolling() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function syncPolling(attempts: DehashAttempt[]) {
      const isDehashing = attempts.some(
        (attempt) => attempt.status === "DEHASHING",
      );

      if (isDehashing && timer === null) {
        timer = window.setInterval(() => void load(true), POLL_MS);
      } else if (!isDehashing) {
        stopPolling();
      }
    }

    async function load(isSilent: boolean) {
      let attempts: DehashAttempt[] | null = null;

      try {
        const result = await getDehashes(
          { limit: pageSize, offset: (currentPage - 1) * pageSize, name: term },
          controller.signal,
        );

        attempts = result.attempts;

        if (controller.signal.aborted) return;

        setState({
          status: "loaded",
          attempts: result.attempts,
          total: result.total,
          counts: result.counts,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        if (!isSilent) {
          setState({
            status: "error",
            message:
              error instanceof DehashRequestError
                ? error.message
                : "No se pudieron cargar los dehashes.",
          });
        }
      } finally {
        if (!isSilent && !controller.signal.aborted) setIsRefreshing(false);
      }

      if (attempts !== null) syncPolling(attempts);
    }

    void load(false);

    return () => {
      controller.abort();
      stopPolling();
    };
  }, [pageSize, currentPage, term, reloadToken]);

  return {
    state,
    page: currentPage,
    totalPages,
    reload,
    isRefreshing,
    goToPage,
  };
}
