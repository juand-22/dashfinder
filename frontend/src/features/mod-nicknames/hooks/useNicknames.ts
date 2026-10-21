import { useCallback, useEffect, useState } from "react";
import {
  createNickname,
  deleteNickname,
  getNicknames,
  NicknameRequestError,
} from "../api/nicknames.api";
import type { ModNickname } from "../types";

export type NicknamesState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; nicknames: ModNickname[] };

/**
 * Los nicks guardados de la cuenta, con lo necesario para crear y borrar.
 *
 * `add` y `remove` devuelven el mensaje de error (o `null` si salió bien): así
 * quien llama decide dónde mostrarlo. La lista se actualiza sin volver a pedirla
 * entera, porque el backend devuelve el nick recién creado.
 */
export function useNicknames() {
  const [state, setState] = useState<NicknamesState>({ status: "loading" });
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
        const nicknames = await getNicknames(controller.signal);
        if (controller.signal.aborted) return;

        setState({ status: "ready", nicknames });
      } catch (error) {
        if (controller.signal.aborted) return;

        setState({
          status: "error",
          message:
            error instanceof NicknameRequestError
              ? error.message
              : "No se pudieron cargar los nicks.",
        });
      } finally {
        if (!controller.signal.aborted) {
          setIsRefreshing(false);
        }
      }
    })();

    return () => controller.abort();
  }, [reloadToken]);

  const add = useCallback(async (nickname: string): Promise<string | null> => {
    try {
      const created = await createNickname(nickname);

      setState((current) =>
        current.status === "ready"
          ? { status: "ready", nicknames: [created, ...current.nicknames] }
          : { status: "ready", nicknames: [created] },
      );

      return null;
    } catch (error) {
      return error instanceof NicknameRequestError
        ? error.message
        : "No se pudo guardar el nick.";
    }
  }, []);

  const remove = useCallback(async (id: number): Promise<string | null> => {
    try {
      await deleteNickname(id);

      setState((current) =>
        current.status === "ready"
          ? {
              status: "ready",
              nicknames: current.nicknames.filter(
                (nickname) => nickname.id !== id,
              ),
            }
          : current,
      );

      return null;
    } catch (error) {
      return error instanceof NicknameRequestError
        ? error.message
        : "No se pudo eliminar el nick.";
    }
  }, []);

  return { state, reload, isRefreshing, add, remove };
}
