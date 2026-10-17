import type { MinecraftServerStatusLookup } from "../../find/types";

export type ServerStatusBadgeVariant =
  | "online"
  | "offline"
  | "loading"
  | "error"
  | "unknown";

export type ServerStatusBadge = {
  variant: ServerStatusBadgeVariant;
  label: string;
};

/**
 * Traduce el estado de un servidor de Minecraft (el mismo que usa el feature
 * `find` en `GET /api/find/minecraft-server-status`) a la variante y el texto
 * del badge. Centralizado para que el listado, la subpágina y el modal
 * muestren siempre lo mismo.
 */
export function getServerStatusBadge(
  status: MinecraftServerStatusLookup | null,
): ServerStatusBadge {
  if (!status) return { variant: "unknown", label: "SIN DATOS" };
  if (status.status === "loading") {
    return { variant: "loading", label: "CONSULTANDO" };
  }
  if (status.status === "error") {
    return { variant: "error", label: "NO DISPONIBLE" };
  }

  return status.server.online
    ? { variant: "online", label: "EN LÍNEA" }
    : { variant: "offline", label: "DESCONECTADO" };
}
