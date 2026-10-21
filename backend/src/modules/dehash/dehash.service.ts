import { requestDehash } from "./dehash.client";
import { DehashError, DehashErrors } from "./dehash.errors";
import * as dehashRepository from "./dehash.repository";
import type { DehashBody, DehashHistoryQuery } from "./dehash.schema";
import type { DehashPage, DehashAttempt, DehashResult, DehashStatus } from "./dehash.types";

export async function dehash(
    input: DehashBody,
    userId: number,
): Promise<DehashResult> {
    const cacheKey = buildCacheKey(input.hash);
    const nombre = input.name || null;
    const guardado = await dehashRepository.findFoundByCacheKey(cacheKey);

    if (guardado?.result) {
        await dehashRepository.createCachedFound(
            userId,
            cacheKey,
            input,
            nombre,
            guardado,
        );

        return {
            found: true,
            message: "encontrada (ya estaba en el historial)",
            password: guardado.result,
            status: "FOUND",
            name: nombre,
            hash: input.hash,
        };
    }

    const id = await dehashRepository.createAttempt(
        userId,
        cacheKey,
        input,
        nombre,
    );

    try {
        const resultado = await requestDehash(input.hash);
        const status: DehashStatus = resultado.found ? "FOUND" : "NOT_FOUND";

        if (id !== null) {
            await dehashRepository.finishAttempt(id, status, resultado);
        }

        return {
            found: resultado.found,
            message: resultado.message,
            password: resultado.password,
            status,
            name: nombre,
            hash: input.hash,
        };
    } catch (error) {
        const status: DehashStatus = esPedidoInvalido(error)
            ? "INVALID"
            : "SERVER_ERROR";

        if (id !== null) {
            await dehashRepository.failAttempt(id, status, mensajeDe(error));
        }

        throw DehashErrors.conIntento(error, id, status);
    }
}

export async function listDehashes(
    userId: number,
    query: DehashHistoryQuery,
): Promise<DehashPage> {
    const [page, counts] = await Promise.all([
        dehashRepository.listAttempts(
            userId,
            query.limit,
            query.offset,
            query.name,
        ),
        dehashRepository.countByStatus(userId),
    ]);

    return { items: page.attempts, total: page.total, counts };
}

export async function listDehashesByName(
    userId: number,
    name: string,
): Promise<DehashAttempt[]> {
    return dehashRepository.listAttemptsByName(userId, name);
}

export async function sweepStaleDehashes(): Promise<void> {
    try {
        const cantidad = await dehashRepository.markRunningAsFailed();

        if (cantidad > 0) {
            console.log(
                `Dehash interrumpidos marcados como SERVER_ERROR: ${cantidad}`,
            );
        }
    } catch (error) {
        console.error("No se pudo limpiar los dehash interrumpidos", error);
    }
}

function buildCacheKey(hash: string): string {
    return `${normalizarHex(hash)}|`;
}

function normalizarHex(valor: string): string {
    const limpio = valor.trim();

    return /^[0-9a-fA-F]+$/.test(limpio) ? limpio.toLowerCase() : limpio;
}

function esPedidoInvalido(error: unknown): boolean {
    return error instanceof DehashError && error.code === "INVALID_HASH";
}

function mensajeDe(error: unknown): string {
    return error instanceof Error ? error.message : "Error desconocido";
}
