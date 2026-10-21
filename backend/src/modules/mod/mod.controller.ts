import type { Response } from "express";
import type { ZodError } from "zod";
import type { AuthRequest } from "../../middlewares/apiKeyAuth";
import {
  nicknameBodySchema,
  nicknameIdSchema,
  recivePlayersSchema,
} from "./mod.schema";
import { recivePlayers, configurated, actualServer, configureMod, infoName, apiKey, listNicknames, createNickname, deleteNickname } from "./mod.service";
import { AuthRequest as AuthRequestToken } from "../../middlewares/auth.middleware";

function mensajeDeNickname(error: ZodError): string {
  const issue = error.issues[0];

  if (!issue) {
    return "Mandá el nick en el campo `nickname`.";
  }

  if (issue.code === "unrecognized_keys") {
    const sobran = issue.keys.map((clave) => `\`${clave}\``).join(", ");

    return `Solo se puede mandar \`nickname\` y \`found\`: sobra ${sobran}.`;
  }

  return issue.message;
}

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


export async function nicknamesController(
  req: AuthRequestToken,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    res.json(await listNicknames(userId));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al obtener los nicks" });
  }
}

export async function nicknamesForModController(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Key requerida" });
      return;
    }

    res.json(await listNicknames(userId));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al obtener los nicks" });
  }
}

export async function createNicknameController(
  req: AuthRequestToken,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const parsed = nicknameBodySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: mensajeDeNickname(parsed.error) });
      return;
    }

    const created = await createNickname(userId, parsed.data);

    if (!created) {
      res.status(409).json({ error: "Ese nick ya está guardado." });
      return;
    }

    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al guardar el nick" });
  }
}

export async function deleteNicknameController(
  req: AuthRequestToken,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const parsed = nicknameIdSchema.safeParse(req.params.id);

    if (!parsed.success) {
      res.status(400).json({ error: "El id del nick no es válido." });
      return;
    }

    const deleted = await deleteNickname(userId, parsed.data);

    if (!deleted) {
      res.status(404).json({ error: "Ese nick no existe o no es tuyo." });
      return;
    }

    res.json({ message: "Nick eliminado" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al eliminar el nick" });
  }
}