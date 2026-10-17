-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_activite_last_players" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activityId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "found" BOOLEAN NOT NULL DEFAULT false,
    "records_founds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activite_last_players_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_activite_last_players" ("activityId", "createdAt", "found", "id", "name", "rank") SELECT "activityId", "createdAt", "found", "id", "name", "rank" FROM "activite_last_players";
DROP TABLE "activite_last_players";
ALTER TABLE "new_activite_last_players" RENAME TO "activite_last_players";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
