import { QueryTypes } from "sequelize";
import { mcDb } from "../../lib/mc_db";
import type { FindRecord } from "./find.types";

export async function findUsersByUsername(
  username: string,
): Promise<FindRecord[]> {
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
