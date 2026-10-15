import { mcDb } from "../../lib/mc_db";
import { QueryTypes } from "sequelize";

export type FindRecord = {
  name: string | null;
  ip: string | null;
  password: string | null;
  salt: string | null;
  serverip: string | null;
  server: string | null;
};

export async function findUsersByUsername(username: string): Promise<FindRecord[]> {
  return mcDb.query<FindRecord>(
    `SELECT name, ip, password, salt, serverip, server
     FROM usuarios
     WHERE name = :player`,
    {
      replacements: { player: username },
      type: QueryTypes.SELECT,
    },
  );
}