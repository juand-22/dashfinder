import { useCallback, useEffect, useState } from "react";
import { getServers, ServersRequestError } from "../api/servers.api";
import type { ModServer } from "../types";

export type ServersState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; servers: ModServer[] };

export function useServers() {
  const [state, setState] = useState<ServersState>({ status: "loading" });
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
        const servers = await getServers(controller.signal);
        if (controller.signal.aborted) return;

        setState({ status: "ready", servers });
      } catch (error) {
        if (controller.signal.aborted) return;

        setState({
          status: "error",
          message:
            error instanceof ServersRequestError
              ? error.message
              : "No se pudieron cargar tus servidores.",
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
