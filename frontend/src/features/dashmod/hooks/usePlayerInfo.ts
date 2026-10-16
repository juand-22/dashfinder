import { useEffect, useState } from "react";
import { getPlayerInfo, ModRequestError } from "../api/dashmod.api";
import type { PlayerInfo } from "../types";

export type PlayerInfoState =
  | { status: "loading" }
  | { status: "loaded"; infos: PlayerInfo[] }
  | { status: "error"; message: string };

export function usePlayerInfo(name: string): PlayerInfoState {
  const [state, setState] = useState<PlayerInfoState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    void getPlayerInfo(name, controller.signal)
      .then((infos) => {
        if (controller.signal.aborted) return;
        setState({ status: "loaded", infos });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message:
            error instanceof ModRequestError
              ? error.message
              : "No se pudo cargar la información del jugador.",
        });
      });

    return () => controller.abort();
  }, [name]);

  return state;
}
