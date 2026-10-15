import type { Request, Response } from "express";
import { findUsersByUsername } from "./find.service";

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