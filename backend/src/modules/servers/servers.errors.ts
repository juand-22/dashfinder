import type { Response } from "express";

export class ServersError extends Error {
    readonly status: number;
    readonly code: string;

    constructor(code: string, status: number, message: string) {
        super(message);
        this.name = "ServersError";
        this.code = code;
        this.status = status;
    }
}

export const ServersErrors = {
    unauthorized: () =>
        new ServersError(
            "UNAUTHORIZED",
            401,
            "No autenticado. Iniciá sesión de nuevo.",
        ),
    invalidServerId: () =>
        new ServersError(
            "INVALID_SERVER_ID",
            400,
            "El id del servidor no es válido.",
        ),
    invalidNickname: () =>
        new ServersError(
            "INVALID_NICKNAME",
            400,
            "Mandá el nick en `name`.",
        ),
    serversNotFound: () =>
        new ServersError(
            "SERVERS_NOT_FOUND",
            404,
            "Todavía no tenés servidores guardados.",
        ),
    serverNotFound: () =>
        new ServersError(
            "SERVER_NOT_FOUND",
            404,
            "El servidor no existe o no te pertenece.",
        ),
    playersNotFound: () =>
        new ServersError(
            "PLAYERS_NOT_FOUND",
            404,
            "Este servidor todavía no tiene jugadores guardados.",
        ),
};

export function sendServersError(res: Response, error: unknown) {
    if (error instanceof ServersError) {
        return res.status(error.status).json({
            error: error.message,
            code: error.code,
        });
    }

    console.error(error);
    return res
        .status(500)
        .json({ error: "Error inesperado al procesar la solicitud." });
}
