import type { Request, Response } from "express";
import { register, login } from "./auth.service";

export async function registerController(req: Request, res: Response) {
  try {
    const resultado = await register(req.body);

    return res.status(201).json(resultado);
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_ALREADY_EXISTS") {
      return res.status(409).json({
        error: "El username ya está registrado"
      });
    }

    console.error(error);

    return res.status(500).json({
      error: "Error al conectar con el servidor"
    });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const resultado = await login(req.body);

    return res.status(200).json(resultado);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        error: "Usuario o contraseña incorrectos"
      });
    }

    console.error(error);

    return res.status(500).json({
      error: "Error interno del servidor"
    });
  }
}