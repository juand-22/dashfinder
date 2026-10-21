import { prisma } from "../../lib/prisma";
import { ServersErrors } from "./servers.errors";

type PlayerStats = { total: number; founds: number; notHashed: number };

export async function listServers(userId: number) {
    const servers = await prisma.servers.findMany({
        where: { userId },
        select: { id: true, name: true, ip: true, port: true },
    });

    if (servers.length === 0) {
        throw ServersErrors.serversNotFound();
    }

    const serverIds = servers.map((server) => server.id);

    const grouped = await prisma.playerServers.groupBy({
        by: ["serverId", "found"],
        where: { serverId: { in: serverIds } },
        _count: { _all: true },
    });

    const notHashedRows = await prisma.playerServers.groupBy({
        by: ["serverId"],
        where: { serverId: { in: serverIds }, hashedPassword: true },
        _count: { _all: true },
    });

    const stats = new Map<number, PlayerStats>();

    for (const row of grouped) {
        const entry = stats.get(row.serverId) ?? {
            total: 0,
            founds: 0,
            notHashed: 0,
        };
        entry.total += row._count._all;

        if (row.found) {
            entry.founds += row._count._all;
        }

        stats.set(row.serverId, entry);
    }

    for (const row of notHashedRows) {
        const entry = stats.get(row.serverId) ?? {
            total: 0,
            founds: 0,
            notHashed: 0,
        };
        entry.notHashed = row._count._all;
        stats.set(row.serverId, entry);
    }

    return servers.map((server) => {
        const { total, founds, notHashed } = stats.get(server.id) ?? {
            total: 0,
            founds: 0,
            notHashed: 0,
        };

        return {
            id: server.id,
            name: server.name,
            ip: server.ip,
            port: server.port,
            players_total: total,
            player_founds: founds,
            players_not_hashed: notHashed,
        };
    });
}


export async function listPlayers(serverId: number, userId: number) {
    const server = await prisma.servers.findFirst({
        where: { id: serverId, userId },
        select: { name: true, ip: true, port: true },
    });

    if (!server) {
        throw ServersErrors.serverNotFound();
    }

    const players = await prisma.playerServers.findMany({
        where: { serverId },
        select: {
            name: true,
            rank: true,
            found: true,
            records_founds: true,
            hashedPassword: true,
        },
    });

    if (players.length === 0) {
        throw ServersErrors.playersNotFound();
    }

    return players.map((player) => ({
        ...player,
        servername: server.name,
        serverip: server.ip,
        serverport: server.port,
    }));
}

export type NicknameServer = {
    serverId: number;
    servername: string;
    serverip: string;
    serverport: number;
    rank: string | null;
    found: boolean;
    records_founds: number;
    hashedPassword: boolean;
};

export async function findNicknameServers(
    name: string,
    userId: number,
): Promise<NicknameServer[]> {
    const wanted = name.trim();

    const rows = await prisma.playerServers.findMany({
        where: {
            server: { userId },
            name: wanted,
        },
        select: {
            serverId: true,
            rank: true,
            found: true,
            records_founds: true,
            hashedPassword: true,
            server: { select: { name: true, ip: true, port: true } },
        },
        orderBy: { server: { name: "asc" } },
    });

    return rows.map((row) => ({
        serverId: row.serverId,
        servername: row.server.name,
        serverip: row.server.ip,
        serverport: row.server.port,
        rank: row.rank,
        found: row.found,
        records_founds: row.records_founds,
        hashedPassword: row.hashedPassword,
    }));
}
