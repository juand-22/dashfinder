import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";
import { prisma } from "../lib/prisma";

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    userId: number;
    username: string;
  };
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      userId: number;
      username: string;
    };

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

/**
 * Acepta la API key del mod (`x-api-key`) o la sesión del panel (cookie JWT).
 * El mod no tiene sesión, así que se identifica con la API key de su cuenta.
 */
export async function authenticateOrApiKey(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const key = req.headers["x-api-key"];

  if (typeof key === "string" && key) {
    try {
      const user = await prisma.user.findUnique({
        where: { key },
        select: { id: true, username: true },
      });

      if (!user) {
        res.status(401).json({ error: "Key inválida" });
        return;
      }

      req.userId = user.id;
      req.user = { userId: user.id, username: user.username };
      next();
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Error al validar la key" });
    }
    return;
  }

  authenticate(req, res, next);
}
