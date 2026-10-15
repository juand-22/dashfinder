import { isIP } from "node:net";
import type { Request, Response } from "express";
import {
  findCountryByIp,
  findMinecraftProfile,
  findUsersByUsername,
  getMinecraftServerStatus,
} from "./find.service";

export async function findUserController(req: Request, res: Response) {
  try {
    const queryUsername = req.query.username;

    if (typeof queryUsername !== "string" || !queryUsername.trim()) {
      return res.status(400).json({
        error: "El usuario es requerido"
      });
    }

    const users = await findUsersByUsername(queryUsername.trim());
    return res.json(users);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error al buscar el usuario"
    });
  }
}

export async function findMinecraftProfileController(req: Request, res: Response) {
  const queryUsername = req.query.username;

  if (
    typeof queryUsername !== "string" ||
    !/^[a-zA-Z0-9_]{3,16}$/.test(queryUsername)
  ) {
    return res.status(400).json({
      error: "Escribe un nombre de Minecraft válido (3-16 caracteres, letras, números o _).",
    });
  }

  try {
    const profile = await findMinecraftProfile(queryUsername);
    return res.json(profile);
  } catch (error) {
    console.error(error);
    return res.status(502).json({
      error: "No se pudo consultar el perfil de Minecraft. Inténtalo de nuevo.",
    });
  }
}

export async function minecraftServerStatusController(req: Request, res: Response) {
  const queryAddress = req.query.address;
  const portMatch = typeof queryAddress === "string" ? queryAddress.match(/:(\d+)$/) : null;

  if (
    typeof queryAddress !== "string" ||
    queryAddress.length > 253 ||
    !/^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?:\.(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?))*(?::\d{1,5})?$/.test(
      queryAddress,
    ) ||
    (portMatch !== null &&
      (Number(portMatch[1]) < 1 || Number(portMatch[1]) > 65535))
  ) {
    return res.status(400).json({
      error: "La dirección del servidor de Minecraft no es válida.",
    });
  }

  try {
    const status = await getMinecraftServerStatus(queryAddress);
    return res.json(status);
  } catch (error) {
    console.error(error);
    return res.status(502).json({
      error: "No se pudo consultar el estado del servidor. Inténtalo de nuevo.",
    });
  }
}

export async function ipCountryController(req: Request, res: Response) {
  const ip = req.query.ip;
  if (typeof ip !== "string" || !isIP(ip)) {
    return res.status(400).json({ error: "La dirección IP no es válida." });
  }

  try {
    const country = await findCountryByIp(ip);
    return res.json(country);
  } catch (error) {
    console.error(error);
    return res.status(502).json({
      error: "No se pudo consultar el país de la dirección IP.",
    });
  }
}