-- CreateTable
CREATE TABLE "AnalyticsCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "landlordId" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AnalyticsAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "landlordId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsCache_cacheKey_key" ON "AnalyticsCache"("cacheKey");

-- CreateIndex
CREATE INDEX "AnalyticsCache_landlordId_idx" ON "AnalyticsCache"("landlordId");

-- CreateIndex
CREATE INDEX "AnalyticsCache_expiresAt_idx" ON "AnalyticsCache"("expiresAt");

-- CreateIndex
CREATE INDEX "AnalyticsAuditLog_landlordId_idx" ON "AnalyticsAuditLog"("landlordId");

-- CreateIndex
CREATE INDEX "AnalyticsAuditLog_createdAt_idx" ON "AnalyticsAuditLog"("createdAt");
