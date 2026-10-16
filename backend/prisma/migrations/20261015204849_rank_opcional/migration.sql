-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_player_servers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serverId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "player_servers_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_player_servers" ("createdAt", "id", "name", "rank", "serverId", "updatedAt") SELECT "createdAt", "id", "name", "rank", "serverId", "updatedAt" FROM "player_servers";
DROP TABLE "player_servers";
ALTER TABLE "new_player_servers" RENAME TO "player_servers";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
