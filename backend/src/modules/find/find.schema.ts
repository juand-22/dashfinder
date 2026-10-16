import { isIP } from "node:net";
import { z } from "zod";

const MINECRAFT_USERNAME_REGEX = /^[a-zA-Z0-9_]{3,16}$/;

const SERVER_ADDRESS_REGEX =
  /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?:\.(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?))*(?::\d{1,5})?$/;

function hasValidPort(address: string) {
  const portMatch = address.match(/:(\d+)$/);
  if (portMatch === null) return true;

  const port = Number(portMatch[1]);
  return port >= 1 && port <= 65535;
}

export const findUserQuerySchema = z.object({
  username: z.string().trim().min(1),
});

export const minecraftProfileQuerySchema = z.object({
  username: z.string().regex(MINECRAFT_USERNAME_REGEX),
});

export const serverStatusQuerySchema = z.object({
  address: z.string().max(253).regex(SERVER_ADDRESS_REGEX).refine(hasValidPort),
});

export const ipCountryQuerySchema = z.object({
  ip: z.string().refine((value) => isIP(value) !== 0),
});
