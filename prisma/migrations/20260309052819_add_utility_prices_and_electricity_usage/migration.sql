-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Building" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "landlordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "electricityPrice" REAL NOT NULL DEFAULT 3000,
    "waterPrice" REAL NOT NULL DEFAULT 50000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Building_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "Landlord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Building" ("address", "createdAt", "description", "id", "landlordId", "name", "updatedAt") SELECT "address", "createdAt", "description", "id", "landlordId", "name", "updatedAt" FROM "Building";
DROP TABLE "Building";
ALTER TABLE "new_Building" RENAME TO "Building";
CREATE INDEX "Building_landlordId_idx" ON "Building"("landlordId");
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "rentAmount" REAL NOT NULL,
    "electricityUsage" REAL NOT NULL DEFAULT 0,
    "electricityAmount" REAL NOT NULL DEFAULT 0,
    "waterAmount" REAL NOT NULL DEFAULT 0,
    "serviceAmount" REAL NOT NULL DEFAULT 0,
    "otherAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "description" TEXT,
    "dueDate" DATETIME,
    "paidDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("createdAt", "description", "dueDate", "electricityAmount", "id", "month", "otherAmount", "paidDate", "rentAmount", "serviceAmount", "status", "tenantId", "totalAmount", "updatedAt", "waterAmount", "year") SELECT "createdAt", "description", "dueDate", "electricityAmount", "id", "month", "otherAmount", "paidDate", "rentAmount", "serviceAmount", "status", "tenantId", "totalAmount", "updatedAt", "waterAmount", "year" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE INDEX "Invoice_tenantId_idx" ON "Invoice"("tenantId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
CREATE UNIQUE INDEX "Invoice_tenantId_month_year_key" ON "Invoice"("tenantId", "month", "year");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
