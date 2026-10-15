export type FindRecord = {
  name: string | null;
  ip: string | null;
  password: string | null;
  salt: string | null;
  serverip: string | null;
  server: string | null;
};

export class FindRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FindRequestError";
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

function normalizeFindRecord(value: unknown): FindRecord | null {
  if (typeof value !== "object" || value === null) return null;

  const record = value as Record<string, unknown>;
  const fields = ["name", "ip", "password", "salt", "serverip", "server"] as const;
  if (
    fields.some(
      (field) =>
        record[field] !== undefined &&
        record[field] !== null &&
        typeof record[field] !== "string",
    )
  ) {
    return null;
  }

  const getField = (field: (typeof fields)[number]) =>
    typeof record[field] === "string" ? record[field] : null;

  return {
    name: getField("name"),
    ip: getField("ip"),
    password: getField("password"),
    salt: getField("salt"),
    serverip: getField("serverip"),
    server: getField("server"),
  };
}

export async function searchUsers(username: string): Promise<FindRecord[]> {
  let response: Response;

  try {
    response = await fetch(
      `${apiBaseUrl}/api/find/search?username=${encodeURIComponent(username)}`,
      { credentials: "include" },
    );
  } catch {
    throw new FindRequestError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new FindRequestError("Tu sesión expiró. Inicia sesión de nuevo.");
    }
    if (response.status === 400) {
      throw new FindRequestError("Escribe un nombre de usuario válido.");
    }
    throw new FindRequestError("No se pudo completar la búsqueda. Inténtalo de nuevo.");
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new FindRequestError("El servidor devolvió una respuesta inválida.");
  }

  const records: FindRecord[] = [];
  const rows = Array.isArray(result) ? result : [result];
  for (const item of rows) {
    const record = normalizeFindRecord(item);
    if (!record) {
      throw new FindRequestError("El servidor devolvió una respuesta inválida.");
    }
    records.push(record);
  }

  return records;
}
