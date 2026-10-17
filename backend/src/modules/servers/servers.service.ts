import { prisma } from "../../lib/prisma";
import { ServersErrors } from "./servers.errors";

type PlayerStats = { total: number; founds: number };

export async function listServers(userId: number) {
    const servers = await prisma.servers.findMany({
        where: { userId },
        select: { id: true, name: true, ip: true, port: true },
    });

    if (servers.length === 0) {
        throw ServersErrors.serversNotFound();
    }

    const grouped = await prisma.playerServers.groupBy({
        by: ["serverId", "found"],
        where: { serverId: { in: servers.map((server) => server.id) } },
        _count: { _all: true },
    });

    const stats = new Map<number, PlayerStats>();

    for (const row of grouped) {
        const entry = stats.get(row.serverId) ?? { total: 0, founds: 0 };
        entry.total += row._count._all;

        if (row.found) {
            entry.founds += row._count._all;
        }

        stats.set(row.serverId, entry);
    }

    return servers.map((server) => {
        const { total, founds } = stats.get(server.id) ?? { total: 0, founds: 0 };

        return {
            id: server.id,
            name: server.name,
            ip: server.ip,
            port: server.port,
            players_total: total,
            player_founds: founds,
            players_not_founds: total - founds,
        };
    });
}


export async function listPlayers(serverId: number, userId: number) {
    // El dueño se valida dentro de la misma query: si el servidor no existe
    // o no le pertenece al usuario, no se consultan sus jugadores.
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
