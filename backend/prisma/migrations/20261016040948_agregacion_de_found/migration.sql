-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_activite_last_found_players" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activityId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "found" BOOLEAN NOT NULL DEFAULT false,
    "ip" TEXT,
    "password" TEXT,
    "salt" TEXT,
    "serverip" TEXT,
    "servername" TEXT,
    CONSTRAINT "activite_last_found_players_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_activite_last_found_players" ("activityId", "found", "id", "ip", "name", "password", "rank", "salt", "serverip", "servername") SELECT "activityId", "found", "id", "ip", "name", "password", "rank", "salt", "serverip", "servername" FROM "activite_last_found_players";
DROP TABLE "activite_last_found_players";
ALTER TABLE "new_activite_last_found_players" RENAME TO "activite_last_found_players";
CREATE UNIQUE INDEX "activite_last_found_players_activityId_key" ON "activite_last_found_players"("activityId");
CREATE TABLE "new_player_servers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serverId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT,
    "found" BOOLEAN NOT NULL DEFAULT false,
    "ip" TEXT,
    "password" TEXT,
    "salt" TEXT,
    "serverip" TEXT,
    "servername" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "player_servers_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_player_servers" ("createdAt", "id", "ip", "name", "password", "rank", "salt", "serverId", "serverip", "servername", "updatedAt") SELECT "createdAt", "id", "ip", "name", "password", "rank", "salt", "serverId", "serverip", "servername", "updatedAt" FROM "player_servers";
DROP TABLE "player_servers";
ALTER TABLE "new_player_servers" RENAME TO "player_servers";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
