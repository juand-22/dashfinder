import { z } from "zod";

export const recivePlayersSchema = z.object({
  server: z.string().min(1),
  players: z.array(
    z.object({
      nick: z.string(),
      rank: z.string().nullish(),
    }),
  ),
});

export type RecivePlayersInput = z.infer<typeof recivePlayersSchema>;

export const nicknameBodySchema = z.strictObject({
  nickname: z
    .string({ error: "Mandá el nick en el campo `nickname`." })
    .trim()
    .min(1, "El nick no puede estar vacío.")
    .max(16, "El nick no puede tener más de 16 caracteres.")
    .regex(
      /^[A-Za-z0-9_]+$/,
      "El nick solo puede tener letras, números y `_`.",
    ),
  found: z.boolean({ error: "El `found` tiene que ser true o false." }).optional(),
});

export type NicknameBody = z.infer<typeof nicknameBodySchema>;

export const nicknameIdSchema = z.coerce.number().int().positive();

export type NicknameId = z.infer<typeof nicknameIdSchema>;
