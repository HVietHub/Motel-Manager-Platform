/*
  Warnings:

  - You are about to drop the column `landlordId` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `contractId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `electricityPrice` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `landlordId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `otherFees` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `paid` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `roomPrice` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `waterPrice` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `landlordId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `read` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `Tenant` table. All the data in the column will be lost.
  - Added the required column `rentAmount` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rentAmount` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomNumber` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `landlordId` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "rentAmount" REAL NOT NULL,
    "depositAmount" REAL NOT NULL DEFAULT 0,
    "terms" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Contract" ("createdAt", "endDate", "id", "roomId", "startDate", "status", "tenantId", "updatedAt") SELECT "createdAt", "endDate", "id", "roomId", "startDate", "status", "tenantId", "updatedAt" FROM "Contract";
DROP TABLE "Contract";
ALTER TABLE "new_Contract" RENAME TO "Contract";
CREATE INDEX "Contract_roomId_idx" ON "Contract"("roomId");
CREATE INDEX "Contract_tenantId_idx" ON "Contract"("tenantId");
CREATE INDEX "Contract_status_idx" ON "Contract"("status");
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "rentAmount" REAL NOT NULL,
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
INSERT INTO "new_Invoice" ("createdAt", "id", "month", "paidDate", "tenantId", "updatedAt", "year") SELECT "createdAt", "id", "month", "paidDate", "tenantId", "updatedAt", "year" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE INDEX "Invoice_tenantId_idx" ON "Invoice"("tenantId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
CREATE UNIQUE INDEX "Invoice_tenantId_month_year_key" ON "Invoice"("tenantId", "month", "year");
CREATE TABLE "new_MaintenanceRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaintenanceRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceRequest_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MaintenanceRequest" ("createdAt", "description", "id", "roomId", "status", "tenantId", "title", "updatedAt") SELECT "createdAt", "description", "id", "roomId", "status", "tenantId", "title", "updatedAt" FROM "MaintenanceRequest";
DROP TABLE "MaintenanceRequest";
ALTER TABLE "new_MaintenanceRequest" RENAME TO "MaintenanceRequest";
CREATE INDEX "MaintenanceRequest_tenantId_idx" ON "MaintenanceRequest"("tenantId");
CREATE INDEX "MaintenanceRequest_roomId_idx" ON "MaintenanceRequest"("roomId");
CREATE INDEX "MaintenanceRequest_status_idx" ON "MaintenanceRequest"("status");
CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("createdAt", "id", "message", "tenantId", "title") SELECT "createdAt", "id", "message", "tenantId", "title" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE INDEX "Notification_tenantId_idx" ON "Notification"("tenantId");
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");
CREATE TABLE "new_Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "floor" INTEGER NOT NULL DEFAULT 1,
    "area" REAL NOT NULL,
    "price" REAL NOT NULL,
    "deposit" REAL NOT NULL DEFAULT 0,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Room_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Room" ("area", "buildingId", "createdAt", "description", "id", "price", "status", "updatedAt") SELECT "area", "buildingId", "createdAt", "description", "id", "price", "status", "updatedAt" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE INDEX "Room_buildingId_idx" ON "Room"("buildingId");
CREATE INDEX "Room_status_idx" ON "Room"("status");
CREATE UNIQUE INDEX "Room_buildingId_roomNumber_key" ON "Room"("buildingId", "roomNumber");
CREATE TABLE "new_Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "idCard" TEXT,
    "address" TEXT,
    "roomId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Tenant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tenant" ("createdAt", "id", "idCard", "phone", "roomId", "updatedAt", "userId") SELECT "createdAt", "id", "idCard", "phone", "roomId", "updatedAt", "userId" FROM "Tenant";
DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
CREATE UNIQUE INDEX "Tenant_userId_key" ON "Tenant"("userId");
CREATE UNIQUE INDEX "Tenant_roomId_key" ON "Tenant"("roomId");
CREATE INDEX "Tenant_landlordId_idx" ON "Tenant"("landlordId");
CREATE INDEX "Tenant_roomId_idx" ON "Tenant"("roomId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
