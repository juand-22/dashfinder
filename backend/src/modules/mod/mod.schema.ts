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
