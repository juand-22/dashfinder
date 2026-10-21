import type { Response } from "express";
import type { DehashStatus } from "./dehash.types";

export class DehashError extends Error {
    readonly status: number;
    readonly code: string;
    readonly attemptId: number | null;
    readonly dehashStatus: DehashStatus | null;

    constructor(
        code: string,
        status: number,
        message: string,
        intento?: { id: number; status: DehashStatus },
    ) {
        super(message);
        this.name = "DehashError";
        this.code = code;
        this.status = status;
        this.attemptId = intento?.id ?? null;
        this.dehashStatus = intento?.status ?? null;
    }
}

export const DehashErrors = {
    unauthorized: () =>
        new DehashError(
            "UNAUTHORIZED",
            401,
            "No autenticado. Iniciá sesión de nuevo.",
        ),
    invalidHash: (message: string) =>
        new DehashError("INVALID_HASH", 400, message),
    invalidName: () =>
        new DehashError(
            "INVALID_NAME",
            400,
            "Mandá el nick en `name`.",
        ),
    unavailable: () =>
        new DehashError(
            "DEHASH_UNAVAILABLE",
            502,
            "No se pudo contactar al servicio de dehash. Fijate que esté corriendo el dehash-api.",
        ),
    timedOut: () =>
        new DehashError(
            "DEHASH_TIMEOUT",
            504,
            "El dehash tardó demasiado y se cortó. Probá de nuevo en un rato.",
        ),
    invalidResponse: () =>
        new DehashError(
            "DEHASH_BAD_RESPONSE",
            502,
            "El servicio de dehash devolvió una respuesta inesperada.",
        ),

    conIntento: (
        error: unknown,
        id: number | null,
        status: DehashStatus,
    ): DehashError => {
        if (error instanceof DehashError) {
            return id === null
                ? error
                : new DehashError(error.code, error.status, error.message, {
                      id,
                      status,
                  });
        }

        return new DehashError(
            "DEHASH_ERROR",
            500,
            "Error inesperado al dehashear.",
            id === null ? undefined : { id, status },
        );
    },
};

export function sendDehashError(res: Response, error: unknown) {
    if (error instanceof DehashError) {
        return res.status(error.status).json({
            error: error.message,
            code: error.code,
            ...(error.attemptId !== null
                ? { id: error.attemptId, status: error.dehashStatus }
                : {}),
        });
    }

    console.error(error);
    return res.status(500).json({ error: "Error inesperado en el dehash." });
}
