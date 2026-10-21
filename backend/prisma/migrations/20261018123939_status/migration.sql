/*
  Warnings:

  - You are about to drop the column `found` on the `dehash_results` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_dehash_results" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DEHASHING',
    "result" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dehash_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_dehash_results" ("createdAt", "hash", "id", "result", "updatedAt", "userId") SELECT "createdAt", "hash", "id", "result", "updatedAt", "userId" FROM "dehash_results";
DROP TABLE "dehash_results";
ALTER TABLE "new_dehash_results" RENAME TO "dehash_results";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
