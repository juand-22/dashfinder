import { useCallback, useEffect, useState } from "react";
import {
  DehashRequestError,
  getDehashesByName,
} from "../../dehashes/api/dehash.api";
import type { DehashAttempt } from "../../dehashes/types";

export type NicknameDehashesState =
  | { status: "loading" }
  | { status: "loaded"; attempts: DehashAttempt[] }
  | { status: "error"; message: string };

/** Cada cuánto se vuelve a preguntar mientras hay algún hash dehasheándose. */
const POLL_MS = 3000;

/**
 * Los dehashes que hay con ese nickname exacto. Mientras alguno está en
 * `DEHASHING` se refresca solo, igual que la página de Dehashes.
 */
export function useNicknameDehashes(nickname: string) {
  const [state, setState] = useState<NicknameDehashesState>({
    status: "loading",
  });
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

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
      try {
        const attempts = await getDehashesByName(nickname, controller.signal);

        if (controller.signal.aborted) return;

        setState({ status: "loaded", attempts });
        syncPolling(attempts);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (isSilent) return;

        setState({
          status: "error",
          message:
            error instanceof DehashRequestError
              ? error.message
              : "No se pudieron cargar los dehashes del nick.",
        });
      }
    }

    void load(false);

    return () => {
      controller.abort();
      stopPolling();
    };
  }, [nickname, reloadToken]);

  return { state, reload };
}
