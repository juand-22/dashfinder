import type { DehashCounts, DehashStatus } from "../types";

export const DEHASH_STATUS_LABELS: Record<DehashStatus, string> = {
  DEHASHING: "Dehasheando",
  FOUND: "Encontrada",
  NOT_FOUND: "Sin resultado",
  SERVER_ERROR: "Error del servidor",
  INVALID: "Hash inválido",
};

/** Sufijo de la clase CSS de cada estado (`.dehash-status.is-found`, etc.). */
export const DEHASH_STATUS_SLUGS: Record<DehashStatus, string> = {
  DEHASHING: "dehashing",
  FOUND: "found",
  NOT_FOUND: "not-found",
  SERVER_ERROR: "server-error",
  INVALID: "invalid",
};

/**
 * Arma el valor que se manda a dehashear a partir de un registro.
 *
 * - Si la columna `salt` está vacía, la contraseña ya trae todo junto: se manda tal cual.
 * - Si hay `salt` pero la contraseña ya la tiene adentro (`ALGO$sal$hash`), se manda tal cual.
 * - Si hay `salt` y no está dentro de la contraseña, se mandan juntos en un solo string
 *   (`hash:sal`). El motor separa solo el hash de la sal y deduce el orden, así que
 *   alcanza con mandarlo una vez.
 */
export function buildDehashValue(record: {
  password: string | null;
  salt: string | null;
}): string | null {
  const password = record.password?.trim() ?? "";

  if (!password) return null;

  const salt = record.salt?.trim() ?? "";

  if (!salt) return password;
  if (password.toLowerCase().includes(salt.toLowerCase())) return password;

  return `${password}:${salt}`;
}

/** Los estados que tiene sentido reintentar (mandar el mismo hash otra vez). */
export function canRetryDehash(status: DehashStatus): boolean {
  return status === "NOT_FOUND" || status === "SERVER_ERROR";
}

/** El hash completo no entra en la tarjeta: se muestra recortado. */
export function shortenHash(hash: string): string {
  return hash.length <= 34 ? hash : `${hash.slice(0, 18)}…${hash.slice(-10)}`;
}

/** El resumen en cero, para cuando todavía no se cargó el historial. */
export const EMPTY_DEHASH_COUNTS: DehashCounts = {
  DEHASHING: 0,
  FOUND: 0,
  NOT_FOUND: 0,
  SERVER_ERROR: 0,
  INVALID: 0,
};

/** Cuántos intentos hay en todo el historial, sumando el resumen por estado. */
export function countDehashes(counts: DehashCounts): number {
  return Object.values(counts).reduce((total, cantidad) => total + cantidad, 0);
}
