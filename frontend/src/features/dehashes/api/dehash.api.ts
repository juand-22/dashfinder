import type {
  DehashAttempt,
  DehashCounts,
  DehashPage,
  DehashStatus,
} from "../types";

export class DehashRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DehashRequestError";
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

const STATUSES: DehashStatus[] = [
  "DEHASHING",
  "FOUND",
  "NOT_FOUND",
  "SERVER_ERROR",
  "INVALID",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function readError(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.error === "string" && value.error.trim()) {
    return value.error.trim();
  }

  return fallback;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Manda un hash a dehashear.
 *
 * El backend guarda el intento como `DEHASHING` y recién después escanea, así
 * que la respuesta puede tardar: quien lo llame no necesita esperarla, el
 * estado se sigue desde la página de dehashes.
 */
export async function sendDehash(
  hash: string,
  name: string | null,
): Promise<void> {
  const trimmedName = name?.trim() ?? "";
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/dehash`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        trimmedName ? { hash, name: trimmedName } : { hash },
      ),
    });
  } catch {
    throw new DehashRequestError(
      "No se pudo conectar con el servidor. Inténtalo de nuevo.",
    );
  }

  if (!response.ok) {
    const payload = await readJson(response);
    throw new DehashRequestError(
      readError(payload, "No se pudo mandar el hash a dehashear."),
    );
  }
}

function normalizeAttempt(value: unknown): DehashAttempt | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "number" || !Number.isInteger(value.id)) return null;
  if (typeof value.hash !== "string" || value.hash.trim() === "") return null;
  if (typeof value.status !== "string") return null;

  const status = value.status as DehashStatus;
  if (!STATUSES.includes(status)) return null;

  const name = value.name === undefined ? null : value.name;
  const result = value.result === undefined ? null : value.result;

  if (name !== null && typeof name !== "string") return null;
  if (result !== null && typeof result !== "string") return null;

  return {
    id: value.id,
    hash: value.hash,
    name: readNullableString(name),
    result: readNullableString(result),
    status,
  };
}

function normalizeAttempts(rows: unknown[]): DehashAttempt[] {
  return rows
    .map(normalizeAttempt)
    .filter((attempt): attempt is DehashAttempt => attempt !== null);
}

function emptyCounts(): DehashCounts {
  return {
    DEHASHING: 0,
    FOUND: 0,
    NOT_FOUND: 0,
    SERVER_ERROR: 0,
    INVALID: 0,
  };
}

/** Cuenta los estados de las filas que vinieron (para el backend viejo). */
function countsOf(attempts: DehashAttempt[]): DehashCounts {
  const counts = emptyCounts();

  for (const attempt of attempts) {
    counts[attempt.status] += 1;
  }

  return counts;
}

function readCounts(value: unknown): DehashCounts {
  if (!isRecord(value)) return emptyCounts();

  const counts = emptyCounts();

  for (const status of STATUSES) {
    const cantidad = value[status];

    if (typeof cantidad === "number" && Number.isFinite(cantidad)) {
      counts[status] = Math.max(0, Math.trunc(cantidad));
    }
  }

  return counts;
}

function readTotal(value: unknown, offset: number, rows: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }

  return offset + rows;
}

/**
 * Arma la página. Si el backend todavía contesta el array pelado (versión
 * vieja, sin paginar) se arma igual: el total queda en lo que se trajo.
 */
function normalizePage(payload: unknown, offset: number): DehashPage {
  if (Array.isArray(payload)) {
    const attempts = normalizeAttempts(payload);

    return {
      attempts,
      total: offset + attempts.length,
      counts: countsOf(attempts),
    };
  }

  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    throw new DehashRequestError("El servidor devolvió una respuesta inválida.");
  }

  const attempts = normalizeAttempts(payload.items);

  return {
    attempts,
    total: readTotal(payload.total, offset, attempts.length),
    counts: readCounts(payload.counts),
  };
}

/**
 * Trae una página del historial de dehashes, de la más nueva a la más vieja.
 *
 * `name` filtra por nombre (substring, sin distinguir mayúsculas) y lo resuelve
 * el backend: si se filtrara acá solo se buscaría dentro de la página.
 */
export async function getDehashes(
  params: { limit: number; offset?: number; name?: string },
  signal?: AbortSignal,
): Promise<DehashPage> {
  const offset = Math.max(0, Math.trunc(params.offset ?? 0));
  const search = new URLSearchParams({ limit: String(params.limit) });

  if (offset > 0) search.set("offset", String(offset));

  const name = params.name?.trim();
  if (name) search.set("name", name);

  let response: Response;

  try {
    response = await fetch(
      `${apiBaseUrl}/api/dehash/results?${search.toString()}`,
      {
        credentials: "include",
        signal,
      },
    );
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new DehashRequestError(
      "No se pudo conectar con el servidor. Inténtalo de nuevo.",
    );
  }

  if (!response.ok) {
    const payload = await readJson(response);
    throw new DehashRequestError(
      readError(payload, "No se pudieron cargar los dehashes."),
    );
  }

  return normalizePage(await readJson(response), offset);
}

/**
 * Todos los dehashes del usuario con ese nombre exacto (distingue mayúsculas),
 * de la tabla `dehash_results`. Lo usa el modal de Dash nicknames.
 */
export async function getDehashesByName(
  name: string,
  signal?: AbortSignal,
): Promise<DehashAttempt[]> {
  let response: Response;

  try {
    response = await fetch(
      `${apiBaseUrl}/api/dehash/by-name?name=${encodeURIComponent(name)}`,
      { credentials: "include", signal },
    );
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new DehashRequestError(
      "No se pudo conectar con el servidor. Inténtalo de nuevo.",
    );
  }

  if (!response.ok) {
    const payload = await readJson(response);
    throw new DehashRequestError(
      readError(payload, "No se pudieron cargar los dehashes del nick."),
    );
  }

  const payload = await readJson(response);

  if (!Array.isArray(payload)) {
    throw new DehashRequestError("El servidor devolvió una respuesta inválida.");
  }

  return normalizeAttempts(payload);
}
