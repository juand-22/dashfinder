import { useCallback, useEffect, useState } from "react";
import { ModRequestError } from "../../dashmod/api/dashmod.api";
import {
  ConfiguracionRequestError,
  getModCredentials,
} from "../api/configuracion.api";

export type ModCredentialsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; apiKey: string | null; modConfigurated: boolean };

export function useModCredentials() {
  const [state, setState] = useState<ModCredentialsState>({ status: "loading" });
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
        const credentials = await getModCredentials(controller.signal);
        if (controller.signal.aborted) return;

        setState({ status: "ready", ...credentials });
      } catch (error) {
        if (controller.signal.aborted) return;

        setState({
          status: "error",
          message:
            error instanceof ConfiguracionRequestError ||
            error instanceof ModRequestError
              ? error.message
              : "No se pudo cargar tu configuración.",
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
