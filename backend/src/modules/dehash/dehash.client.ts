import env from "../../config/env";
import { DehashErrors } from "./dehash.errors";
import { dehashServiceResponseSchema } from "./dehash.schema";
import type { DehashSearchResult } from "./dehash.types";


const DEHASH_TIMEOUT_MS = 45_000;


function dehashUrl(): string {
    const base = env.DEHASH_API.replace(/\/+$/, "");
    return `${base.replace(/\/\/localhost(?=[:/]|$)/, "//127.0.0.1")}/dehash`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function errorName(error: unknown): string {
    if (isRecord(error) && typeof error.name === "string") {
        return error.name;
    }

    return "";
}

export async function requestDehash(hash: string): Promise<DehashSearchResult> {
    let response: Response;

    try {
        response = await fetch(dehashUrl(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ hash }),
            signal: AbortSignal.timeout(DEHASH_TIMEOUT_MS),
        });
    } catch (error) {
        if (errorName(error) === "TimeoutError") {
            console.error(
                `El servicio de dehash tardó más de ${DEHASH_TIMEOUT_MS / 1000} s`,
            );
            throw DehashErrors.timedOut();
        }

        console.error("No se pudo contactar al servicio de dehash", error);
        throw DehashErrors.unavailable();
    }

    const raw: unknown = await response.json().catch(() => null);

    if (response.status === 400) {

        throw DehashErrors.invalidHash(
            isRecord(raw) && typeof raw.detail === "string"
                ? raw.detail
                : "El hash no es válido.",
        );
    }

    const parsed = dehashServiceResponseSchema.safeParse(raw);

    if (!response.ok || !parsed.success) {
        console.error(
            `Respuesta inesperada del servicio de dehash (HTTP ${response.status})`,
            parsed.success ? raw : parsed.error,
        );
        throw DehashErrors.invalidResponse();
    }

    return {
        found: parsed.data.found,
        message: parsed.data.message,
        password: parsed.data.password ?? null,
        algorithm: parsed.data.algorithm ?? null,
        kind: parsed.data.kind,
        recipe: parsed.data.recipe ?? null,
        salt: parsed.data.salt ?? null,
        candidates: parsed.data.candidates,
        elapsed: parsed.data.elapsed,
        tolerant: parsed.data.tolerant,
        missingPosition: parsed.data.missing_position ?? null,
        missingChar: parsed.data.missing_char ?? null,
    };
}
