import { env } from "prisma/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    datasource: {
        url: env("DATABASE_URL"),
    },
    migrations: {
        seed: "tsx prisma/seed.ts",
    },
})