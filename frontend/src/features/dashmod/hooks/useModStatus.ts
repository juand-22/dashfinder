import { useCallback, useEffect, useState } from "react";
import {
  getActualServer,
  getModConfigurated,
  ModRequestError,
} from "../api/dashmod.api";
import type { ModActivity } from "../types";

export type ModStatusState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "not-configured" }
  | { status: "configured"; activity: ModActivity | null };

export function useModStatus() {
  const [state, setState] = useState<ModStatusState>({ status: "loading" });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setIsRefreshing(true);
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        const configured = await getModConfigurated(controller.signal);
        if (controller.signal.aborted) return;

        if (!configured) {
          setState({ status: "not-configured" });
          return;
        }

        const activity = await getActualServer(controller.signal);
        if (controller.signal.aborted) return;

        setState({ status: "configured", activity });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message:
            error instanceof ModRequestError
              ? error.message
              : "No se pudo cargar el estado del mod.",
        });
      } finally {
        if (!controller.signal.aborted) {
          setIsRefreshing(false);
        }
      }
    })();

    return () => controller.abort();
  }, [reloadToken]);

  return { state, reload, isRefreshing };
}
