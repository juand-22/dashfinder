import { useCallback, useEffect, useState } from "react";
import { getNicknameServers, NicknameRequestError } from "../api/nicknames.api";
import type { NicknameServer } from "../types";

export type NicknameServersState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; servers: NicknameServer[] };

/**
 * Busca el nick en todos los servidores guardados. Solo consulta cuando hay
 * nick: el modal se monta al abrir la tarjeta, así que el primer estado es
 * `loading` y la respuesta llega por el efecto.
 */
export function useNicknameServers(nickname: string | null) {
  const [state, setState] = useState<NicknameServersState>({
    status: "loading",
  });
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!nickname) return;

    const controller = new AbortController();

    void (async () => {
      try {
        const servers = await getNicknameServers(nickname, controller.signal);

        if (controller.signal.aborted) return;
        setState({ status: "ready", servers });
      } catch (error) {
        if (controller.signal.aborted) return;

        setState({
          status: "error",
          message:
            error instanceof NicknameRequestError
              ? error.message
              : "No se pudieron buscar los servidores.",
        });
      }
    })();

    return () => controller.abort();
  }, [nickname, reloadToken]);

  return { state, reload };
}
