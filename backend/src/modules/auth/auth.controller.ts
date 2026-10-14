import type { Request, Response } from "express";
import { register, login } from "./auth.service";
import env from "../../config/env";
import { AuthRequest } from "../../middlewares/auth.middleware";

export async function registerController(req: Request, res: Response) {
  try {
    const { user, token } = await register(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    return res.status(201).json({ user });
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_ALREADY_EXISTS") {
      return res.status(409).json({ error: "El username ya está registrado" });
    }

    console.error(error);
    return res.status(500).json({ error: "Error interno" });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const { user, token } = await login(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    console.error(error);
    return res.status(500).json({ error: "Error interno" });
  }
}


export async function meController(req: AuthRequest, res: Response) {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ error: "No autenticado" });
    }

    return res.json({ user });
}