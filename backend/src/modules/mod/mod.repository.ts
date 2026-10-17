import { QueryTypes } from "sequelize";
import { prisma } from "../../lib/prisma";
import { mcDb } from "../../lib/mc_db";
import type {
  FoundPlayerField,
  LastPlayerField,
  McUser,
  ServerPlayerField,
} from "./mod.types";

const MC_USER_COLUMNS = "name, ip, password, salt, serverip, server";

/* ----------------------------- Base externa MC ---------------------------- */

export async function findMcUsersByNick(nick: string): Promise<McUser[]> {
  const rows = await mcDb.query(
    `SELECT ${MC_USER_COLUMNS}
     FROM usuarios
     WHERE name = :nick`,
    {
      replacements: { nick },
      type: QueryTypes.SELECT,
    },
  );

  return rows as McUser[];
}

export async function findMcUserByName(name: string): Promise<McUser[]> {
  const rows = await mcDb.query(
    `SELECT ${MC_USER_COLUMNS}
     FROM usuarios
     WHERE name = :name`,
    {
      replacements: { name },
      type: QueryTypes.SELECT,
    },
  );

  return rows as McUser[];
}

/* --------------------------------- Activity -------------------------------- */

export function findActivityByUser(userId: number) {
  return prisma.activity.findUnique({ where: { userId } });
}

export function createActivity(
  userId: number,
  serverip: string,
  lastDateRequest: Date,
) {
  return prisma.activity.create({
    data: { userId, serverip, lastDateRequest },
  });
}

export function updateActivity(
  userId: number,
  serverip: string,
  lastDateRequest: Date,
) {
  return prisma.activity.update({
    where: { userId },
    data: { serverip, lastDateRequest },
  });
}

export function deleteLastPlayers(activityId: number) {
  return prisma.activiteLastPlayers.deleteMany({ where: { activityId } });
}

export function createLastPlayers(
  activityId: number,
  players: LastPlayerField[],
) {
  return prisma.activiteLastPlayers.createMany({
    data: players.map((player) => ({ activityId, ...player })),
  });
}

export function deleteLastFoundPlayers(activityId: number) {
  return prisma.activityLastFoundPlayers.deleteMany({ where: { activityId } });
}

export function createLastFoundPlayers(
  activityId: number,
  players: FoundPlayerField[],
) {
  return prisma.activityLastFoundPlayers.createMany({
    data: players.map((player) => ({ activityId, ...player })),
  });
}

/* --------------------------------- Servers --------------------------------- */

export function findServerByUserAndName(userId: number, name: string) {
  return prisma.servers.findFirst({ where: { userId, name } });
}

export function createServerWithPlayers(
  userId: number,
  name: string,
  players: ServerPlayerField[],
) {
  return prisma.servers.create({
    data: {
      userId,
      name,
      ip: name,
      port: 25565,
      players: { create: players },
    },
  });
}

export function listServerPlayerNames(serverId: number, userId: number) {
  return prisma.playerServers.findMany({
    where: { serverId, server: { userId } },
    select: { name: true },
  });
}

export function createServerPlayers(
  serverId: number,
  players: ServerPlayerField[],
) {
  return prisma.playerServers.createMany({
    data: players.map((player) => ({ serverId, ...player })),
  });
}

/* ---------------------------------- User ----------------------------------- */

export async function findUserModConfigurated(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { modConfigurated: true },
  });

  return { modConfigurated: user?.modConfigurated ?? false };
}

export async function configureMod(userId: number) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { modConfigurated: true },
    select: { username: true },
  });

  return { message: "Mod configurado", username: updated.username };
}

export async function findActivityWithLastPlayers(userId: number) {
  return prisma.activity.findFirst({
    where: { userId },
    omit: { id: true, userId: true, createdAt: true },
    include: { lastPlayers: {
      select: { name: true, rank: true, found: true, records_founds: true },
    }},
  });
}

export async function findApiKey(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { key: true },
  });
}
