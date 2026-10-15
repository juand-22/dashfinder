export type MinecraftServerStatus = {
  online: boolean;
  host: string;
  port: number;
  players: { online: number; max: number } | null;
  motd: string;
  icon: string | null;
  version: string | null;
};

export class MinecraftServerStatusRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MinecraftServerStatusRequestError";
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

function isPlayerCount(value: unknown): value is { online: number; max: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "online" in value &&
    typeof value.online === "number" &&
    "max" in value &&
    typeof value.max === "number"
  );
}

export async function getMinecraftServerStatus(
  address: string,
  signal: AbortSignal,
): Promise<MinecraftServerStatus> {
  let response: Response;

  try {
    response = await fetch(
      `${apiBaseUrl}/api/find/minecraft-server-status?address=${encodeURIComponent(address)}`,
      { credentials: "include", signal },
    );
  } catch (error) {
    if (signal.aborted) throw error;
    throw new MinecraftServerStatusRequestError(
      "No se pudo consultar el estado del servidor.",
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new MinecraftServerStatusRequestError(
        "Tu sesión expiró. Inicia sesión de nuevo.",
      );
    }
    throw new MinecraftServerStatusRequestError(
      "No se pudo consultar el estado del servidor.",
    );
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new MinecraftServerStatusRequestError(
      "El servidor devolvió una respuesta inválida.",
    );
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("online" in result) ||
    typeof result.online !== "boolean" ||
    !("host" in result) ||
    typeof result.host !== "string" ||
    !("port" in result) ||
    typeof result.port !== "number" ||
    !("motd" in result) ||
    typeof result.motd !== "string" ||
    !("icon" in result) ||
    (result.icon !== null && typeof result.icon !== "string") ||
    !("version" in result) ||
    (result.version !== null && typeof result.version !== "string") ||
    !("players" in result) ||
    (result.players !== null && !isPlayerCount(result.players))
  ) {
    throw new MinecraftServerStatusRequestError(
      "El servidor devolvió una respuesta inválida.",
    );
  }

  return {
    online: result.online,
    host: result.host,
    port: result.port,
    players: result.players,
    motd: result.motd,
    icon: result.icon,
    version: result.version,
  };
}
