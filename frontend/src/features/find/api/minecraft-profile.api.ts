import type { MinecraftProfile } from "../types";

export class MinecraftProfileRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MinecraftProfileRequestError";
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export async function findMinecraftProfile(
  username: string,
  signal: AbortSignal,
): Promise<MinecraftProfile | null> {
  let response: Response;

  try {
    response = await fetch(
      `${apiBaseUrl}/api/find/minecraft-profile?username=${encodeURIComponent(username)}`,
      { credentials: "include", signal },
    );
  } catch (error) {
    if (signal.aborted) throw error;
    throw new MinecraftProfileRequestError("No se pudo consultar el perfil de Minecraft.");
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new MinecraftProfileRequestError("Tu sesión expiró. Inicia sesión de nuevo.");
    }
    throw new MinecraftProfileRequestError("No se pudo consultar el perfil de Minecraft.");
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new MinecraftProfileRequestError("El servidor devolvió una respuesta inválida.");
  }

  if (result === null) return null;
  if (
    typeof result !== "object" ||
    !("id" in result) ||
    typeof result.id !== "string" ||
    !/^[a-f0-9]{32}$/i.test(result.id) ||
    !("name" in result) ||
    typeof result.name !== "string"
  ) {
    throw new MinecraftProfileRequestError("El servidor devolvió una respuesta inválida.");
  }

  return { id: result.id, name: result.name };
}
