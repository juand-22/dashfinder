import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/apiKeyAuth";
import { recivePlayersSchema } from "./mod.schema";
import { recivePlayers, configurated, actualServer, configureMod, infoName, apiKey } from "./mod.service";
import { AuthRequest as AuthRequestToken } from "../../middlewares/auth.middleware";

export async function recivePlayersController(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const parsed = recivePlayersSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: "server y players son obligatorios" });
      return;
    }

    const result = await recivePlayers(parsed.data, userId);

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al recibir jugadores" });
  }
}

export async function configuratedController(
  req: AuthRequestToken,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const result = await configurated(userId);

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al obtener configuración" });
  }
}

export async function configureModController(
  req: AuthRequestToken,
  res: Response,
) {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const result = await configureMod(userId);

  res.json(result);
}


export async function actualServerController(
  req: AuthRequestToken,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const result = await actualServer(userId);

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al obtener servidor actual" });
  }
}

export async function infoNameController(
  req: AuthRequestToken,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const name = req.query.name as string;

    if (!userId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }
    if (!name) {
      res.status(400).json({ error: "Nombre es obligatorio" });
      return;
    }

    const result = await infoName(name);

    if (result.length === 0) {
      res.status(404).json({ error: "Nombre no encontrado" });
      return;
    }

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al obtener nombre" });
  }
}


export async function apiKeyController(
  req: AuthRequestToken,
  res: Response,
) {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const result = await apiKey(userId);

  res.json({ apiKey: result?.key });
}