/*
  Warnings:

  - Added the required column `found` to the `activite_last_found_players` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_activite_last_found_players" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activityId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "found" BOOLEAN NOT NULL,
    "ip" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "serverip" TEXT NOT NULL,
    "servername" TEXT NOT NULL,
    CONSTRAINT "activite_last_found_players_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_activite_last_found_players" ("activityId", "id", "ip", "name", "password", "rank", "salt", "serverip", "servername") SELECT "activityId", "id", "ip", "name", "password", "rank", "salt", "serverip", "servername" FROM "activite_last_found_players";
DROP TABLE "activite_last_found_players";
ALTER TABLE "new_activite_last_found_players" RENAME TO "activite_last_found_players";
CREATE UNIQUE INDEX "activite_last_found_players_activityId_key" ON "activite_last_found_players"("activityId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
