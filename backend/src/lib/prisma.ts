import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import env from "../config/env";

//para usar pg o alguna otra db instalar el adapter de la db


const adapter = new PrismaBetterSqlite3({
    url: env.DATABASE_URL
});


export const prisma = new PrismaClient({ adapter });