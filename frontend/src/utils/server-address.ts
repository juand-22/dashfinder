/**
 * Devuelve el host de una dirección de servidor, quitando el puerto si viene
 * incluido (ej: "mc.pene.ne:25565" -> "mc.pene.ne", "[::1]:25565" -> "::1").
 *
 * Util reutilizable por cualquier feature que consulte servidores de Minecraft.
 */
export function stripServerPort(address: string) {
  const trimmed = address.trim();
  if (!trimmed) return "";

  const bracketed = trimmed.match(/^\[([^\]]+)\](?::\d+)?$/);
  if (bracketed) return bracketed[1];

  const hostWithPort = trimmed.match(/^([^:]+):\d+$/);
  if (hostWithPort) return hostWithPort[1];

  return trimmed;
}
