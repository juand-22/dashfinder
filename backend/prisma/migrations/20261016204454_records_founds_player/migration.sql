-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_player_servers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serverId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT,
    "found" BOOLEAN NOT NULL DEFAULT false,
    "records_founds" INTEGER NOT NULL DEFAULT 0,
    "ip" TEXT,
    "password" TEXT,
    "salt" TEXT,
    "serverip" TEXT,
    "servername" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "player_servers_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_player_servers" ("createdAt", "found", "id", "ip", "name", "password", "rank", "salt", "serverId", "serverip", "servername", "updatedAt") SELECT "createdAt", "found", "id", "ip", "name", "password", "rank", "salt", "serverId", "serverip", "servername", "updatedAt" FROM "player_servers";
DROP TABLE "player_servers";
ALTER TABLE "new_player_servers" RENAME TO "player_servers";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
