import * as modRepository from "./mod.repository";
import type { RecivePlayersInput } from "./mod.schema";
import type {
  FoundPlayerField,
  LastPlayerField,
  McUser,
  ServerPlayerField,
} from "./mod.types";

async function upsertActivity(userId: number, serverip: string, now: Date) {
  const activity = await modRepository.findActivityByUser(userId);

  if (!activity) {
    return modRepository.createActivity(userId, serverip, now);
  }

  return modRepository.updateActivity(userId, serverip, now);
}

async function collectMcResults(players: RecivePlayersInput["players"]) {
  const mcResults = new Map<string, McUser[]>();

  for (const player of players) {
    const results = await modRepository.findMcUsersByNick(player.nick);
    mcResults.set(player.nick, results);
  }

  return mcResults;
}

function buildLastPlayerFields(
  players: RecivePlayersInput["players"],
  mcResults: Map<string, McUser[]>,
): LastPlayerField[] {
  return players.map((player) => {
    const results = mcResults.get(player.nick) ?? [];

    return {
      name: player.nick,
      rank: player.rank ?? "",
      found: results.length > 0,
    };
  });
}

function buildFoundPlayerFields(
  players: RecivePlayersInput["players"],
  mcResults: Map<string, McUser[]>,
): FoundPlayerField[] {
  return players.flatMap((player): FoundPlayerField[] => {
    const results = mcResults.get(player.nick) ?? [];

    if (results.length === 0) {
      return [
        {
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

    return results.map((result): FoundPlayerField => ({
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
}

function buildPlayerFields(
  players: RecivePlayersInput["players"],
  mcResults: Map<string, McUser[]>,
): ServerPlayerField[] {
  return players.map((player) => {
    const found = (mcResults.get(player.nick) ?? [])[0];

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
  });
}

export async function recivePlayers(data: RecivePlayersInput, userId: number) {
  const now = new Date();

  // 1. Crear o actualizar la última actividad del usuario
  const activity = await upsertActivity(userId, data.server, now);

  // 2. Consultar cada nick en la base externa
  const mcResults = await collectMcResults(data.players);

  // 3. Reemplazar los últimos jugadores enviados
  await modRepository.deleteLastPlayers(activity.id);

  if (data.players.length > 0) {
    await modRepository.createLastPlayers(
      activity.id,
      buildLastPlayerFields(data.players, mcResults),
    );
  }

  // 4. Reemplazar los últimos jugadores encontrados
  await modRepository.deleteLastFoundPlayers(activity.id);

  if (data.players.length > 0) {
    await modRepository.createLastFoundPlayers(
      activity.id,
      buildFoundPlayerFields(data.players, mcResults),
    );
  }

  // 5. Servidor del usuario
  const userServer = await modRepository.findServerByUserAndName(
    userId,
    data.server,
  );

  if (!userServer) {
    await modRepository.createServerWithPlayers(
      userId,
      data.server,
      buildPlayerFields(data.players, mcResults),
    );

    return { message: "Datos enviados" };
  }

  // 6. Guardar solo jugadores nuevos en el servidor existente
  const existingPlayers = await modRepository.listServerPlayerNames(
    userServer.id,
    userId,
  );
  const existingNames = new Set(existingPlayers.map((player) => player.name));

  const playersToCreate = data.players.filter(
    (player) => !existingNames.has(player.nick),
  );

  if (playersToCreate.length > 0) {
    await modRepository.createServerPlayers(
      userServer.id,
      buildPlayerFields(playersToCreate, mcResults),
    );
  }

  return { message: "Datos enviados" };
}

export async function configurated(userId: number) {
  return modRepository.findUserModConfigurated(userId);
}

export async function configureMod(userId: number) {
  return modRepository.configureMod(userId);
}

export async function actualServer(userId: number) {
  return modRepository.findActivityWithLastPlayers(userId);
}

export async function infoName(name: string) {
  return modRepository.findMcUserByName(name);
}
