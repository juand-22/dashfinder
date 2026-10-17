import type { ModServer, ServerPlayer } from "../types";

export class ServersRequestError extends Error {
  readonly code: string;

  constructor(message: string, code = "UNKNOWN") {
    super(message);
    this.name = "ServersRequestError";
    this.code = code;
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function readErrorCode(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json();

    if (isRecord(body) && typeof body.code === "string") {
      return body.code;
    }

    return null;
  } catch {
    return null;
  }
}

function normalizeServer(value: unknown): ModServer | null {
  if (!isRecord(value)) return null;
  if (typeof value.name !== "string") return null;
  if (typeof value.ip !== "string") return null;

  const id = readNumber(value.id);
  const port = readNumber(value.port);
  const playersTotal = readNumber(value.players_total);
  const playerFounds = readNumber(value.player_founds);
  const playersNotFounds = readNumber(value.players_not_founds);

  if (
    id === null ||
    port === null ||
    playersTotal === null ||
    playerFounds === null ||
    playersNotFounds === null
  ) {
    return null;
  }

  return {
    id,
    name: value.name,
    ip: value.ip,
    port,
    players_total: playersTotal,
    player_founds: playerFounds,
    players_not_founds: playersNotFounds,
  };
}

function normalizePlayer(value: unknown): ServerPlayer | null {
  if (!isRecord(value)) return null;
  if (typeof value.name !== "string") return null;
  if (typeof value.servername !== "string") return null;
  if (typeof value.serverip !== "string") return null;

  const recordsFounds = readNumber(value.records_founds);
  const serverPort = readNumber(value.serverport);

  if (recordsFounds === null || serverPort === null) return null;

  return {
    name: value.name,
    rank: typeof value.rank === "string" ? value.rank : null,
    found: value.found === true,
    records_founds: recordsFounds,
    servername: value.servername,
    serverip: value.serverip,
    serverport: serverPort,
  };
}

export async function getServers(signal?: AbortSignal): Promise<ModServer[]> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/servers`, {
      credentials: "include",
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ServersRequestError(
      "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      "NETWORK",
    );
  }

  // El backend responde 404 cuando el usuario todavía no tiene servidores.
  if (response.status === 404) return [];

  if (!response.ok) {
    if (response.status === 401) {
      throw new ServersRequestError(
        "Tu sesión expiró. Inicia sesión de nuevo.",
        "UNAUTHORIZED",
      );
    }
    throw new ServersRequestError(
      "No se pudieron cargar tus servidores. Inténtalo de nuevo.",
      "UNKNOWN",
    );
  }

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new ServersRequestError(
      "El servidor devolvió una respuesta inválida.",
      "INVALID_RESPONSE",
    );
  }

  if (!Array.isArray(result)) {
    throw new ServersRequestError(
      "El servidor devolvió una respuesta inválida.",
      "INVALID_RESPONSE",
    );
  }

  const servers = result.map(normalizeServer);
  if (servers.some((server) => server === null)) {
    throw new ServersRequestError(
      "El servidor devolvió una respuesta inválida.",
      "INVALID_RESPONSE",
    );
  }

  return servers as ModServer[];
}

export async function getServerPlayers(
  serverId: number,
  signal?: AbortSignal,
): Promise<ServerPlayer[]> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/servers/${serverId}/players`, {
      credentials: "include",
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ServersRequestError(
      "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      "NETWORK",
    );
  }

  if (!response.ok) {
    const code = await readErrorCode(response);

    if (code === "PLAYERS_NOT_FOUND") {
      throw new ServersRequestError(
        "Este servidor todavía no tiene jugadores guardados.",
        "PLAYERS_NOT_FOUND",
      );
    }

    if (code === "SERVER_NOT_FOUND") {
      throw new ServersRequestError(
        "El servidor no existe o ya no te pertenece.",
        "SERVER_NOT_FOUND",
      );
    }

    if (response.status === 401 || code === "UNAUTHORIZED") {
      throw new ServersRequestError(
        "Tu sesión expiró. Inicia sesión de nuevo.",
        "UNAUTHORIZED",
      );
    }

    throw new ServersRequestError(
      "No se pudieron cargar los jugadores. Inténtalo de nuevo.",
      code ?? "UNKNOWN",
    );
  }

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new ServersRequestError(
      "El servidor devolvió una respuesta inválida.",
      "INVALID_RESPONSE",
    );
  }

  if (!Array.isArray(result)) {
    throw new ServersRequestError(
      "El servidor devolvió una respuesta inválida.",
      "INVALID_RESPONSE",
    );
  }

  const players = result.map(normalizePlayer);
  if (players.some((player) => player === null)) {
    throw new ServersRequestError(
      "El servidor devolvió una respuesta inválida.",
      "INVALID_RESPONSE",
    );
  }

  return players as ServerPlayer[];
}
