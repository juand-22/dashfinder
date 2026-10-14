import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "El username debe tener al menos 3 caracteres")
    .max(30, "El username es demasiado largo"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña es demasiado larga")
});

export const loginSchema = z.object({
  username: z.string().min(1, "El username es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;