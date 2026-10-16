import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export interface AuthRequest extends Request {
  userId?: number;
}

export async function apiKeyAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const key = req.headers["x-api-key"];

    if (typeof key !== "string" || !key) {
      res.status(401).json({ error: "Key requerida" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { key },
      select: { id: true },
    });

    if (!user) {
      res.status(401).json({ error: "Key inválida" });
      return;
    }

    req.userId = user.id;

    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al validar la key" });
  }
}