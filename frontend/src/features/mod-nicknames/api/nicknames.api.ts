import type { ModNickname, NicknameServer } from "../types";

export class NicknameRequestError extends Error {
  /**
   * Código HTTP de la respuesta, o `null` si ni siquiera hubo respuesta.
   * Sirve, por ejemplo, para reconocer el 409 de «ya está guardado».
   */
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "NicknameRequestError";
    this.status = status;
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** El mensaje del backend suele ser el que le sirve al usuario. */
async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (isRecord(body) && typeof body.error === "string" && body.error.trim()) {
      return body.error.trim();
    }

    return fallback;
  } catch {
    return fallback;
  }
}

function normalizeNickname(value: unknown): ModNickname | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "number" || !Number.isInteger(value.id)) return null;
  if (typeof value.nickname !== "string" || value.nickname.trim() === "") {
    return null;
  }

  return {
    id: value.id,
    nickname: value.nickname,
    found: value.found === true,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
  };
}

/** Los nicks guardados de la cuenta, del último guardado al primero. */
export async function getNicknames(
  signal?: AbortSignal,
): Promise<ModNickname[]> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/mod/nicknames`, {
      credentials: "include",
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new NicknameRequestError(
      "No se pudo conectar con el servidor. Inténtalo de nuevo.",
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new NicknameRequestError(
        "Tu sesión expiró. Inicia sesión de nuevo.",
        response.status,
      );
    }

    throw new NicknameRequestError(
      await readError(response, "No se pudieron cargar los nicks."),
      response.status,
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new NicknameRequestError("El servidor devolvió una respuesta inválida.");
  }

  if (!Array.isArray(payload)) {
    throw new NicknameRequestError("El servidor devolvió una respuesta inválida.");
  }

  return payload
    .map(normalizeNickname)
    .filter((nickname): nickname is ModNickname => nickname !== null);
}

/** Guarda un nick en la cuenta. */
export async function createNickname(nickname: string): Promise<ModNickname> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/mod/nicknames`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nickname }),
    });
  } catch {
    throw new NicknameRequestError(
      "No se pudo conectar con el servidor. Inténtalo de nuevo.",
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new NicknameRequestError(
        "Tu sesión expiró. Inicia sesión de nuevo.",
        response.status,
      );
    }

    throw new NicknameRequestError(
      await readError(response, "No se pudo guardar el nick."),
      response.status,
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new NicknameRequestError("El servidor devolvió una respuesta inválida.");
  }

  const created = normalizeNickname(payload);

  if (!created) {
    throw new NicknameRequestError("El servidor devolvió una respuesta inválida.");
  }

  return created;
}

/** Borra un nick de la cuenta. */
export async function deleteNickname(id: number): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/mod/nicknames/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch {
    throw new NicknameRequestError(
      "No se pudo conectar con el servidor. Inténtalo de nuevo.",
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new NicknameRequestError(
        "Tu sesión expiró. Inicia sesión de nuevo.",
        response.status,
      );
    }

    throw new NicknameRequestError(
      await readError(response, "No se pudo eliminar el nick."),
      response.status,
    );
  }
}

function readInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function normalizeNicknameServer(value: unknown): NicknameServer | null {
  if (!isRecord(value)) return null;

  const serverId = readInteger(value.serverId);
  const serverport = readInteger(value.serverport);
  const recordsFounds = readInteger(value.records_founds);

  if (
    serverId === null ||
    serverport === null ||
    recordsFounds === null ||
    typeof value.servername !== "string" ||
    typeof value.serverip !== "string"
  ) {
    return null;
  }

  return {
    serverId,
    servername: value.servername,
    serverip: value.serverip,
    serverport,
    rank: typeof value.rank === "string" ? value.rank : null,
    found: value.found === true,
    records_founds: recordsFounds,
    hashedPassword: value.hashedPassword === true,
  };
}

/**
 * En qué servidores guardados aparece ese nick, con su rango y sus registros.
 * La lista viene vacía cuando el nick todavía no se vio en ningún servidor.
 */
export async function getNicknameServers(
  nickname: string,
  signal?: AbortSignal,
): Promise<NicknameServer[]> {
  const query = new URLSearchParams({ name: nickname });
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/servers/players?${query}`, {
      credentials: "include",
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new NicknameRequestError(
      "No se pudo conectar con el servidor. Inténtalo de nuevo.",
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new NicknameRequestError(
        "Tu sesión expiró. Inicia sesión de nuevo.",
        response.status,
      );
    }

    throw new NicknameRequestError(
      await readError(response, "No se pudieron buscar los servidores."),
      response.status,
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new NicknameRequestError("El servidor devolvió una respuesta inválida.");
  }

  if (!Array.isArray(payload)) {
    throw new NicknameRequestError("El servidor devolvió una respuesta inválida.");
  }

  return payload
    .map(normalizeNicknameServer)
    .filter((server): server is NicknameServer => server !== null);
}
