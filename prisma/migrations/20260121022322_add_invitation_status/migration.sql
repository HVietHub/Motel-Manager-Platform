-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
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
INSERT INTO "new_Tenant" ("address", "createdAt", "id", "idCard", "landlordId", "phone", "roomId", "updatedAt", "userId") SELECT "address", "createdAt", "id", "idCard", "landlordId", "phone", "roomId", "updatedAt", "userId" FROM "Tenant";
DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
CREATE UNIQUE INDEX "Tenant_userId_key" ON "Tenant"("userId");
CREATE UNIQUE INDEX "Tenant_roomId_key" ON "Tenant"("roomId");
CREATE INDEX "Tenant_landlordId_idx" ON "Tenant"("landlordId");
CREATE INDEX "Tenant_roomId_idx" ON "Tenant"("roomId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
