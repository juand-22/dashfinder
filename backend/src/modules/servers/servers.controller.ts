import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import { listServers, listPlayers, findNicknameServers } from "./servers.service";
import { ServersErrors, sendServersError } from "./servers.errors";

export async function listServersController(req: AuthRequest, res: Response) {
    const userId = req.user?.userId;

    if (!userId) {
        return sendServersError(res, ServersErrors.unauthorized());
    }

    try {
        const servers = await listServers(userId);
        return res.json(servers);
    } catch (error) {
        return sendServersError(res, error);
    }
}


export async function listPlayersController(req: AuthRequest, res: Response) {
    const userId = req.user?.userId;
    const serverId = Number(req.params.serverId);

    if (!userId) {
        return sendServersError(res, ServersErrors.unauthorized());
    }

    if (!Number.isInteger(serverId) || serverId <= 0) {
        return sendServersError(res, ServersErrors.invalidServerId());
    }

    try {
        const players = await listPlayers(serverId, userId);
        return res.json(players);
    } catch (error) {
        return sendServersError(res, error);
    }
}

export async function listNicknameServersController(
    req: AuthRequest,
    res: Response,
) {
    const userId = req.user?.userId;
    const name = typeof req.query.name === "string" ? req.query.name.trim() : "";

    if (!userId) {
        return sendServersError(res, ServersErrors.unauthorized());
    }

    if (!name) {
        return sendServersError(res, ServersErrors.invalidNickname());
    }

    try {
        const servers = await findNicknameServers(name, userId);
        return res.json(servers);
    } catch (error) {
        return sendServersError(res, error);
    }
}
