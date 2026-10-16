import { prisma } from "../../lib/prisma";
import { mcDb } from "../../lib/mc_db";
import { QueryTypes } from "sequelize";

export type RecivePlayers = {
  server: string;
  players: {
    nick: string;
    rank?: string | null;
  }[];
};

type McUser = {
  name: string;
  ip: string | null;
  password: string | null;
  salt: string | null;
  serverip: string | null;
  server: string | null;
};

async function findMcUsers(nick: string): Promise<McUser[]> {
  const rows = await mcDb.query(
    `SELECT name, ip, password, salt, serverip, server
     FROM usuarios
     WHERE name = :nick`,
    {
      replacements: { nick },
      type: QueryTypes.SELECT,
    }
  );

  return rows as McUser[];
}

export async function recivePlayers(
  data: RecivePlayers,
  userId: number
) {
  const now = new Date();

  // 1. Crear o actualizar la última actividad del usuario
  let activity = await prisma.activity.findUnique({
    where: { userId },
  });

  if (!activity) {
    activity = await prisma.activity.create({
      data: {
        userId,
        serverip: data.server,
        lastDateRequest: now,
      },
    });
  } else {
    activity = await prisma.activity.update({
      where: { userId },
      data: {
        serverip: data.server,
        lastDateRequest: now,
      },
    });
  }

  // 2. Consultar cada nick en la base externa
  const mcResults = new Map<string, McUser[]>();

  for (const player of data.players) {
    const results = await findMcUsers(player.nick);
    mcResults.set(player.nick, results);
  }

  // 3. Reemplazar los últimos jugadores enviados
  await prisma.activiteLastPlayers.deleteMany({
    where: { activityId: activity.id },
  });

  if (data.players.length > 0) {
    await prisma.activiteLastPlayers.createMany({
      data: data.players.map((player) => {
        const results = mcResults.get(player.nick) ?? [];

        return {
          activityId: activity.id,
          name: player.nick,
          rank: player.rank ?? "",
          found: results.length > 0,
        };
      }),
    });
  }

  // 4. Reemplazar los últimos jugadores encontrados
  await prisma.activityLastFoundPlayers.deleteMany({
    where: { activityId: activity.id },
  });

  if (data.players.length > 0) {
    const activityFoundPlayers = data.players.flatMap((player) => {
      const results = mcResults.get(player.nick) ?? [];

      if (results.length === 0) {
        return [
          {
            activityId: activity.id,
            name: player.nick,
            rank: player.rank ?? "",
            found: false,
            ip: null,
            password: null,
            salt: null,
            serverip: null,
            servername: null,
          },
        ];
      }

      return results.map((result) => ({
        activityId: activity.id,
        name: player.nick,
        rank: player.rank ?? "",
        found: true,
        ip: result.ip ?? null,
        password: result.password ?? null,
        salt: result.salt ?? null,
        serverip: result.serverip ?? null,
        servername: result.server ?? null,
      }));
    });

    await prisma.activityLastFoundPlayers.createMany({
      data: activityFoundPlayers,
    });
  }

  // 5. Servidor del usuario
  const existUserServer = await prisma.servers.findFirst({
    where: {
      userId,
      name: data.server,
    },
  });

  if (!existUserServer) {
    await prisma.servers.create({
      data: {
        userId,
        name: data.server,
        ip: data.server,
        port: 25565,
        players: {
          create: data.players.map((player) => {
            const results = mcResults.get(player.nick) ?? [];
            const found = results[0];

            return {
              name: player.nick,
              rank: player.rank ?? null,
              found: Boolean(found),
              ip: found?.ip ?? null,
              password: found?.password ?? null,
              salt: found?.salt ?? null,
              serverip: found?.serverip ?? null,
              servername: found?.server ?? null,
            };
          }),
        },
      },
    });

    return { message: "Datos enviados" };
  }

  // 6. Guardar solo jugadores nuevos en el servidor existente
  const existingPlayers = await prisma.playerServers.findMany({
    where: {
      serverId: existUserServer.id,
      server: { userId },
    },
    select: { name: true },
  });

  const existingNames = new Set(
    existingPlayers.map((player) => player.name)
  );

  const playersToCreate = data.players.filter(
    (player) => !existingNames.has(player.nick)
  );

  if (playersToCreate.length > 0) {
    await prisma.playerServers.createMany({
      data: playersToCreate.map((player) => {
        const results = mcResults.get(player.nick) ?? [];
        const found = results[0];

        return {
          serverId: existUserServer.id,
          name: player.nick,
          rank: player.rank ?? null,
          found: Boolean(found),
          ip: found?.ip ?? null,
          password: found?.password ?? null,
          salt: found?.salt ?? null,
          serverip: found?.serverip ?? null,
          servername: found?.server ?? null,
        };
      }),
    });
  }

  return { message: "Datos enviados" };
}


export async function configurated(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { modConfigurated: true },
  });

  return user?.modConfigurated ?? false;
}

export async function actualServer(userId: number) {
  const activity = await prisma.activity.findFirst({
    where: { userId },
    include: {
      lastPlayers: true,
    },
  });

  return activity;
}

export async function infoName(name: string) {
  const rows = await mcDb.query(
    `SELECT name, ip, password, salt, serverip, server
     FROM usuarios
     WHERE name = :name
     LIMIT 1`,
    {
      replacements: { name },
      type: QueryTypes.SELECT,
    }
  );

  const user = rows[0] as McUser | undefined;

  return user ?? null;
}

