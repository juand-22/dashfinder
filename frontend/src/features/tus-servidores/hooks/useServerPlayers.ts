import { useCallback, useEffect, useState } from "react";
import { getServerPlayers, ServersRequestError } from "../api/servers.api";
import type { ServerPlayer } from "../types";

export type ServerPlayersState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "not-found" }
  | { status: "ready"; players: ServerPlayer[] };

function isValidId(serverId: number) {
  return Number.isInteger(serverId) && serverId > 0;
}

export function useServerPlayers(serverId: number) {
  const [state, setState] = useState<ServerPlayersState>(() =>
    isValidId(serverId) ? { status: "loading" } : { status: "not-found" },
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setIsRefreshing(true);
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!isValidId(serverId)) return;

    const controller = new AbortController();

    void (async () => {
      try {
        const players = await getServerPlayers(serverId, controller.signal);
        if (controller.signal.aborted) return;

        setState({ status: "ready", players });
      } catch (error) {
        if (controller.signal.aborted) return;

        if (error instanceof ServersRequestError) {
          if (error.code === "PLAYERS_NOT_FOUND") {
            setState({ status: "empty" });
            return;
          }

          if (error.code === "SERVER_NOT_FOUND") {
            setState({ status: "not-found" });
            return;
          }

          setState({ status: "error", message: error.message });
          return;
        }

        setState({
          status: "error",
          message: "No se pudieron cargar los jugadores de este servidor.",
        });
      } finally {
        if (!controller.signal.aborted) {
          setIsRefreshing(false);
        }
      }
    })();

    return () => controller.abort();
  }, [serverId, reloadToken]);

  return { state, reload, isRefreshing };
}
