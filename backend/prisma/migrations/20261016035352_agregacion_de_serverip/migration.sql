/*
  Warnings:

  - Added the required column `serverip` to the `activities` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_activities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "lastDateRequest" DATETIME NOT NULL,
    "serverip" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_activities" ("createdAt", "id", "lastDateRequest", "userId") SELECT "createdAt", "id", "lastDateRequest", "userId" FROM "activities";
DROP TABLE "activities";
ALTER TABLE "new_activities" RENAME TO "activities";
CREATE UNIQUE INDEX "activities_userId_key" ON "activities"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
