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
    "hashedPassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activite_last_players_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_activite_last_players" ("activityId", "createdAt", "found", "id", "name", "rank", "records_founds") SELECT "activityId", "createdAt", "found", "id", "name", "rank", "records_founds" FROM "activite_last_players";
DROP TABLE "activite_last_players";
ALTER TABLE "new_activite_last_players" RENAME TO "activite_last_players";
CREATE TABLE "new_player_servers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serverId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT,
    "found" BOOLEAN NOT NULL DEFAULT false,
    "records_founds" INTEGER NOT NULL DEFAULT 0,
    "hashedPassword" BOOLEAN NOT NULL DEFAULT false,
    "ip" TEXT,
    "password" TEXT,
    "salt" TEXT,
    "serverip" TEXT,
    "servername" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "player_servers_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_player_servers" ("createdAt", "found", "id", "ip", "name", "password", "rank", "records_founds", "salt", "serverId", "serverip", "servername", "updatedAt") SELECT "createdAt", "found", "id", "ip", "name", "password", "rank", "records_founds", "salt", "serverId", "serverip", "servername", "updatedAt" FROM "player_servers";
DROP TABLE "player_servers";
ALTER TABLE "new_player_servers" RENAME TO "player_servers";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
