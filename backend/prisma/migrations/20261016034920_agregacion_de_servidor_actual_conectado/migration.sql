/*
  Warnings:

  - Added the required column `ip` to the `player_servers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `player_servers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salt` to the `player_servers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serverip` to the `player_servers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servername` to the `player_servers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "activities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "lastDateRequest" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activite_last_players" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activityId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activite_last_players_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activite_last_found_players" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activityId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "serverip" TEXT NOT NULL,
    "servername" TEXT NOT NULL,
    CONSTRAINT "activite_last_found_players_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_player_servers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serverId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT,
    "ip" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "serverip" TEXT NOT NULL,
    "servername" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "player_servers_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_player_servers" ("createdAt", "id", "name", "rank", "serverId", "updatedAt") SELECT "createdAt", "id", "name", "rank", "serverId", "updatedAt" FROM "player_servers";
DROP TABLE "player_servers";
ALTER TABLE "new_player_servers" RENAME TO "player_servers";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "activities_userId_key" ON "activities"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "activite_last_players_activityId_key" ON "activite_last_players"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "activite_last_found_players_activityId_key" ON "activite_last_found_players"("activityId");
