-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_dehash_results" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL DEFAULT '',
    "salt" TEXT,
    "algo" TEXT,
    "recipes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DEHASHING',
    "result" TEXT,
    "error" TEXT,
    "algorithm" TEXT,
    "recipe" TEXT,
    "candidates" INTEGER,
    "elapsed" REAL,
    "tolerant" BOOLEAN NOT NULL DEFAULT false,
    "missingPosition" INTEGER,
    "missingChar" TEXT,
    "cached" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dehash_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_dehash_results" ("createdAt", "hash", "id", "result", "status", "updatedAt", "userId") SELECT "createdAt", "hash", "id", "result", "status", "updatedAt", "userId" FROM "dehash_results";
DROP TABLE "dehash_results";
ALTER TABLE "new_dehash_results" RENAME TO "dehash_results";
CREATE INDEX "dehash_results_cacheKey_idx" ON "dehash_results"("cacheKey");
CREATE INDEX "dehash_results_userId_createdAt_idx" ON "dehash_results"("userId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Filas viejas: si ya tienen resultado guardado, en realidad se encontró, y su
-- clave de caché es su propio hash sin sal aparte (salía dentro del hash).
UPDATE "dehash_results"
SET "cacheKey" = "hash" || '|', "status" = 'FOUND'
WHERE "result" IS NOT NULL;
