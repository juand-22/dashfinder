import type { Request, Response } from "express";
import {
  findCountryByIp,
  findMinecraftProfile,
  findUsersByUsername,
  getMinecraftServerStatus,
} from "./find.service";
import {
  findUserQuerySchema,
  ipCountryQuerySchema,
  minecraftProfileQuerySchema,
  serverStatusQuerySchema,
} from "./find.schema";

export async function findUserController(req: Request, res: Response) {
  const parsed = findUserQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "El usuario es requerido",
    });
  }

  try {
    const users = await findUsersByUsername(parsed.data.username);
    return res.json(users);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error al buscar el usuario",
    });
  }
}

export async function findMinecraftProfileController(req: Request, res: Response) {
  const parsed = minecraftProfileQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Escribe un nombre de Minecraft válido (3-16 caracteres, letras, números o _).",
    });
  }

  try {
    const profile = await findMinecraftProfile(parsed.data.username);
    return res.json(profile);
  } catch (error) {
    console.error(error);
    return res.status(502).json({
      error: "No se pudo consultar el perfil de Minecraft. Inténtalo de nuevo.",
    });
  }
}

export async function minecraftServerStatusController(req: Request, res: Response) {
  const parsed = serverStatusQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "La dirección del servidor de Minecraft no es válida.",
    });
  }

  try {
    const status = await getMinecraftServerStatus(parsed.data.address);
    return res.json(status);
  } catch (error) {
    console.error(error);
    return res.status(502).json({
      error: "No se pudo consultar el estado del servidor. Inténtalo de nuevo.",
    });
  }
}

export async function ipCountryController(req: Request, res: Response) {
  const parsed = ipCountryQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: "La dirección IP no es válida." });
  }

  try {
    const country = await findCountryByIp(parsed.data.ip);
    return res.json(country);
  } catch (error) {
    console.error(error);
    return res.status(502).json({
      error: "No se pudo consultar el país de la dirección IP.",
    });
  }
}
