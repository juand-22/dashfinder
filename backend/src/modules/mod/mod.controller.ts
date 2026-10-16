import { recivePlayers } from "./mod.service";
import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/apiKeyAuth";

export type RecivePlayersRequest = AuthRequest & {
  body: {
    server: string;
    players: {
      nick: string;
      rank?: string | null;
    }[];
  };
};

export async function recivePlayersController(
  req: RecivePlayersRequest,
  res: Response
): Promise<void> {
  try {
    const { server, players } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    if (!server || !Array.isArray(players)) {
      res.status(400).json({
        error: "server y players son obligatorios",
      });
      return;
    }

    const result = await recivePlayers(
      { server, players },
      userId
    );

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al recibir jugadores" });
  }
}