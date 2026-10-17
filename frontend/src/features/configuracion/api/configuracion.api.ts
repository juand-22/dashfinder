import { getModConfigurated } from "../../dashmod/api/dashmod.api";

export class ConfiguracionRequestError extends Error {
  readonly code: string;

  constructor(message: string, code = "UNKNOWN") {
    super(message);
    this.name = "ConfiguracionRequestError";
    this.code = code;
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function getApiKeyRequest(signal?: AbortSignal): Promise<string | null> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/mod/api-key`, {
      credentials: "include",
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ConfiguracionRequestError(
      "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      "NETWORK",
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new ConfiguracionRequestError(
        "Tu sesión expiró. Inicia sesión de nuevo.",
        "UNAUTHORIZED",
      );
    }
    throw new ConfiguracionRequestError(
      "No se pudo cargar tu API key. Inténtalo de nuevo.",
      "UNKNOWN",
    );
  }

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new ConfiguracionRequestError(
      "El servidor devolvió una respuesta inválida.",
      "INVALID_RESPONSE",
    );
  }

  if (!isRecord(result)) {
    throw new ConfiguracionRequestError(
      "El servidor devolvió una respuesta inválida.",
      "INVALID_RESPONSE",
    );
  }

  // El backend omite la key cuando la cuenta todavía no tiene una.
  if (result.apiKey === null || result.apiKey === undefined) return null;

  if (typeof result.apiKey !== "string") {
    throw new ConfiguracionRequestError(
      "El servidor devolvió una respuesta inválida.",
      "INVALID_RESPONSE",
    );
  }

  return result.apiKey;
}

export type ModCredentials = {
  apiKey: string | null;
  modConfigurated: boolean;
};

export async function getModCredentials(
  signal?: AbortSignal,
): Promise<ModCredentials> {
  const [apiKey, modConfigurated] = await Promise.all([
    getApiKeyRequest(signal),
    getModConfigurated(signal),
  ]);

  return { apiKey, modConfigurated };
}
