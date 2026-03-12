/*
  Warnings:

  - Added the required column `userCode` to the `Landlord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userCode` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Add userCode column with temporary default values for existing records
CREATE TABLE "new_Landlord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Landlord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy existing data and generate userCode for landlords
INSERT INTO "new_Landlord" ("address", "createdAt", "id", "phone", "updatedAt", "userId", "userCode")
SELECT "address", "createdAt", "id", "phone", "updatedAt", "userId",
       'LL' || substr('000' || (ROW_NUMBER() OVER (ORDER BY createdAt)), -3, 3)
FROM "Landlord";

DROP TABLE "Landlord";
ALTER TABLE "new_Landlord" RENAME TO "Landlord";
CREATE UNIQUE INDEX "Landlord_userId_key" ON "Landlord"("userId");
CREATE UNIQUE INDEX "Landlord_userCode_key" ON "Landlord"("userCode");

-- Add userCode column for tenants
CREATE TABLE "new_Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL DEFAULT '',
    "invitationStatus" TEXT NOT NULL DEFAULT 'none',
    "phone" TEXT NOT NULL,
    "idCard" TEXT,
    "address" TEXT,
    "roomId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Tenant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy existing data and generate userCode for tenants
INSERT INTO "new_Tenant" ("address", "createdAt", "id", "idCard", "invitationStatus", "landlordId", "phone", "roomId", "updatedAt", "userId", "userCode")
SELECT "address", "createdAt", "id", "idCard", "invitationStatus", "landlordId", "phone", "roomId", "updatedAt", "userId",
       'TN' || substr('000' || (ROW_NUMBER() OVER (ORDER BY createdAt)), -3, 3)
FROM "Tenant";

DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
CREATE UNIQUE INDEX "Tenant_userId_key" ON "Tenant"("userId");
CREATE UNIQUE INDEX "Tenant_userCode_key" ON "Tenant"("userCode");
CREATE UNIQUE INDEX "Tenant_roomId_key" ON "Tenant"("roomId");
CREATE INDEX "Tenant_landlordId_idx" ON "Tenant"("landlordId");
CREATE INDEX "Tenant_roomId_idx" ON "Tenant"("roomId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
