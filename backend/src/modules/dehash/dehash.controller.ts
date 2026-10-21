import type { Response } from "express";
import type { ZodError } from "zod";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import { DehashErrors, sendDehashError } from "./dehash.errors";
import { dehashHistoryQuerySchema, dehashBodySchema } from "./dehash.schema";
import { dehash, listDehashes, listDehashesByName } from "./dehash.service";


function mensajeDeBody(error: ZodError): string {
    const issue = error.issues[0];

    if (!issue) {
        return "Mandá el hash a dehashear en el campo `hash`.";
    }

    if (issue.code === "unrecognized_keys") {
        const sobran = issue.keys.map((clave) => `\`${clave}\``).join(", ");

        return (
            `Solo se puede mandar \`hash\` y \`name\`: sobra ${sobran}. ` +
            "Si el hash tiene sal, mandá todo junto en `hash` " +
            "(`hash:sal` o `ALGO$sal$hash`)."
        );
    }

    return issue.message;
}

function userIdDe(req: AuthRequest, res: Response): number | null {
    const userId = req.user?.userId;

    if (!userId) {
        sendDehashError(res, DehashErrors.unauthorized());
        return null;
    }

    return userId;
}


export async function dehashController(req: AuthRequest, res: Response) {
    const userId = userIdDe(req, res);

    if (!userId) {
        return;
    }

    const parsed = dehashBodySchema.safeParse(req.body);

    if (!parsed.success) {
        return sendDehashError(
            res,
            DehashErrors.invalidHash(mensajeDeBody(parsed.error)),
        );
    }

    try {
        return res.json(await dehash(parsed.data, userId));
    } catch (error) {
        return sendDehashError(res, error);
    }
}


export async function dehashByNameController(req: AuthRequest, res: Response) {
    const userId = userIdDe(req, res);

    if (!userId) {
        return;
    }

    const name = typeof req.query.name === "string" ? req.query.name.trim() : "";

    if (!name || name.length > 100) {
        return sendDehashError(res, DehashErrors.invalidName());
    }

    try {
        return res.json(await listDehashesByName(userId, name));
    } catch (error) {
        return sendDehashError(res, error);
    }
}


export async function dehashResultsController(req: AuthRequest, res: Response) {
    const userId = userIdDe(req, res);

    if (!userId) {
        return;
    }

    const parsed = dehashHistoryQuerySchema.safeParse(req.query);
    const query = parsed.success
        ? parsed.data
        : { limit: 100, offset: 0, name: undefined };

    try {
        return res.json(await listDehashes(userId, query));
    } catch (error) {
        return sendDehashError(res, error);
    }
}
