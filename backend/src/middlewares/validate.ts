import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validate(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const errores = z.flattenError(resultado.error);

      return res.status(400).json({
        error: "Datos inválidos",
        detalles: errores.fieldErrors
      });
    }

    req.body = resultado.data;
    next();
  };
}