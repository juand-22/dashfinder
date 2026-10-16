import { useEffect, useState } from "react";
import {
  getMinecraftServerStatus,
  MinecraftServerStatusRequestError,
} from "../api/minecraft-server-status.api";
import type { MinecraftServerStatusLookup } from "../types";

export function useServerStatus(address: string) {
  const [lookup, setLookup] = useState<MinecraftServerStatusLookup | null>(null);

  useEffect(() => {
    if (!address) return;

    const controller = new AbortController();
    void getMinecraftServerStatus(address, controller.signal)
      .then((server) => {
        if (controller.signal.aborted) return;
        setLookup({ status: "loaded", address, server });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLookup({
          status: "error",
          address,
          message:
            error instanceof MinecraftServerStatusRequestError
              ? error.message
              : "No se pudo consultar el estado del servidor.",
        });
      });

    return () => controller.abort();
  }, [address]);

  return lookup?.address === address
    ? lookup
    : address
      ? { status: "loading" as const, address }
      : null;
}
