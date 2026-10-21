import { prisma } from "../../lib/prisma";
import type { DehashBody } from "./dehash.schema";
import type {
    DehashAttempt,
    DehashCounts,
    DehashSearchResult,
    DehashStatus,
} from "./dehash.types";

export interface FoundCached {
    result: string | null;
}


function pedidoGuardado(
    userId: number,
    cacheKey: string,
    input: DehashBody,
    nombre: string | null,
) {
    return {
        userId,
        cacheKey,
        hash: input.hash,
        name: nombre || null,
    };
}

export async function createAttempt(
    userId: number,
    cacheKey: string,
    input: DehashBody,
    nombre: string | null,
): Promise<number | null> {
    try {
        const intento = await prisma.dehashResults.create({
            data: {
                ...pedidoGuardado(userId, cacheKey, input, nombre),
                status: "DEHASHING",
            },
            select: { id: true },
        });

        return intento.id;
    } catch (error) {
        console.error("No se pudo guardar el intento de dehash", error);
        return null;
    }
}

export async function createCachedFound(
    userId: number,
    cacheKey: string,
    input: DehashBody,
    nombre: string | null,
    guardado: FoundCached,
): Promise<number | null> {
    try {
        const intento = await prisma.dehashResults.create({
            data: {
                ...pedidoGuardado(userId, cacheKey, input, nombre),
                status: "FOUND",
                result: guardado.result,
                cached: true,
                candidates: 0,
                elapsed: 0,
            },
            select: { id: true },
        });

        return intento.id;
    } catch (error) {
        console.error("No se pudo guardar el intento cacheado", error);
        return null;
    }
}

export async function finishAttempt(
    id: number,
    status: DehashStatus,
    resultado: DehashSearchResult,
): Promise<void> {
    try {
        await prisma.dehashResults.update({
            where: { id },
            data: {
                status,
                result: resultado.password,
                algorithm: resultado.algorithm,
                recipe: resultado.recipe,
                candidates: resultado.candidates,
                elapsed: resultado.elapsed,
                tolerant: resultado.tolerant,
                missingPosition: resultado.missingPosition,
                missingChar: resultado.missingChar,
            },
        });
    } catch (error) {
        console.error("No se pudo cerrar el intento de dehash", error);
    }
}

export async function failAttempt(
    id: number,
    status: DehashStatus,
    mensaje: string,
): Promise<void> {
    try {
        await prisma.dehashResults.update({
            where: { id },
            data: { status, error: mensaje },
        });
    } catch (error) {
        console.error("No se pudo marcar el intento de dehash", error);
    }
}


export async function findFoundByCacheKey(
    cacheKey: string,
): Promise<FoundCached | null> {
    try {
        return await prisma.dehashResults.findFirst({
            where: { cacheKey, status: "FOUND", result: { not: null } },
            orderBy: { id: "desc" },
            select: { result: true },
        });
    } catch (error) {
        console.error("No se pudo buscar en el historial de dehash", error);
        return null;
    }
}


export interface AttemptsPage {
    attempts: DehashAttempt[];
    total: number;
}


export async function listAttempts(
    userId: number,
    limit: number,
    offset: number,
    name?: string,
): Promise<AttemptsPage> {
    const where = name ? { userId, name: { contains: name } } : { userId };

    const [filas, total] = await Promise.all([
        prisma.dehashResults.findMany({
            where,
            orderBy: { id: "desc" },
            skip: offset,
            take: limit,
            select: {
                id: true,
                hash: true,
                name: true,
                result: true,
                status: true,
            },
        }),
        prisma.dehashResults.count({ where }),
    ]);

    return {
        attempts: filas.map((fila) => ({
            ...fila,
            status: fila.status as DehashStatus,
        })),
        total,
    };
}


export async function listAttemptsByName(
    userId: number,
    name: string,
): Promise<DehashAttempt[]> {
    const filas = await prisma.dehashResults.findMany({
        where: { userId, name },
        orderBy: { id: "desc" },
        select: {
            id: true,
            hash: true,
            name: true,
            result: true,
            status: true,
        },
    });

    return filas.map((fila) => ({
        ...fila,
        status: fila.status as DehashStatus,
    }));
}

export async function countByStatus(userId: number): Promise<DehashCounts> {
    const counts: DehashCounts = {
        DEHASHING: 0,
        FOUND: 0,
        NOT_FOUND: 0,
        SERVER_ERROR: 0,
        INVALID: 0,
    };

    const grupos = await prisma.dehashResults.groupBy({
        by: ["status"],
        where: { userId },
        _count: { _all: true },
    });

    for (const grupo of grupos) {
        const status = grupo.status as DehashStatus;

        if (status in counts) {
            counts[status] = grupo._count._all;
        }
    }

    return counts;
}


export async function markRunningAsFailed(): Promise<number> {
    const { count } = await prisma.dehashResults.updateMany({
        where: { status: "DEHASHING" },
        data: {
            status: "SERVER_ERROR",
            error: "Se cortó: el servidor se reinició en medio del dehash.",
        },
    });

    return count;
}
