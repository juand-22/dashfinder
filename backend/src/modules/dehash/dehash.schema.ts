import { z } from "zod";


export const dehashBodySchema = z.strictObject({
    hash: z
        .string({
            error: "Mandá el hash a dehashear en el campo `hash`.",
        })
        .trim()
        .min(1, "El hash no puede estar vacío."),
    name: z
        .string({ error: "El `name` tiene que ser texto." })
        .trim()
        .max(100, "El `name` no puede tener más de 100 caracteres.")
        .optional(),
});

export type DehashBody = z.infer<typeof dehashBodySchema>;


export const dehashServiceResponseSchema = z.object({
    hash: z.string(),
    found: z.boolean(),
    message: z.string(),
    password: z.string().nullish(),
    algorithm: z.string().nullish(),
    kind: z.string(),
    recipe: z.string().nullish(),
    salt: z.string().nullish(),
    candidates: z.number().int().nonnegative(),
    elapsed: z.number().nonnegative(),
    tolerant: z.boolean().default(false),
    missing_position: z.number().int().positive().nullish(),
    missing_char: z.string().nullish(),
});


export const dehashHistoryQuerySchema = z.object({
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .catch(100)
        .transform((limite) => Math.min(limite, 500)),
    offset: z.coerce.number().int().min(0).catch(0),
    name: z
        .string()
        .trim()
        .max(100)
        .optional()
        .catch(undefined)
        .transform((nombre) => (nombre ? nombre : undefined)),
});

export type DehashHistoryQuery = z.infer<typeof dehashHistoryQuerySchema>;
