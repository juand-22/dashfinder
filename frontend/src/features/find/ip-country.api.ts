export type IpCountry = {
  countryCode: string;
  country: string;
};

export class IpCountryRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IpCountryRequestError";
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export async function findCountryByIp(
  ip: string,
  signal: AbortSignal,
): Promise<IpCountry | null> {
  let response: Response;

  try {
    response = await fetch(
      `${apiBaseUrl}/api/find/ip-country?ip=${encodeURIComponent(ip)}`,
      { credentials: "include", signal },
    );
  } catch (error) {
    if (signal.aborted) throw error;
    throw new IpCountryRequestError("No se pudo consultar el país de la dirección IP.");
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new IpCountryRequestError("Tu sesión expiró. Inicia sesión de nuevo.");
    }
    throw new IpCountryRequestError("No se pudo consultar el país de la dirección IP.");
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new IpCountryRequestError("El servidor devolvió una respuesta inválida.");
  }

  if (result === null) return null;
  if (
    typeof result !== "object" ||
    !("countryCode" in result) ||
    typeof result.countryCode !== "string" ||
    !/^[A-Z]{2}$/.test(result.countryCode) ||
    !("country" in result) ||
    typeof result.country !== "string"
  ) {
    throw new IpCountryRequestError("El servidor devolvió una respuesta inválida.");
  }

  return { countryCode: result.countryCode, country: result.country };
}
