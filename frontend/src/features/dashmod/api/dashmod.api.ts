import type { ModActivity, ModPlayer, PlayerInfo } from "../types";

export class ModRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModRequestError";
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function fetchResponse(
  path: string,
  signal?: AbortSignal,
): Promise<Response> {
  try {
    return await fetch(`${apiBaseUrl}${path}`, {
      credentials: "include",
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ModRequestError(
      "No se pudo conectar con el servidor. Inténtalo de nuevo.",
    );
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ModRequestError("El servidor devolvió una respuesta inválida.");
  }
}

async function requestJson(path: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetchResponse(path, signal);

  if (!response.ok) {
    if (response.status === 401) {
      throw new ModRequestError("Tu sesión expiró. Inicia sesión de nuevo.");
    }
    throw new ModRequestError(
      "No se pudo cargar el estado del mod. Inténtalo de nuevo.",
    );
  }

  return readJson(response);
}

export async function getModConfigurated(signal?: AbortSignal): Promise<boolean> {
  const result = await requestJson("/api/mod/configurated", signal);

  if (!isRecord(result) || typeof result.modConfigurated !== "boolean") {
    throw new ModRequestError("El servidor devolvió una respuesta inválida.");
  }

  return result.modConfigurated;
}

function normalizePlayer(value: unknown): ModPlayer | null {
  if (!isRecord(value)) return null;
  if (typeof value.name !== "string") return null;
  if (typeof value.found !== "boolean") return null;
  if (value.rank !== null && value.rank !== undefined && typeof value.rank !== "string") {
    return null;
  }

  return {
    name: value.name,
    rank: typeof value.rank === "string" ? value.rank : null,
    found: value.found,
  };
}

export async function getActualServer(
  signal?: AbortSignal,
): Promise<ModActivity | null> {
  const result = await requestJson("/api/mod/actual", signal);

  if (result === null) return null;

  if (
    !isRecord(result) ||
    typeof result.serverip !== "string" ||
    typeof result.lastDateRequest !== "string" ||
    !Array.isArray(result.lastPlayers)
  ) {
    throw new ModRequestError("El servidor devolvió una respuesta inválida.");
  }

  const players = result.lastPlayers.map(normalizePlayer);
  if (players.some((player) => player === null)) {
    throw new ModRequestError("El servidor devolvió una respuesta inválida.");
  }

  return {
    serverip: result.serverip,
    lastDateRequest: result.lastDateRequest,
    lastPlayers: players as ModPlayer[],
  };
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function normalizeInfo(value: unknown): PlayerInfo | null {
  if (!isRecord(value)) return null;
  if (value.name !== null && value.name !== undefined && typeof value.name !== "string") {
    return null;
  }

  return {
    name: readNullableString(value.name),
    ip: readNullableString(value.ip),
    password: readNullableString(value.password),
    salt: readNullableString(value.salt),
    serverip: readNullableString(value.serverip),
    server: readNullableString(value.server),
  };
}

export async function getPlayerInfo(
  name: string,
  signal?: AbortSignal,
): Promise<PlayerInfo[]> {
  const response = await fetchResponse(
    `/api/mod/info-name?name=${encodeURIComponent(name)}`,
    signal,
  );

  if (response.status === 404) return [];

  if (!response.ok) {
    if (response.status === 401) {
      throw new ModRequestError("Tu sesión expiró. Inicia sesión de nuevo.");
    }
    throw new ModRequestError(
      "No se pudo cargar la información del jugador. Inténtalo de nuevo.",
    );
  }

  const result = await readJson(response);

  if (!Array.isArray(result)) {
    throw new ModRequestError("El servidor devolvió una respuesta inválida.");
  }

  const infos = result.map(normalizeInfo);
  if (infos.some((info) => info === null)) {
    throw new ModRequestError("El servidor devolvió una respuesta inválida.");
  }

  return infos as PlayerInfo[];
}
